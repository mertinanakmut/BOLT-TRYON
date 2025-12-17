// app/api/tryon/route.ts - LEFFA VIRTUAL TRYON VERSİYONU (TYPE FIXED)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { tryOnSchema } from '@/lib/validation';
import { CREDITS, ERRORS, STATUS } from '@/lib/constants';
import { env } from '@/lib/env';

// Helper function: File veya Base64'i Fal AI formatına çevir
// LEFFA modeli data URL formatını kabul eder: data:image/png;base64,...
async function prepareImageForFal(input: string): Promise<string> {
  try {
    // Eğer base64 data URL formatındaysa (data:image/...) - LEFFA için doğru format
    if (input.startsWith('data:image/')) {
      return input; // LEFFA için data URL formatını olduğu gibi bırak
    }
    
    // Eğer sadece base64 string ise, data URL formatına çevir
    // Basit base64 validation
    const cleanStr = input.replace(/\s/g, '');
    if (/^[A-Za-z0-9+/]+=*$/.test(cleanStr) && cleanStr.length % 4 === 0) {
      // LEFFA için data URL formatına çevir (varsayılan png)
      return `data:image/png;base64,${cleanStr}`;
    }
    
    throw new Error('Invalid base64 format');
  } catch (error) {
    console.error('Image preparation error:', error);
    throw new Error('Failed to prepare image for processing');
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let historyRecord: any = null;
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  console.log(`[${requestId}] Try-on request started`);
  
  try {
    // DEVTEST MODU - Eğer .env.local'da DEV_TEST_MODE=true ise auth'u bypass et
    const DEV_TEST_MODE = process.env.DEV_TEST_MODE === 'true';
    let user: any;
    let supabase;

    if (DEV_TEST_MODE) {
      console.log(`[${requestId}] DEV TEST MODE ACTIVE - Bypassing authentication`);
      
      // Test için dummy user oluştur
      user = {
        id: 'dev-test-user-id-123456',
        email: 'dev@test.com'
      };
      
      supabase = await createClient();
      
      // Test user için profile kontrol et, yoksa oluştur
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('credits, subscription_tier')
        .eq('id', user.id)
        .single();
        
      if (!existingProfile) {
        console.log(`[${requestId}] Creating test user profile...`);
        await supabase.from('profiles').insert({
          id: user.id,
          email: user.email,
          credits: 100,
          subscription_tier: 'free',
          created_at: new Date().toISOString()
        });
      }
      
    } else {
      // NORMAL MOD - Auth kontrolü
      supabase = await createClient();
      const { data: authData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !authData.user) {
        const ip = req.ip ?? req.headers.get('x-forwarded-for') ?? '127.0.0.1';
        console.warn(`[${requestId}] Unauthorized try-on request from IP: ${ip}`);
        return NextResponse.json(
          { 
            success: false, 
            error: ERRORS.AUTH.UNAUTHORIZED,
            code: 'UNAUTHORIZED'
          }, 
          { status: STATUS.UNAUTHORIZED }
        );
      }
      user = authData.user;
    }

    console.log(`[${requestId}] User authenticated: ${user.id.substring(0, 8)} (DEV_TEST_MODE: ${DEV_TEST_MODE})`);

    // 3. Input Validation
    let body;
    try {
      body = await req.json();
    } catch (parseError: any) {
      console.error(`[${requestId}] JSON parse error:`, parseError);
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
      console.error(`[${requestId}] Validation error:`, validationResult.error.format());
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

    // 4. Base64 format validation
    console.log(`[${requestId}] Images received: model=${modelImage.length} chars, tshirt=${tshirtImage.length} chars`);

    // 5. Kredi kontrolü - LEFFA modeli için video yok
    const requiredCredits = CREDITS.TRYON_COST; // Video opsiyonu yok, sabit kredi
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits, subscription_tier')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error(`[${requestId}] Profile fetch error:`, profileError);
      return NextResponse.json(
        { 
          success: false, 
          error: ERRORS.AUTH.NO_PROFILE,
          code: 'PROFILE_NOT_FOUND'
        },
        { status: STATUS.NOT_FOUND }
      );
    }
    
    if (profile.credits < requiredCredits) {
      console.warn(`[${requestId}] Insufficient credits: required=${requiredCredits}, available=${profile.credits}`);
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

    console.log(`[${requestId}] Credits available: ${profile.credits}, required: ${requiredCredits}`);

    // 6. Concurrent request kontrolü
    const { data: activeRequests } = await supabase
      .from('tryon_history')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'processing')
      .limit(1);

    if (activeRequests && activeRequests.length > 0) {
      console.warn(`[${requestId}] Concurrent request detected for user ${user.id.substring(0, 8)}`);
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
        model_image_preview: modelImage.substring(0, 200) + '...',
        garment_type: options?.category || 'tshirt',
        garment_image_preview: tshirtImage.substring(0, 200) + '...',
        status: 'processing',
        credits_used: requiredCredits,
        generate_video: false, // LEFFA modeli video üretmez
        options: options || {},
        request_id: requestId,
        model_used: 'leffa/virtual-tryon' // Model bilgisini kaydet
      })
      .select()
      .single();

    if (historyInsertError) {
      console.error(`[${requestId}] History insert error:`, historyInsertError);
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
    console.log(`[${requestId}] History record created: ${historyRecord.id}`);

    // 8. Krediyi REZERVE et
    const { error: creditReserveError } = await supabase
      .from('profiles')
      .update({ credits: profile.credits - requiredCredits })
      .eq('id', user.id);

    if (creditReserveError) {
      console.error(`[${requestId}] Credit reserve error:`, creditReserveError);
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

    console.log(`[${requestId}] Credits reserved, new balance: ${profile.credits - requiredCredits}`);

    // 9. FAL AI API Call - LEFFA VIRTUAL TRYON
    const FAL_API_KEY = env.FAL_API_KEY;
    if (!FAL_API_KEY) {
      console.error(`[${requestId}] FAL_API_KEY missing from environment`);
      
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

    console.log(`[${requestId}] FAL API Key found (length: ${FAL_API_KEY.length})`);

    try {
      // Görselleri hazırla - LEFFA için data URL formatı
      const modelImageFormatted = await prepareImageForFal(modelImage);
      const tshirtImageFormatted = await prepareImageForFal(tshirtImage);
      
      console.log(`[${requestId}] Images prepared for FAL AI (LEFFA model)`);

      // FAL AI için payload - LEFFA Virtual TryOn modeli
      // TypeScript için interface tanımla
      interface FalPayload {
        image_url: string;
        garment_image_url: string;
        seed?: number;
        [key: string]: any; // Diğer opsiyonel parametreler için
      }
      
      const falPayload: FalPayload = {
        // LEFFA modeli için gerekli parametreler
        image_url: modelImageFormatted, // Model kişinin fotoğrafı (data URL formatında)
        garment_image_url: tshirtImageFormatted, // Giyilecek kıyafet fotoğrafı
      };

      // İsteğe bağlı parametreleri ekle (model dokümantasyonunda varsa)
      if (options) {
        if (options.seed) falPayload.seed = options.seed;
        // LEFFA modeline özel parametreler eklenebilir
      }

      console.log(`[${requestId}] Calling FAL AI with model: leffa/virtual-tryon`);
      console.log(`[${requestId}] FAL Payload keys:`, Object.keys(falPayload));

      // FAL AI API çağrısı - LEFFA modeli için
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn(`[${requestId}] FAL AI request timeout (90s)`);
        controller.abort();
      }, 90000); // LEFFA için daha uzun timeout

      try {
        // YENİ ENDPOINT: Leffa Virtual TryOn
        const falResponse = await fetch('https://fal.run/fal-ai/leffa/virtual-tryon', {
          method: 'POST',
          headers: {
            'Authorization': `Key ${FAL_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(falPayload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;
        
        console.log(`[${requestId}] FAL AI response status: ${falResponse.status}, time: ${responseTime}ms`);

        if (!falResponse.ok) {
          let errorData: any;
          try {
            errorData = await falResponse.json();
            console.error(`[${requestId}] FAL AI API Error (JSON):`, {
              status: falResponse.status,
              error: errorData
            });
          } catch (jsonError: any) {
            const errorText = await falResponse.text();
            console.error(`[${requestId}] FAL AI API Error (Text):`, {
              status: falResponse.status,
              text: errorText.substring(0, 500)
            });
            errorData = { detail: errorText };
          }
          
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
              error_message: errorData.detail || errorData.message || `FAL API error: ${falResponse.status}`,
              processing_time_ms: responseTime,
              fal_response: errorData,
              model_used: 'leffa/virtual-tryon'
            })
            .eq('id', historyRecord.id);

          // Hata mesajını belirle - TYPE FIXED
          let userErrorMessage: string = ERRORS.FAL.PROCESSING_FAILED;

          if (falResponse.status === 401) {
            userErrorMessage = 'API authentication failed. Please check API key.';
          } else if (falResponse.status === 402) {
            userErrorMessage = 'Insufficient FAL credits. Please add credits to your FAL account.';
          } else if (falResponse.status === 429) {
            userErrorMessage = 'Rate limit exceeded. Please try again later.';
          }
          
          return NextResponse.json({
            success: false,
            error: userErrorMessage,
            details: errorData.detail || 'Unknown error',
            code: 'AI_PROCESSING_FAILED',
            responseTime: responseTime
          }, { 
            status: falResponse.status > 400 ? falResponse.status : STATUS.SERVER_ERROR 
          });
        }

        const falData = await falResponse.json();
        console.log(`[${requestId}] FAL AI success response:`, falData);
        
        // LEFFA modelinin response formatını işle
        // Format: { "image": { "height": 1024, "content_type": "image/jpeg", "url": "...", "width": 768 } }
        
        let resultImageUrl = null;
        if (falData.image && falData.image.url) {
          resultImageUrl = falData.image.url;
        } else if (falData.url) {
          resultImageUrl = falData.url;
        } else if (falData.output) {
          resultImageUrl = falData.output;
        }
        
        if (!resultImageUrl) {
          console.error(`[${requestId}] No image URL found in FAL AI response:`, falData);
          throw new Error('No image URL found in FAL AI response');
        }

        console.log(`[${requestId}] Result image URL: ${resultImageUrl.substring(0, 100)}...`);

        // 10. Tüm işlem başarılı, history'i güncelle
        await supabase
          .from('tryon_history')
          .update({
            status: 'completed',
            result_url: resultImageUrl,
            video_url: null, // LEFFA modeli video üretmez
            processing_time_ms: responseTime,
            fal_request_id: falData.request_id || `leffa_${Date.now()}`,
            model_used: 'leffa/virtual-tryon',
            metrics: {
              inference_time: responseTime,
              seed: falPayload.seed || 'not_specified',
              model: 'leffa/virtual-tryon'
            }
          })
          .eq('id', historyRecord.id);

        console.log(`[${requestId}] History updated successfully`);

        // 11. Response hazırla
        const result = {
          success: true,
          data: {
            imageUrl: resultImageUrl,
            videoUrl: null, // LEFFA modeli video üretmez
            generationTimeMs: responseTime,
            remainingCredits: profile.credits - requiredCredits,
            requestId: falData.request_id || `leffa_${Date.now()}`,
            historyId: historyRecord.id,
            // LEFFA'dan gelen image objesini de ekleyelim
            imageDetails: falData.image || { url: resultImageUrl }
          },
          meta: {
            responseTime,
            creditsUsed: requiredCredits,
            videoGenerated: false, // LEFFA modeli video üretmez
            userTier: profile.subscription_tier || 'free',
            garmentType: options?.category || 'tshirt',
            model: 'leffa/virtual-tryon',
            seed: falPayload.seed || 'not_specified'
          }
        };

        console.log(`[${requestId}] Try-on completed successfully for user ${user.id.substring(0, 8)}`);
        console.log(`[${requestId}] Total processing time: ${responseTime}ms`);

        return NextResponse.json(result, {
          status: STATUS.SUCCESS,
          headers: {
            'X-Request-ID': requestId,
            'X-History-ID': historyRecord.id,
            'X-Response-Time': responseTime.toString(),
            'X-Credits-Used': requiredCredits.toString(),
            'X-Remaining-Credits': (profile.credits - requiredCredits).toString(),
            'X-FAL-Model': 'leffa/virtual-tryon'
          }
        });

      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;
        
        if (fetchError.name === 'AbortError') {
          console.error(`[${requestId}] FAL AI request timeout after ${responseTime}ms`);
          
          await supabase
            .from('tryon_history')
            .update({
              status: 'failed',
              error_message: 'Request timeout (90s) - FAL AI took too long to respond',
              processing_time_ms: responseTime,
              model_used: 'leffa/virtual-tryon'
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
        
        console.error(`[${requestId}] Fetch error:`, fetchError);
        throw new Error(`Fetch failed: ${fetchError.message}`);
      }

    } catch (imageProcessingError: any) {
      console.error(`[${requestId}] Image processing error:`, imageProcessingError);
      
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
          error_message: `Image processing error: ${imageProcessingError.message}`,
          processing_time_ms: Date.now() - startTime,
          model_used: 'leffa/virtual-tryon'
        })
        .eq('id', historyRecord.id);
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to process images',
          details: imageProcessingError.message,
          code: 'IMAGE_PROCESSING_ERROR'
        },
        { status: STATUS.SERVER_ERROR }
      );
    }

  } catch (err: any) {
    const responseTime = Date.now() - startTime;
    console.error(`[${requestId}] Unhandled Error:`, {
      error: err.message,
      stack: err.stack,
      responseTime
    });

    // Emergency cleanup
    try {
      if (historyRecord) {
        console.error(`[${requestId}] Attempting cleanup for history ID: ${historyRecord.id}`);
        
        const supabase = await createClient();
        
        // Credits'i geri ver
        try {
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
              console.log(`[${requestId}] Credits rolled back for user ${user.id.substring(0, 8)}`);
            }
          }
        } catch (creditError: any) {
          console.error(`[${requestId}] Credit rollback failed:`, creditError);
        }

        // History'i failed yap
        try {
          await supabase
            .from('tryon_history')
            .update({
              status: 'failed',
              error_message: err.message || 'Unknown internal error',
              processing_time_ms: responseTime,
              model_used: historyRecord.model_used || 'leffa/virtual-tryon'
            })
            .eq('id', historyRecord.id);
          console.log(`[${requestId}] History marked as failed`);
        } catch (historyError: any) {
          console.error(`[${requestId}] History update failed:`, historyError);
        }
      }
    } catch (cleanupError: any) {
      console.error(`[${requestId}] Cleanup failed:`, cleanupError);
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