import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { searchPexelsImages } from '@/lib/ai/pexels';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const query = request.nextUrl.searchParams.get('q');
  const perPage = parseInt(request.nextUrl.searchParams.get('per_page') || '12');

  if (!query) {
    return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
  }

  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Pexels API key not configured' }, { status: 500 });
  }

  try {
    const photos = await searchPexelsImages(query, apiKey, perPage);
    return NextResponse.json({ success: true, photos });
  } catch (error: any) {
    console.error('[API/Images] Search error:', error);
    return NextResponse.json(
      { error: 'Image search failed' },
      { status: 500 }
    );
  }
}
