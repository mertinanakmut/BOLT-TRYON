// app/api/tryon/route.ts - GÜNCELLENMİŞ VERSİYON
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { tryOnSchema } from '@/lib/validation';
import { CREDITS, ERRORS, STATUS } from '@/lib/constants';
import { env } from '@/lib/env';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let historyRecord: any = null;
  
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
        { status: STATUS.UNAUTHORIZED }
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
        { status: STATUS.BAD_REQUEST }
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
        { status: STATUS.BAD_REQUEST }
      );
    }

    const { modelImage, tshirtImage, generateVideo = false, options } = validationResult.data;

    // 4. Base64 format validation (zod zaten yapıyor ama ek kontrol)
    const isBase64 = (str: string) => {
      if (str.startsWith('data:image/')) return true;
      try {
        // Saf base64 kontrolü
        const cleanStr = str.replace(/\s/g, '');
        return /^[A-Za-z0-9+/]+=*$/.test(cleanStr) && cleanStr.length % 4 === 0;
      } catch {
        return false;
      }
    };

    if (!isBase64(modelImage) || !isBase64(tshirtImage)) {
      return NextResponse.json(
        {
          success: false,
          error: ERRORS.VALIDATION.INVALID_BASE64,
          code: 'INVALID_IMAGE_FORMAT'
        },
        { status: STATUS.BAD_REQUEST }
      );
    }

    // 5. Kredi kontrolü
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
          error: ERRORS.AUTH.NO_PROFILE,
          code: 'PROFILE_NOT_FOUND'
        },
        { status: STATUS.NOT_FOUND }
      );
    }

    const requiredCredits = generateVideo ? CREDITS.TRYON_VIDEO_COST : CREDITS.TRYON_COST;
    
    if (profile.credits < requiredCredits) {
      return NextResponse.json(
        { 
          success: false, 
          error: ERRORS.API.INSUFFICIENT_CREDITS,
          code: 'INSUFFICIENT_CREDITS',
          required: requiredCredits,
          available: profile.credits
        },
        { status: STATUS.PAYMENT_REQUIRED }
      );
    }

    // 6. Concurrent request kontrolü
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
          error: ERRORS.API.CONCURRENT_REQUEST,
          code: 'CONCURRENT_REQUEST'
        },
        { status: STATUS.RATE_LIMITED }
      );
    }

    // 7. İlk önce geçmişe kaydet (pending state)
    const { data: newHistoryRecord, error: historyInsertError } = await supabase
      .from('tryon_history')
      .insert({
        user_id: user.id,
        model_image_preview: modelImage.substring(0, 200),
        garment_type: options?.category || 'tshirt',
        garment_image_preview: tshirtImage.substring(0, 200),
        status: 'processing',
        credits_used: requiredCredits,
        generate_video: generateVideo,
        options: options || {}
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
        { status: STATUS.SERVER_ERROR }
      );
    }

    historyRecord = newHistoryRecord;

    // 8. Krediyi REZERVE et
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
        { status: STATUS.SERVER_ERROR }
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
          error: ERRORS.FAL.API_KEY_MISSING,
          code: 'SERVER_CONFIG_ERROR'
        },
        { status: STATUS.SERVER_ERROR }
      );
    }

    // Base64'i FAL formatına çevir
    const prepareImageForFal = (base64: string) => {
      if (base64.startsWith('data:image/')) {
        const parts = base64.split(',');
        if (parts.length === 2) {
          return parts[1];
        }
      }
      return base64;
    };

    const falPayload: any = {
      model_image: prepareImageForFal(modelImage),
      garment_image: prepareImageForFal(tshirtImage),
      enable_video: generateVideo,
      num_inference_steps: 25,
      guidance_scale: 7.0,
      seed: options?.seed || Math.floor(Math.random() * 1000000),
    };

    // Eğer FAL key username:password formatındaysa
    const authHeader = FAL_API_KEY.includes(':') 
      ? `Basic ${Buffer.from(FAL_API_KEY).toString('base64')}`
      : `Key ${FAL_API_KEY}`;

    console.log(`Calling FAL AI for user ${user.id.substring(0, 8)}, history ID: ${historyRecord.id}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const falResponse = await fetch('https://fal.run/fal-ai/clothing-tryon', {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(falPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      if (!falResponse.ok) {
        let errorData;
        try {
          errorData = await falResponse.json();
        } catch {
          errorData = { detail: await falResponse.text() };
        }
        
        console.error('FAL AI API Error:', {
          status: falResponse.status,
          error: errorData,
          responseTime,
          userId: user.id.substring(0, 8)
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
            error_message: errorData.detail || `FAL API error: ${falResponse.status}`,
            processing_time_ms: responseTime
          })
          .eq('id', historyRecord.id);

        return NextResponse.json(
          { 
            success: false, 
            error: ERRORS.FAL.PROCESSING_FAILED,
            details: errorData.detail || 'Unknown error',
            code: 'AI_PROCESSING_FAILED',
            responseTime
          },
          { status: falResponse.status > 400 ? falResponse.status : STATUS.SERVER_ERROR }
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
          userTier: profile.subscription_tier || 'free',
          garmentType: options?.category || 'tshirt'
        }
      };

      console.log(`Try-on completed for user ${user.id.substring(0, 8)}, history ID: ${historyRecord.id}, time: ${responseTime}ms`);

      return NextResponse.json(result, {
        status: STATUS.SUCCESS,
        headers: {
          'X-Request-ID': historyRecord.id,
          'X-Response-Time': responseTime.toString(),
          'X-Credits-Used': requiredCredits.toString(),
          'X-Remaining-Credits': (profile.credits - requiredCredits).toString()
        }
      });

    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      if (fetchError.name === 'AbortError') {
        console.error('FAL AI request timeout:', {
          userId: user.id.substring(0, 8),
          responseTime
        });
        
        await supabase
          .from('tryon_history')
          .update({
            status: 'failed',
            error_message: 'Request timeout (60s)',
            processing_time_ms: responseTime
          })
          .eq('id', historyRecord.id);
          
        return NextResponse.json(
          { 
            success: false, 
            error: ERRORS.API.TIMEOUT,
            code: 'REQUEST_TIMEOUT',
            responseTime
          },
          { status: STATUS.SERVER_ERROR }
        );
      }
      
      throw fetchError;
    }

  } catch (err: any) {
    const responseTime = Date.now() - startTime;
    console.error('TryOn API Unhandled Error:', {
      error: err.message,
      stack: err.stack,
      responseTime
    });

    // Emergency cleanup
    try {
      if (historyRecord) {
        const supabase = await createClient();
        
        // Credits'i geri ver
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('credits')
            .eq('id', user.id)
            .single();

          if (profile && historyRecord.credits_used) {
            await supabase
              .from('profiles')
              .update({ credits: profile.credits + historyRecord.credits_used })
              .eq('id', user.id);
          }
        }

        // History'i failed yap
        await supabase
          .from('tryon_history')
          .update({
            status: 'failed',
            error_message: err.message || 'Unknown error',
            processing_time_ms: responseTime
          })
          .eq('id', historyRecord.id);
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
      { status: STATUS.SERVER_ERROR }
    );
  }
}