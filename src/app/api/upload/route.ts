import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parseDocument, cleanText } from '@/lib/ai/documentParser';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 20MB)' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-powerpoint',
      'text/plain',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Upload PDF, DOCX, PPTX, or TXT files.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { text, metadata } = await parseDocument(buffer, file.type);
    const cleaned = cleanText(text);

    if (!cleaned || cleaned.length < 50) {
      return NextResponse.json(
        { error: 'Could not extract enough text from the file. Try a different file.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      text: cleaned,
      metadata: {
        ...metadata,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        textLength: cleaned.length,
      },
    });
  } catch (error: any) {
    console.error('[API/Upload] Parse error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to parse document' },
      { status: 500 }
    );
  }
}
