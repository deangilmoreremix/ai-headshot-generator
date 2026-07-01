import { NextResponse } from 'next/server';
import { getSessionId } from '@/lib/session';
import { AIService } from '@/lib/services/ai';

export async function POST(req) {
  try {
    const body = await req.json();
    const { image_url, category, aspect_ratio, type = "image" } = body;

    if (!image_url) return NextResponse.json({ error: 'Reference image is required' }, { status: 400 });
    if (!category) return NextResponse.json({ error: 'Category is required' }, { status: 400 });

    const sessionId = await getSessionId();
    const result = await AIService.generate(sessionId, { image_url, category, aspect_ratio, type });

    return NextResponse.json({ request_id: result.request_id });
  } catch (error) {
    console.error('[GENERATE_API_ERROR]', error);
    return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 });
  }
}
