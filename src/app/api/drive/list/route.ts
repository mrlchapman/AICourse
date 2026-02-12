import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { ensureAppFolders } from '@/lib/drive/folders';
import { listFiles } from '@/lib/drive/files';
import { refreshTokenIfNeeded } from '@/lib/drive/auth';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  const { data: integration } = await (admin
    .from('user_integrations') as any)
    .select('*')
    .eq('user_id', user.id)
    .eq('provider', 'google_drive')
    .single() as { data: any };

  if (!integration) {
    return NextResponse.json({ error: 'Drive not connected' }, { status: 400 });
  }

  // Refresh token if needed
  let token = integration.access_token;
  const newToken = await refreshTokenIfNeeded(
    token,
    integration.refresh_token,
    integration.expires_at,
    user.id
  );
  if (newToken) token = newToken;

  try {
    const folders = await ensureAppFolders(token, user.id);
    const files = await listFiles(token, folders.coursesId);
    return NextResponse.json({ files });
  } catch (error) {
    console.error('Drive list error:', error);
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
  }
}
