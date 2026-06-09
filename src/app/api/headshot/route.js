import { NextResponse } from 'next/server';
import config from '@/lib/config';
import { getServiceClient } from '@/lib/supabase';

export async function POST(req) {
  try {
    const body = await req.json();
    const { image_url, category, aspect_ratio } = body;

    if (!image_url) {
      return NextResponse.json({ error: 'Reference image is required' }, { status: 400 });
    }
    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    const apiKey = config.ai.headshot.apiKey;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI API key is not configured' }, { status: 500 });
    }

    const submitRes = await fetch(config.ai.headshot.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        image_url,
        category,
        aspect_ratio: aspect_ratio || '1:1',
      }),
    });

    if (!submitRes.ok) {
      const errorText = await submitRes.text();
      throw new Error(`AI API request failed: ${submitRes.status} ${errorText}`);
    }

    const submitData = await submitRes.json();
    const requestId = submitData.request_id || submitData.id;

    if (!requestId) {
      throw new Error('No request ID received from AI API');
    }

    const supabase = getServiceClient();
    await supabase.from('creations').insert({
      tenant_id: 'default',
      category,
      aspect_ratio: aspect_ratio || '1:1',
      request_id: requestId,
      status: 'processing',
    });

    return NextResponse.json({ request_id: requestId });
  } catch (error) {
    console.error('[HEADSHOT_API_ERROR]', error);
    return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 });
  }
}
