'use server';

import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';

/**
 * Ensures a profile row exists in the users table.
 * Handles cases where the DB trigger didn't fire.
 */
async function ensureProfile(authUserId: string, email: string, displayName?: string, role?: string) {
  const admin = getSupabaseAdmin();
  const { data: existing } = await (admin
    .from('users') as any)
    .select('id')
    .eq('auth_user_id', authUserId)
    .single();

  if (!existing) {
    await (admin.from('users') as any).insert({
      auth_user_id: authUserId,
      email,
      display_name: displayName || email.split('@')[0],
      role: role || 'teacher',
    });
  }
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const displayName = formData.get('displayName') as string;
  const rawRole = (formData.get('role') as string) || 'teacher';
  const allowedRoles = ['teacher', 'student'];
  const role = allowedRoles.includes(rawRole) ? rawRole : 'teacher';
  const rawRedirect = (formData.get('redirect') as string) || '/';
  const redirectTo = (rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') && !rawRedirect.includes('://')) ? rawRedirect : '/';

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        role,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // If user was auto-confirmed (no email confirmation required), create profile now
  if (data.user && !data.user.identities?.length) {
    return { error: 'An account with this email already exists. Please sign in.' };
  }

  if (data.user) {
    await ensureProfile(data.user.id, email, displayName, role);
  }

  // If session exists, user was auto-confirmed - redirect
  if (data.session) {
    redirect(redirectTo);
  }

  return { success: true };
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const rawRedirect = (formData.get('redirect') as string) || '/';
  // Sanitize redirect to prevent open redirect
  const redirectTo = (rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') && !rawRedirect.includes('://')) ? rawRedirect : '/';

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Ensure profile exists (fallback if trigger didn't fire)
  if (data.user) {
    await ensureProfile(data.user.id, data.user.email || email);
  }

  redirect(redirectTo);
}

export async function signInWithGoogle(redirectTo?: string) {
  const supabase = await createClient();

  // Build callback URL with optional redirect
  let callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;
  if (redirectTo && redirectTo !== '/' && redirectTo.startsWith('/') && !redirectTo.startsWith('//') && !redirectTo.includes('://')) {
    callbackUrl += `?next=${encodeURIComponent(redirectTo)}`;
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callbackUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data?.url) {
    redirect(data.url);
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getUserProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Use admin client to bypass RLS for profile lookup
  const admin = getSupabaseAdmin();
  const { data: profile, error: selectError } = await (admin
    .from('users') as any)
    .select('*')
    .eq('auth_user_id', user.id)
    .single();

  if (selectError) {
    console.error('[getUserProfile] Select error:', JSON.stringify(selectError));
  }

  if (profile) return profile;

  // Self-heal: auth exists but no profile row - create one
  console.log('[getUserProfile] No profile found, creating for:', user.id, user.email);
  const { data: newProfile, error: insertError } = await (admin.from('users') as any).insert({
    auth_user_id: user.id,
    email: user.email,
    display_name: user.user_metadata?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
    role: user.user_metadata?.role || 'teacher',
  }).select('*').single();

  if (insertError) {
    console.error('[getUserProfile] Insert error:', JSON.stringify(insertError));
    return null;
  }

  return newProfile;
}
