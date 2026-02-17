'use server';

import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

async function getProfileId(authUserId: string) {
  const admin = getSupabaseAdmin();
  const { data: profile } = await (admin
    .from('users') as any)
    .select('id')
    .eq('auth_user_id', authUserId)
    .single();
  return profile?.id ?? null;
}

export async function saveTemplate(name: string, activityType: string, content: unknown) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const profileId = await getProfileId(user.id);
  if (!profileId) return { error: 'Profile not found' };

  const admin = getSupabaseAdmin();
  const { data, error } = await (admin
    .from('activity_templates') as any)
    .insert({
      user_id: profileId,
      name,
      activity_type: activityType,
      content,
      is_public: false,
    })
    .select('id')
    .single();

  if (error) return { error: error.message };
  return { success: true, templateId: data.id };
}

export async function getUserTemplates() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated', templates: [] };

  const profileId = await getProfileId(user.id);
  if (!profileId) return { error: 'Profile not found', templates: [] };

  const admin = getSupabaseAdmin();
  const { data: templates, error } = await (admin
    .from('activity_templates') as any)
    .select('id, name, activity_type, content, created_at')
    .eq('user_id', profileId)
    .order('created_at', { ascending: false });

  if (error) return { error: error.message, templates: [] };
  return { templates: templates || [] };
}

export async function deleteTemplate(templateId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const profileId = await getProfileId(user.id);
  if (!profileId) return { error: 'Profile not found' };

  const admin = getSupabaseAdmin();
  const { error } = await (admin
    .from('activity_templates') as any)
    .delete()
    .eq('id', templateId)
    .eq('user_id', profileId);

  if (error) return { error: error.message };
  return { success: true };
}
