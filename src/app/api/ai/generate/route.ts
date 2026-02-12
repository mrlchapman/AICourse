import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  generateCourseFromText,
  generateCourseOutline,
  generateSectionWithContext,
  generateActivityFromText,
} from '@/lib/ai/generator';
import type { GenerationOptions } from '@/lib/ai/generator';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, text, title, model, apiKey, activityTypes, sectionOutline, sectionIndex, context, activityType, subType } = body;

    // Use provided key, or fall back to env keys
    const selectedModel = model || 'gemini-2.5-flash';
    let resolvedKey = apiKey;
    if (!resolvedKey) {
      if (selectedModel.startsWith('gemini')) {
        resolvedKey = process.env.GEMINI_API_KEY;
      } else {
        resolvedKey = process.env.OPENAI_API_KEY;
      }
    }

    if (!resolvedKey) {
      return NextResponse.json({ error: 'API key is required. Add one in the field below or set GEMINI_API_KEY / OPENAI_API_KEY in .env.local' }, { status: 400 });
    }

    const options: GenerationOptions = {
      model: selectedModel,
      apiKey: resolvedKey,
      activityTypes,
    };

    switch (action) {
      case 'generate_course': {
        if (!text || !title) {
          return NextResponse.json({ error: 'Text and title are required' }, { status: 400 });
        }
        const course = await generateCourseFromText(text, title, options);
        return NextResponse.json({ success: true, course });
      }

      case 'generate_outline': {
        if (!text || !title) {
          return NextResponse.json({ error: 'Text and title are required' }, { status: 400 });
        }
        const outline = await generateCourseOutline(text, title, options);
        return NextResponse.json({ success: true, outline });
      }

      case 'generate_section': {
        if (!sectionOutline || sectionIndex === undefined || !context) {
          return NextResponse.json({ error: 'Section outline, index, and context are required' }, { status: 400 });
        }
        const result = await generateSectionWithContext(sectionOutline, sectionIndex, context, options);
        return NextResponse.json({ success: true, ...result });
      }

      case 'generate_activity': {
        if (!text || !activityType) {
          return NextResponse.json({ error: 'Text and activity type are required' }, { status: 400 });
        }
        const activity = await generateActivityFromText(text, activityType, options, subType);
        return NextResponse.json({ success: true, activity });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[API/AI] Generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Generation failed' },
      { status: 500 }
    );
  }
}
