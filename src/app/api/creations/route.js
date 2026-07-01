import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { getSessionId } from '@/lib/session';

export async function GET() {
  const supabase = getServiceClient();
  try {
    const sessionId = await getSessionId();
    const { data, error } = await supabase
      .from('creations')
      .select('*')
      .eq('user_id', sessionId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const normalized = (data || []).map((row) => {
      const imageUrls = row.image_url;
      let urls = [];
      if (Array.isArray(imageUrls)) {
        urls = imageUrls.filter(Boolean);
      } else if (typeof imageUrls === 'string') {
        try {
          const parsed = JSON.parse(imageUrls);
          urls = Array.isArray(parsed) ? parsed.filter(Boolean) : [imageUrls];
        } catch (e) {
          urls = imageUrls ? [imageUrls] : [];
        }
      }
      return { ...row, urls };
    });

    return NextResponse.json(normalized);
  } catch (error) {
    console.error('Fetch creations error:', error);
    return NextResponse.json({ error: 'Failed to fetch creations' }, { status: 500 });
  }
}
