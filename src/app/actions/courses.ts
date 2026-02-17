'use server';

import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { saveFile, loadFile } from '@/lib/drive/files';
import { ensureAppFolders } from '@/lib/drive/folders';
import { refreshTokenIfNeeded } from '@/lib/drive/auth';
import type { CourseContent } from '@/types/activities';

async function getDriveToken(userId: string) {
  const admin = getSupabaseAdmin();
  const { data: integration } = await (admin.from('user_integrations') as any)
    .select('*')
    .eq('user_id', userId)
    .eq('provider', 'google_drive')
    .single() as { data: any };

  if (!integration) return null;

  let token = integration.access_token;
  const newToken = await refreshTokenIfNeeded(
    token,
    integration.refresh_token,
    integration.expires_at,
    userId
  );
  if (newToken) token = newToken;

  return token;
}

export async function saveCourse(content: CourseContent, driveFileId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const token = await getDriveToken(user.id);
  if (!token) {
    return { error: 'Google Drive not connected' };
  }

  try {
    const folders = await ensureAppFolders(token, user.id);
    const fileName = `${content.title || 'Untitled'}.json`;
    const fileContent = JSON.stringify(content, null, 2);

    const fileId = await saveFile(
      token,
      fileName,
      fileContent,
      folders.coursesId,
      driveFileId
    );

    return { success: true, fileId };
  } catch (error) {
    console.error('Save error:', error);
    return { error: 'Failed to save course' };
  }
}

export async function loadCourse(driveFileId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const token = await getDriveToken(user.id);
  if (!token) {
    return { error: 'Google Drive not connected' };
  }

  try {
    const fileContent = await loadFile(token, driveFileId);
    const content: CourseContent = JSON.parse(fileContent);
    return { success: true, content };
  } catch (error) {
    console.error('Load error:', error);
    return { error: 'Failed to load course' };
  }
}

export async function createCourse(title: string = 'Untitled Course') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated' };

  // Get user's public profile ID (use admin to bypass RLS)
  const admin = getSupabaseAdmin();
  const { data: profile } = await (admin
    .from('users') as any)
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (!profile) return { error: 'Profile not found' };

  const content: CourseContent = {
    title,
    description: '',
    sections: [],
  };

  const { data: course, error } = await supabase
    .from('courses')
    .insert({
      user_id: profile.id,
      title,
      content,
      status: 'draft',
    })
    .select('id')
    .single();

  if (error) return { error: error.message };

  return { success: true, courseId: course.id };
}

export async function getCourse(courseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated' };

  const admin = getSupabaseAdmin();
  const { data: course, error } = await (admin
    .from('courses') as any)
    .select('*')
    .eq('id', courseId)
    .single();

  if (error) return { error: error.message };

  return { success: true, course };
}

export async function getUserCourses() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated', courses: [] };

  const admin = getSupabaseAdmin();
  const { data: profile } = await (admin
    .from('users') as any)
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (!profile) return { error: 'Profile not found', courses: [] };

  const { data: courses, error } = await (admin
    .from('courses') as any)
    .select('id, title, description, status, is_hosted, last_edited_at, created_at')
    .eq('user_id', profile.id)
    .order('last_edited_at', { ascending: false });

  if (error) return { error: error.message, courses: [] };

  return { courses: courses || [] };
}

export async function updateCourseContent(courseId: string, content: CourseContent) {
  const admin = getSupabaseAdmin();

  const { error } = await (admin
    .from('courses') as any)
    .update({
      content,
      title: content.title,
      last_edited_at: new Date().toISOString(),
    })
    .eq('id', courseId);

  if (error) return { error: error.message };

  return { success: true };
}

export async function duplicateCourse(courseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated' };

  // Get the original course
  const { course, error: fetchError } = await getCourse(courseId);
  if (fetchError || !course) return { error: fetchError || 'Course not found' };

  // Create new course with "(copy)" suffix
  const newTitle = `${course.title || 'Untitled'} (copy)`;
  const result = await createCourse(newTitle);
  if (result.error || !result.courseId) return { error: result.error || 'Failed to create copy' };

  // Deep clone the content and update it on the new course
  const clonedContent = JSON.parse(JSON.stringify(course.content)) as CourseContent;
  clonedContent.title = newTitle;
  const updateResult = await updateCourseContent(result.courseId, clonedContent);
  if (updateResult.error) return { error: updateResult.error };

  return { success: true, courseId: result.courseId };
}

export async function deleteCourse(courseId: string) {
  const admin = getSupabaseAdmin();

  const { error } = await (admin
    .from('courses') as any)
    .delete()
    .eq('id', courseId);

  if (error) return { error: error.message };

  return { success: true };
}
