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
      .eq('tenant_id', sessionId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Fetch creations error:', error);
    return NextResponse.json({ error: 'Failed to fetch creations' }, { status: 500 });
  }
}
