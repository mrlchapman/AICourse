'use server';

import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

/**
 * Join a course using an invite code
 */
export async function joinCourse(code: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const admin = getSupabaseAdmin();
  const { data: profile } = await (admin
    .from('users') as any)
    .select('id, role')
    .eq('auth_user_id', user.id)
    .single();

  if (!profile) return { error: 'Profile not found' };

  // Find the invite code
  const { data: invite } = await (admin
    .from('course_invites') as any)
    .select('*')
    .eq('code', code.toUpperCase().trim())
    .single() as { data: any };

  if (!invite) return { error: 'Invalid invite code' };

  // Check expiry
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return { error: 'This invite code has expired' };
  }

  // Check max uses
  if (invite.max_uses && invite.uses >= invite.max_uses) {
    return { error: 'This invite code has reached its maximum uses' };
  }

  // Check if already enrolled
  const { data: existing } = await (admin
    .from('course_enrollments') as any)
    .select('id')
    .eq('course_id', invite.course_id)
    .eq('student_id', profile.id)
    .single() as { data: any };

  if (existing) return { error: 'You are already enrolled in this course' };

  // Create enrollment
  const { data: enrollment, error: enrollError } = await (admin
    .from('course_enrollments') as any)
    .insert({
      course_id: invite.course_id,
      student_id: profile.id,
      invite_id: invite.id,
      status: 'enrolled',
      progress: {},
      responses: [],
      total_time_spent: 0,
      revisits: 0,
    })
    .select('id')
    .single() as { data: any; error: any };

  if (enrollError) return { error: enrollError.message };

  // Atomically increment invite uses with optimistic lock
  // If another request incremented first, our update affects 0 rows
  // but the enrollment is already created so the student still gets in
  await (admin
    .from('course_invites') as any)
    .update({ uses: invite.uses + 1 })
    .eq('id', invite.id)
    .eq('uses', invite.uses);

  return { success: true, enrollmentId: enrollment.id, courseId: invite.course_id };
}

/**
 * Get enrolled courses for the current student
 */
export async function getEnrolledCourses() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated', enrollments: [] };

  const adminClient = getSupabaseAdmin();
  const { data: profile } = await (adminClient
    .from('users') as any)
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (!profile) return { error: 'Profile not found', enrollments: [] };

  const admin = getSupabaseAdmin();
  const { data: enrollments, error } = await (admin
    .from('course_enrollments') as any)
    .select('*')
    .eq('student_id', profile.id)
    .order('last_accessed_at', { ascending: false }) as { data: any; error: any };

  if (error) return { error: error.message, enrollments: [] };

  // Get course details for each enrollment
  const courseIds = (enrollments || []).map((e: any) => e.course_id);
  if (courseIds.length === 0) return { enrollments: [] };

  const { data: courses } = await (admin
    .from('courses') as any)
    .select('id, title, description, content, status, is_hosted')
    .in('id', courseIds) as { data: any };

  const courseMap = new Map((courses || []).map((c: any) => [c.id, c]));

  const enriched = (enrollments || []).map((enrollment: any) => ({
    ...enrollment,
    course: courseMap.get(enrollment.course_id) || null,
  }));

  return { enrollments: enriched };
}

/**
 * Get enrollment details for the course player
 */
export async function getEnrollment(enrollmentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const admin = getSupabaseAdmin();

  // Get user profile to verify enrollment ownership
  const { data: profile } = await (admin
    .from('users') as any)
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (!profile) return { error: 'Profile not found' };

  const { data: enrollment, error } = await (admin
    .from('course_enrollments') as any)
    .select('*')
    .eq('id', enrollmentId)
    .single() as { data: any; error: any };

  if (error || !enrollment) return { error: 'Enrollment not found' };

  // Verify the enrollment belongs to this student
  if (enrollment.student_id !== profile.id) return { error: 'Not authorized' };

  // Get course content
  const { data: course } = await (admin
    .from('courses') as any)
    .select('*')
    .eq('id', enrollment.course_id)
    .single() as { data: any };

  if (!course) return { error: 'Course not found' };

  // Update last accessed
  await (admin
    .from('course_enrollments') as any)
    .update({
      last_accessed_at: new Date().toISOString(),
      revisits: enrollment.revisits + 1,
    })
    .eq('id', enrollmentId);

  return { success: true, enrollment, course };
}

/**
 * Update student progress
 */
export async function updateProgress(
  enrollmentId: string,
  updates: {
    sectionId?: string;
    activityId?: string;
    completed?: boolean;
    score?: number;
    timeSpent?: number;
    response?: any;
  }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const admin = getSupabaseAdmin();

  // Get user profile to verify enrollment ownership
  const { data: profile } = await (admin
    .from('users') as any)
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (!profile) return { error: 'Profile not found' };

  // Get current enrollment
  const { data: enrollment } = await (admin
    .from('course_enrollments') as any)
    .select('*')
    .eq('id', enrollmentId)
    .single() as { data: any };

  if (!enrollment) return { error: 'Enrollment not found' };

  // Verify the enrollment belongs to this student
  if (enrollment.student_id !== profile.id) return { error: 'Not authorized' };

  const progress = enrollment.progress || {};
  const responses = enrollment.responses || [];

  // Update section/activity progress
  if (updates.sectionId) {
    if (!progress[updates.sectionId]) {
      progress[updates.sectionId] = { completed: false, activities: {} };
    }
    if (updates.activityId) {
      progress[updates.sectionId].activities[updates.activityId] = {
        completed: updates.completed || false,
        score: updates.score,
        timestamp: new Date().toISOString(),
      };
    }
    if (updates.completed) {
      progress[updates.sectionId].completed = true;
    }
  }

  // Add response
  if (updates.response) {
    responses.push({
      ...updates.response,
      timestamp: new Date().toISOString(),
    });
  }

  // Calculate total time
  const totalTimeSpent = enrollment.total_time_spent + (updates.timeSpent || 0);

  // Determine status
  let status = enrollment.status;
  if (status === 'enrolled') status = 'in_progress';

  const updateData: any = {
    progress,
    responses,
    total_time_spent: totalTimeSpent,
    status,
    current_activity_id: updates.activityId || enrollment.current_activity_id,
    last_accessed_at: new Date().toISOString(),
  };

  // Check if score should be updated
  if (updates.score !== undefined) {
    updateData.final_score = Math.max(enrollment.final_score || 0, updates.score);
  }

  const { error } = await (admin
    .from('course_enrollments') as any)
    .update(updateData)
    .eq('id', enrollmentId) as { error: any };

  if (error) return { error: error.message };
  return { success: true };
}

/**
 * Mark course as completed
 */
export async function completeCourse(enrollmentId: string, finalScore?: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const admin = getSupabaseAdmin();

  // Get user profile to verify enrollment ownership
  const { data: profile } = await (admin
    .from('users') as any)
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (!profile) return { error: 'Profile not found' };

  const { data: enrollment } = await (admin
    .from('course_enrollments') as any)
    .select('joined_at, total_time_spent, student_id')
    .eq('id', enrollmentId)
    .single() as { data: any };

  if (!enrollment) return { error: 'Enrollment not found' };

  // Verify the enrollment belongs to this student
  if (enrollment.student_id !== profile.id) return { error: 'Not authorized' };

  const now = new Date();
  const timeToComplete = Math.floor(
    (now.getTime() - new Date(enrollment.joined_at).getTime()) / 1000
  );

  const updateData: any = {
    status: finalScore !== undefined && finalScore >= 80 ? 'passed' : 'completed',
    completed_at: now.toISOString(),
    time_to_complete: timeToComplete,
  };

  if (finalScore !== undefined) {
    updateData.final_score = finalScore;
  }

  const { error } = await (admin
    .from('course_enrollments') as any)
    .update(updateData)
    .eq('id', enrollmentId) as { error: any };

  if (error) return { error: error.message };
  return { success: true };
}
