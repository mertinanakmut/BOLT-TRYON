export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { modelImage, tshirtImage } = body;

    if (!modelImage || !tshirtImage) {
      return NextResponse.json(
        { error: 'missing_images' },
        { status: 400 }
      );
    }

    await new Promise((res) => setTimeout(res, 1500));

    return NextResponse.json({
      imageUrl:
        'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=1024',
      generationTimeMs: 1500,
      mock: true,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'mock_failed' },
      { status: 500 }
    );
  }
}
