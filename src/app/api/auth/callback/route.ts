import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const rawNext = searchParams.get('next') ?? '/';
  const next = (rawNext.startsWith('/') && !rawNext.startsWith('//') && !rawNext.includes('://')) ? rawNext : '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Ensure profile exists (handles Google OAuth where DB trigger may not fire)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const admin = getSupabaseAdmin();
        const { data: existing } = await (admin
          .from('users') as any)
          .select('id')
          .eq('auth_user_id', user.id)
          .single();

        if (!existing) {
          await (admin.from('users') as any).insert({
            auth_user_id: user.id,
            email: user.email,
            display_name: user.user_metadata?.full_name || user.user_metadata?.display_name || user.email?.split('@')[0],
            role: user.user_metadata?.role || 'teacher',
          });
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
