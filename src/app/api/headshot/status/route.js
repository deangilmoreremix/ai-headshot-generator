import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import config from '@/lib/config';

export async function POST(req) {
  try {
    const body = await req.json();
    const { requestId } = body;

    if (!requestId) {
      return NextResponse.json({ error: 'Missing requestId' }, { status: 400 });
    }

    const apiKey = config.ai.headshot.apiKey;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI API key is not configured' }, { status: 500 });
    }

    const statusUrl = `https://api.muapi.ai/api/v1/predictions/${requestId}/result`;
    const statusRes = await fetch(statusUrl, {
      headers: { 'x-api-key': apiKey },
    });

    if (!statusRes.ok) {
      const errorText = await statusRes.text();
      throw new Error(`Status check failed: ${statusRes.status} ${errorText}`);
    }

    const statusData = await statusRes.json();
    const status = statusData.status?.toLowerCase();

    const supabase = getServiceClient();
    let creation = null;

    if (status === 'completed' || status === 'succeeded' || status === 'success') {
      const imageUrl = statusData.outputs?.[0] || statusData.url || statusData.output?.url;
      if (imageUrl) {
        const { data, error } = await supabase
          .from('creations')
          .update({ status: 'completed', image_url: imageUrl })
          .eq('request_id', requestId)
          .select()
          .single();

        creation = data;
        if (error) {
          console.error('[STATUS_UPDATE_ERROR]', error);
        }
      }
    } else if (status === 'failed' || status === 'error') {
      const errorMsg = statusData.error || 'Generation failed';
      await supabase
        .from('creations')
        .update({ status: 'failed', error: errorMsg })
        .eq('request_id', requestId);
    }

    const record = creation || { status: 'processing' };
    return NextResponse.json({ status: record.status, imageUrl: record.image_url });
  } catch (error) {
    console.error('[HEADSHOT_STATUS_ERROR]', error);
    return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 });
  }
}
