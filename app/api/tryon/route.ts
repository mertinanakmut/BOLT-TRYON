// app/api/tryon/route.ts - GERÇEK VERSİYON
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    // 1. Auth kontrolü
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Body'yi al
    const body = await req.json();
    const { modelImage, tshirtImage, generateVideo = false } = body;

    if (!modelImage || !tshirtImage) {
      return NextResponse.json(
        { error: 'Model image and tshirt image are required' },
        { status: 400 }
      );
    }

    // 3. Kredi kontrolü
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (!profile || profile.credits < 1) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 402 }
      );
    }

    // 4. FAL AI API'yi çağır
    const FAL_API_KEY = process.env.FAL_API_KEY;
    if (!FAL_API_KEY) {
      console.error('FAL_API_KEY missing');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // 5. Base64'ten URL'ye çevir (Fal AI formatına uygun)
    const base64ToUrl = (base64: string) => {
      // data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ... formatını düzelt
      return base64;
    };

    const falResponse = await fetch('https://fal.run/fal-ai/clothing-tryon', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model_image: base64ToUrl(modelImage),
        garment_image: base64ToUrl(tshirtImage),
        enable_video: generateVideo,
        num_inference_steps: 25,
        guidance_scale: 7.0,
      }),
    });

    if (!falResponse.ok) {
      const errorData = await falResponse.json();
      console.error('Fal AI Error:', errorData);
      return NextResponse.json(
        { error: `Fal AI API failed: ${errorData.detail || falResponse.statusText}` },
        { status: falResponse.status }
      );
    }

    const falData = await falResponse.json();

    // 6. Krediyi azalt
    await supabase
      .from('profiles')
      .update({ credits: profile.credits - 1 })
      .eq('id', user.id);

    // 7. Geçmişe kaydet
    const { error: historyError } = await supabase
      .from('tryon_history')
      .insert({
        user_id: user.id,
        model_image_preview: modelImage.substring(0, 100),
        garment_type: 'tshirt',
        result_url: falData.images?.[0]?.url || falData.image_url,
        video_url: generateVideo ? falData.video_url : null,
        status: 'completed',
        credits_used: 1
      });

    if (historyError) {
      console.error('History save error:', historyError);
    }

    // 8. Response dön
    return NextResponse.json({
      success: true,
      imageUrl: falData.images?.[0]?.url || falData.image_url || falData.output,
      videoUrl: generateVideo ? falData.video_url : null,
      generationTimeMs: falData.metrics?.inference_time || 0,
      remainingCredits: (profile.credits - 1),
      requestId: falData.request_id,
      mock: false
    });

  } catch (err: any) {
    console.error('TryOn API Error:', err);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: err.message 
      },
      { status: 500 }
    );
  }
}
