import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { refreshTokenIfNeeded } from '@/lib/drive/auth';

export async function GET(request: NextRequest) {
  const fileId = request.nextUrl.searchParams.get('fileId');

  if (!fileId) {
    return NextResponse.json({ error: 'Missing fileId' }, { status: 400 });
  }

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

  let token = integration.access_token;
  const newToken = await refreshTokenIfNeeded(
    token,
    integration.refresh_token,
    integration.expires_at,
    user.id
  );
  if (newToken) token = newToken;

  try {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const contentType = res.headers.get('content-type') || 'application/octet-stream';
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Drive proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch file' }, { status: 500 });
  }
}
