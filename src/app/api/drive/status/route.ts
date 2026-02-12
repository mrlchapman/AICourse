import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ connected: false }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  const { data: integration } = await (admin
    .from('user_integrations') as any)
    .select('id, expires_at')
    .eq('user_id', user.id)
    .eq('provider', 'google_drive')
    .single() as { data: any };

  return NextResponse.json({
    connected: !!integration,
    expired: integration ? Date.now() > integration.expires_at : false,
  });
}
