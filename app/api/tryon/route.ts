// app/api/tryon/route.ts - GÜNCELLENMİŞ VERSİYON
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { tryOnSchema } from '@/lib/validation';
import { CREDITS, ERRORS } from '@/lib/constants';
import { env } from '@/lib/env';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 1. Rate Limiting Kontrolü (IP bazlı)
    const ip = req.ip ?? req.headers.get('x-forwarded-for') ?? '127.0.0.1';
    
    // 2. Auth kontrolü
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.warn(`Unauthorized try-on attempt from IP: ${ip}`);
      return NextResponse.json(
        { 
          success: false, 
          error: ERRORS.AUTH.UNAUTHORIZED,
          code: 'UNAUTHORIZED'
        }, 
        { status: 401 }
      );
    }

    // 3. Input Validation
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid JSON payload',
          code: 'INVALID_JSON'
        },
        { status: 400 }
      );
    }

    // Zod validation
    const validationResult = tryOnSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: ERRORS.VALIDATION.REQUIRED,
          details: validationResult.error.format(),
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    const { modelImage, tshirtImage, generateVideo = false } = validationResult.data;

    // 4. Base64 format validation
    const isBase64 = (str: string) => {
      if (str.startsWith('data:image/')) return true;
      try {
        return btoa(atob(str)) === str;
      } catch {
        return false;
      }
    };

    if (!isBase64(modelImage) || !isBase64(tshirtImage)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Images must be in Base64 format',
          code: 'INVALID_IMAGE_FORMAT'
        },
        { status: 400 }
      );
    }

    // 5. Kredi kontrolü (Transaction-safe)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits, subscription_tier')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'User profile not found',
          code: 'PROFILE_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    const requiredCredits = generateVideo ? 2 : 1;
    
    if (profile.credits < requiredCredits) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Insufficient credits. Required: ${requiredCredits}, Available: ${profile.credits}`,
          code: 'INSUFFICIENT_CREDITS',
          required: requiredCredits,
          available: profile.credits
        },
        { status: 402 }
      );
    }

    // 6. Concurrent request kontrolü (aynı anda sadece 1 try-on)
    const { data: activeRequests } = await supabase
      .from('tryon_history')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'processing')
      .limit(1);

    if (activeRequests && activeRequests.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'You already have a try-on in progress',
          code: 'CONCURRENT_REQUEST'
        },
        { status: 429 }
      );
    }

    // 7. İlk önce geçmişe kaydet (pending state)
    const { data: historyRecord, error: historyInsertError } = await supabase
      .from('tryon_history')
      .insert({
        user_id: user.id,
        model_image_preview: modelImage.substring(0, 200), // Daha uzun preview
        garment_type: 'tshirt',
        garment_image_preview: tshirtImage.substring(0, 200),
        status: 'processing',
        credits_used: requiredCredits,
        generate_video: generateVideo
      })
      .select()
      .single();

    if (historyInsertError) {
      console.error('History insert error:', historyInsertError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create history record',
          code: 'HISTORY_ERROR'
        },
        { status: 500 }
      );
    }

    // 8. Krediyi REZERVE et (daha sonra tamamlanınca azaltacağız)
    const { error: creditReserveError } = await supabase
      .from('profiles')
      .update({ credits: profile.credits - requiredCredits })
      .eq('id', user.id);

    if (creditReserveError) {
      console.error('Credit reserve error:', creditReserveError);
      // Rollback history
      await supabase
        .from('tryon_history')
        .delete()
        .eq('id', historyRecord.id);
      
      return NextResponse.json(
        {
          success: false,
          error: 'Credit processing failed',
          code: 'CREDIT_PROCESSING_ERROR'
        },
        { status: 500 }
      );
    }

    // 9. FAL AI API Call
    const FAL_API_KEY = env.FAL_API_KEY;
    if (!FAL_API_KEY) {
      console.error('FAL_API_KEY missing');
      
      // Rollback
      await supabase
        .from('profiles')
        .update({ credits: profile.credits })
        .eq('id', user.id);
      
      await supabase
        .from('tryon_history')
        .delete()
        .eq('id', historyRecord.id);
      
      return NextResponse.json(
        { 
          success: false, 
          error: ERRORS.API.SERVER_ERROR,
          code: 'SERVER_CONFIG_ERROR'
        },
        { status: 500 }
      );
    }

    // Base64'i FAL formatına çevir
    const prepareImageForFal = (base64: string) => {
      // Eğer data URL formatındaysa, sadece base64 kısmını al
      if (base64.startsWith('data:image/')) {
        const parts = base64.split(',');
        if (parts.length === 2) {
          return parts[1];
        }
      }
      return base64;
    };

    const falPayload = {
      model_image: prepareImageForFal(modelImage),
      garment_image: prepareImageForFal(tshirtImage),
      enable_video: generateVideo,
      num_inference_steps: 25,
      guidance_scale: 7.0,
      seed: Math.floor(Math.random() * 1000000), // Random seed for variety
    };

    console.log(`Calling FAL AI for user ${user.id}, history ID: ${historyRecord.id}`);
    
    const falResponse = await fetch('https://fal.run/fal-ai/clothing-tryon', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(falPayload),
      signal: AbortSignal.timeout(60000), // 60 second timeout
    });

    const responseTime = Date.now() - startTime;

    if (!falResponse.ok) {
      const errorText = await falResponse.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { detail: errorText };
      }
      
      console.error('FAL AI API Error:', {
        status: falResponse.status,
        error: errorData,
        responseTime
      });

      // Rollback credits
      await supabase
        .from('profiles')
        .update({ credits: profile.credits })
        .eq('id', user.id);
      
      // Update history as failed
      await supabase
        .from('tryon_history')
        .update({
          status: 'failed',
          error_message: errorData.detail || 'FAL API error',
          processing_time_ms: responseTime
        })
        .eq('id', historyRecord.id);

      return NextResponse.json(
        { 
          success: false, 
          error: 'AI processing failed',
          details: errorData.detail || 'Unknown error',
          code: 'AI_PROCESSING_FAILED',
          responseTime
        },
        { status: falResponse.status > 400 ? falResponse.status : 500 }
      );
    }

    const falData = await falResponse.json();
    
    // 10. Tüm işlem başarılı, history'i güncelle
    await supabase
      .from('tryon_history')
      .update({
        status: 'completed',
        result_url: falData.images?.[0]?.url || falData.image_url || falData.output,
        video_url: generateVideo ? falData.video_url : null,
        processing_time_ms: responseTime,
        fal_request_id: falData.request_id,
        metrics: falData.metrics || {}
      })
      .eq('id', historyRecord.id);

    // 11. Response hazırla
    const result = {
      success: true,
      data: {
        imageUrl: falData.images?.[0]?.url || falData.image_url || falData.output,
        videoUrl: generateVideo ? falData.video_url : null,
        generationTimeMs: falData.metrics?.inference_time || responseTime,
        remainingCredits: profile.credits - requiredCredits,
        requestId: falData.request_id,
        historyId: historyRecord.id,
      },
      meta: {
        responseTime,
        creditsUsed: requiredCredits,
        videoGenerated: generateVideo,
        userTier: profile.subscription_tier || 'free'
      }
    };

    console.log(`Try-on completed for user ${user.id}, history ID: ${historyRecord.id}, time: ${responseTime}ms`);

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'X-Request-ID': historyRecord.id,
        'X-Response-Time': responseTime.toString(),
        'X-Credits-Used': requiredCredits.toString(),
        'X-Remaining-Credits': (profile.credits - requiredCredits).toString()
      }
    });

  } catch (err: any) {
    const responseTime = Date.now() - startTime;
    console.error('TryOn API Unhandled Error:', {
      error: err,
      stack: err.stack,
      responseTime,
      ip: req.ip
    });

    // Emergency cleanup - user varsa rollback yap
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Son processing kaydını bul ve failed yap
        const { data: lastProcessing } = await supabase
          .from('tryon_history')
          .select('id, credits_used')
          .eq('user_id', user.id)
          .eq('status', 'processing')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (lastProcessing) {
          // Credits'i geri ver
          const { data: profile } = await supabase
            .from('profiles')
            .select('credits')
            .eq('id', user.id)
            .single();

          if (profile) {
            await supabase
              .from('profiles')
              .update({ credits: profile.credits + (lastProcessing.credits_used || 1) })
              .eq('id', user.id);
          }

          // History'i failed yap
          await supabase
            .from('tryon_history')
            .update({
              status: 'failed',
              error_message: err.message || 'Unknown error',
              processing_time_ms: responseTime
            })
            .eq('id', lastProcessing.id);
        }
      }
    } catch (cleanupError) {
      console.error('Cleanup failed:', cleanupError);
    }

    return NextResponse.json(
      { 
        success: false, 
        error: ERRORS.API.SERVER_ERROR,
        code: 'INTERNAL_SERVER_ERROR',
        responseTime
      },
      { status: 500 }
    );
  }
}