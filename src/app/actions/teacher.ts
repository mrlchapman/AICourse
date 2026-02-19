'use server';

import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { nanoid } from 'nanoid';

/**
 * Publish a course (make it available for students)
 */
export async function publishCourse(courseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const admin = getSupabaseAdmin();

  // Get user profile
  const { data: profile } = await (admin
    .from('users') as any)
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (!profile) return { error: 'Profile not found' };

  // Fetch course and verify ownership
  const { data: course } = await (admin
    .from('courses') as any)
    .select('id, user_id')
    .eq('id', courseId)
    .single();

  if (!course) return { error: 'Course not found' };
  if (course.user_id !== profile.id) return { error: 'Not authorized' };

  const { error } = await (admin
    .from('courses') as any)
    .update({
      is_hosted: true,
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .eq('id', courseId);

  if (error) return { error: error.message };
  revalidatePath('/');
  revalidatePath('/courses');
  return { success: true };
}

/**
 * Unpublish a course
 */
export async function unpublishCourse(courseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const admin = getSupabaseAdmin();

  // Get user profile
  const { data: profile } = await (admin
    .from('users') as any)
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (!profile) return { error: 'Profile not found' };

  // Fetch course and verify ownership
  const { data: course } = await (admin
    .from('courses') as any)
    .select('id, user_id')
    .eq('id', courseId)
    .single();

  if (!course) return { error: 'Course not found' };
  if (course.user_id !== profile.id) return { error: 'Not authorized' };

  const { error } = await (admin
    .from('courses') as any)
    .update({
      is_hosted: false,
      status: 'draft',
    })
    .eq('id', courseId);

  if (error) return { error: error.message };
  revalidatePath('/');
  revalidatePath('/courses');
  return { success: true };
}

/**
 * Generate an invite code for a course
 */
export async function generateInviteCode(
  courseId: string,
  options?: { maxUses?: number; expiresInDays?: number }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const admin = getSupabaseAdmin();
  const { data: profile } = await (admin
    .from('users') as any)
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (!profile) return { error: 'Profile not found' };

  const code = nanoid(8).toUpperCase();
  const expiresAt = options?.expiresInDays
    ? new Date(Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
    : null;

  const { data: invite, error } = await supabase
    .from('course_invites')
    .insert({
      course_id: courseId,
      code,
      created_by: profile.id,
      max_uses: options?.maxUses || null,
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { success: true, invite };
}

/**
 * Get all invite codes for a course
 */
export async function getInviteCodes(courseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated', invites: [] };

  const { data: invites, error } = await supabase
    .from('course_invites')
    .select('*')
    .eq('course_id', courseId)
    .order('created_at', { ascending: false });

  if (error) return { error: error.message, invites: [] };
  return { invites: invites || [] };
}

/**
 * Delete an invite code
 */
export async function deleteInviteCode(inviteId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const admin = getSupabaseAdmin();

  // Get user profile
  const { data: profile } = await (admin
    .from('users') as any)
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (!profile) return { error: 'Profile not found' };

  // Look up the invite to find its course_id
  const { data: invite } = await (admin
    .from('course_invites') as any)
    .select('id, course_id')
    .eq('id', inviteId)
    .single();

  if (!invite) return { error: 'Invite not found' };

  // Verify the user owns the course this invite belongs to
  const { data: course } = await (admin
    .from('courses') as any)
    .select('id, user_id')
    .eq('id', invite.course_id)
    .single();

  if (!course) return { error: 'Course not found' };
  if (course.user_id !== profile.id) return { error: 'Not authorized' };

  const { error } = await (admin
    .from('course_invites') as any)
    .delete()
    .eq('id', inviteId);

  if (error) return { error: error.message };
  return { success: true };
}

/**
 * Get students enrolled in a course (with full analytics data)
 */
export async function getCourseStudents(courseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated', students: [] };

  const admin = getSupabaseAdmin();

  // Get user profile
  const { data: profile } = await (admin
    .from('users') as any)
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (!profile) return { error: 'Profile not found', students: [] };

  // Fetch course and verify ownership
  const { data: course } = await (admin
    .from('courses') as any)
    .select('id, user_id')
    .eq('id', courseId)
    .single();

  if (!course) return { error: 'Course not found', students: [] };
  if (course.user_id !== profile.id) return { error: 'Not authorized', students: [] };

  const { data: enrollments, error } = await (admin
    .from('course_enrollments') as any)
    .select(`
      id,
      status,
      progress,
      responses,
      final_score,
      total_time_spent,
      time_to_complete,
      revisits,
      last_device,
      joined_at,
      last_accessed_at,
      completed_at,
      student_id
    `)
    .eq('course_id', courseId)
    .order('joined_at', { ascending: false }) as { data: any; error: any };

  if (error) return { error: error.message, students: [] };

  // Get student profiles
  const studentIds = (enrollments || []).map((e: any) => e.student_id);
  if (studentIds.length === 0) return { students: [] };

  const { data: profiles } = await (admin
    .from('users') as any)
    .select('id, display_name, email, avatar_url')
    .in('id', studentIds) as { data: any };

  const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

  const students = (enrollments || []).map((enrollment: any) => ({
    ...enrollment,
    student: profileMap.get(enrollment.student_id) || null,
  }));

  return { students };
}

/**
 * Get aggregate stats across all teacher's courses
 */
export async function getTeacherStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const admin = getSupabaseAdmin();
  const { data: profile } = await (admin
    .from('users') as any)
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (!profile) return { error: 'Profile not found' };

  // Get all courses by this teacher
  const { data: courses } = await (admin
    .from('courses') as any)
    .select('id, title, is_hosted, status, created_at')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false });

  if (!courses || courses.length === 0) {
    return { courses: [], totalStudents: 0, totalCompleted: 0, avgScore: 0 };
  }

  const courseIds = courses.map((c: any) => c.id);

  // Get all enrollments across teacher's courses
  const { data: enrollments } = await (admin
    .from('course_enrollments') as any)
    .select('id, course_id, status, final_score, total_time_spent')
    .in('course_id', courseIds) as { data: any };

  const allEnrollments = enrollments || [];
  const totalStudents = allEnrollments.length;
  const completedStudents = allEnrollments.filter((e: any) =>
    e.status === 'completed' || e.status === 'passed'
  ).length;
  const scoredStudents = allEnrollments.filter((e: any) => e.final_score !== null);
  const avgScore = scoredStudents.length > 0
    ? Math.round(scoredStudents.reduce((sum: number, e: any) => sum + e.final_score, 0) / scoredStudents.length)
    : 0;
  const avgTimeSpent = allEnrollments.length > 0
    ? Math.round(allEnrollments.reduce((sum: number, e: any) => sum + (e.total_time_spent || 0), 0) / allEnrollments.length)
    : 0;

  // Per-course stats
  const courseStats = courses.map((course: any) => {
    const courseEnrollments = allEnrollments.filter((e: any) => e.course_id === course.id);
    const courseCompleted = courseEnrollments.filter((e: any) =>
      e.status === 'completed' || e.status === 'passed'
    ).length;
    const courseScored = courseEnrollments.filter((e: any) => e.final_score !== null);
    const courseAvgScore = courseScored.length > 0
      ? Math.round(courseScored.reduce((s: number, e: any) => s + e.final_score, 0) / courseScored.length)
      : null;

    return {
      ...course,
      enrolled: courseEnrollments.length,
      completed: courseCompleted,
      completionRate: courseEnrollments.length > 0
        ? Math.round((courseCompleted / courseEnrollments.length) * 100)
        : 0,
      avgScore: courseAvgScore,
    };
  });

  return {
    courses: courseStats,
    totalStudents,
    totalCompleted: completedStudents,
    completionRate: totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0,
    avgScore,
    avgTimeSpent,
  };
}

/**
 * Update course deadline settings
 */
export async function updateCourseDeadlines(
  courseId: string,
  settings: {
    has_deadline: boolean;
    course_deadline?: string | null;
    submission_deadline?: string | null;
  }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const admin = getSupabaseAdmin();

  // Get user profile
  const { data: profile } = await (admin
    .from('users') as any)
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (!profile) return { error: 'Profile not found' };

  // Fetch course and verify ownership
  const { data: course } = await (admin
    .from('courses') as any)
    .select('id, user_id')
    .eq('id', courseId)
    .single();

  if (!course) return { error: 'Course not found' };
  if (course.user_id !== profile.id) return { error: 'Not authorized' };

  const { error } = await (admin
    .from('courses') as any)
    .update({
      has_deadline: settings.has_deadline,
      course_deadline: settings.course_deadline || null,
      submission_deadline: settings.submission_deadline || null,
    })
    .eq('id', courseId);

  if (error) return { error: error.message };
  return { success: true };
}

/**
 * Remove a student from a course
 */
export async function removeStudent(enrollmentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const admin = getSupabaseAdmin();

  // Get user profile
  const { data: profile } = await (admin
    .from('users') as any)
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (!profile) return { error: 'Profile not found' };

  // Look up the enrollment to find its course_id
  const { data: enrollment } = await (admin
    .from('course_enrollments') as any)
    .select('id, course_id')
    .eq('id', enrollmentId)
    .single() as { data: any };

  if (!enrollment) return { error: 'Enrollment not found' };

  // Verify the user owns the course this enrollment belongs to
  const { data: course } = await (admin
    .from('courses') as any)
    .select('id, user_id')
    .eq('id', enrollment.course_id)
    .single();

  if (!course) return { error: 'Course not found' };
  if (course.user_id !== profile.id) return { error: 'Not authorized' };

  const { error } = await (admin
    .from('course_enrollments') as any)
    .delete()
    .eq('id', enrollmentId) as { error: any };

  if (error) return { error: error.message };
  return { success: true };
}
