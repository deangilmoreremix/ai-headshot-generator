import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export async function POST(req) {
  try {
    const body = await req.json();
    const { requestId } = body;

    if (!requestId) {
      return NextResponse.json({ error: 'Missing requestId' }, { status: 400 });
    }

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('creations')
      .select('*')
      .eq('request_id', requestId)
      .maybeSingle();

    if (error) throw error;

    if (!data) return NextResponse.json({ status: 'processing' });

    if (data.status === 'completed') {
      let imageUrl = data.image_url;
      if (Array.isArray(imageUrl)) {
        return NextResponse.json({ status: 'completed', imageUrl });
      }
      if (typeof imageUrl === 'string') {
        try { imageUrl = JSON.parse(imageUrl); } catch (e) {}
      }
      return NextResponse.json({ status: 'completed', imageUrl });
    }

    if (data.status === 'failed') {
      return NextResponse.json({ status: 'failed', error: data.error || 'Generation failed' });
    }

    return NextResponse.json({ status: 'processing' });
  } catch (error) {
    console.error('[HEADSHOT_STATUS_ERROR]', error);
    return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 });
  }
}
