import { NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/drive/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // userId

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/settings?error=missing_params', process.env.NEXT_PUBLIC_APP_URL!)
    );
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const admin = getSupabaseAdmin();

    // Upsert the integration
    await (admin.from('user_integrations') as any).upsert(
      {
        user_id: state,
        provider: 'google_drive',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: Date.now() + tokens.expires_in * 1000,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,provider',
      }
    );

    return NextResponse.redirect(
      new URL('/settings?drive=connected', process.env.NEXT_PUBLIC_APP_URL!)
    );
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/settings?error=oauth_failed', process.env.NEXT_PUBLIC_APP_URL!)
    );
  }
}
