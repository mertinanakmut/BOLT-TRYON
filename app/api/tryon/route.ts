// app/api/tryon/route.ts - DEBUG VERSİYONU
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { tryOnSchema } from '@/lib/validation';
import { CREDITS, ERRORS, STATUS } from '@/lib/constants';
import { env } from '@/lib/env';

// DEBUG: Başlangıç log'u
console.log('🔧 API Route yüklendi:', new Date().toISOString());

async function prepareImageForFal(input: string): Promise<string> {
  console.log('🖼️ prepareImageForFal called, input length:', input?.length || 0);
  
  try {
    if (input.startsWith('data:image/')) {
      console.log('✓ Data URL formatı tespit edildi');
      return input;
    }
    
    const cleanStr = input.replace(/\s/g, '');
    if (/^[A-Za-z0-9+/]+=*$/.test(cleanStr) && cleanStr.length % 4 === 0) {
      const result = `data:image/png;base64,${cleanStr}`;
      console.log('✓ Base64 data URL formatına çevrildi, length:', result.length);
      return result;
    }
    
    throw new Error('Invalid base64 format');
  } catch (error) {
    console.error('❌ Image preparation error:', error);
    throw new Error('Failed to prepare image for processing');
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let historyRecord: any = null;
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  console.log(`\n\n🚀 ========== [${requestId}] API ÇAĞRILDI ==========`);
  console.log(`[${requestId}] Time: ${new Date().toISOString()}`);
  console.log(`[${requestId}] URL: ${req.url}`);
  
  try {
    // 1. DEV_TEST_MODE kontrolü
    const DEV_TEST_MODE = process.env.DEV_TEST_MODE === 'true';
    console.log(`[${requestId}] DEV_TEST_MODE: ${DEV_TEST_MODE}, value: "${process.env.DEV_TEST_MODE}"`);
    console.log(`[${requestId}] FAL_API_KEY exists: ${!!env.FAL_API_KEY}`);
    
    let user: any;
    let supabase;

    // 2. Supabase client oluştur
    console.log(`[${requestId}] Creating Supabase client...`);
    try {
      supabase = await createClient();
      console.log(`[${requestId}] ✓ Supabase client created`);
    } catch (supabaseError: any) {
      console.error(`[${requestId}] ❌ Supabase client error:`, supabaseError.message);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database connection failed',
          code: 'DB_CONNECTION_ERROR'
        },
        { status: STATUS.SERVER_ERROR }
      );
    }

    if (DEV_TEST_MODE) {
      console.log(`[${requestId}] 🧪 DEV TEST MODE ACTIVE - Bypassing authentication`);
      
      user = {
        id: 'dev-test-user-id-123456',
        email: 'dev@test.com'
      };
      
      // Test user için profile kontrol et
      console.log(`[${requestId}] Checking test user profile...`);
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('credits, subscription_tier')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        console.log(`[${requestId}] Profile error (might not exist):`, profileError.message);
      }
      
      if (!existingProfile) {
        console.log(`[${requestId}] Creating test user profile...`);
        const { error: insertError } = await supabase.from('profiles').insert({
          id: user.id,
          email: user.email,
          credits: 100,
          subscription_tier: 'free',
          created_at: new Date().toISOString()
        });
        
        if (insertError) {
          console.error(`[${requestId}] ❌ Profile creation error:`, insertError);
        } else {
          console.log(`[${requestId}] ✓ Test profile created`);
        }
      } else {
        console.log(`[${requestId}] ✓ Test profile exists, credits: ${existingProfile.credits}`);
      }
      
    } else {
      console.log(`[${requestId}] 🔐 NORMAL MODE - Checking authentication`);
      const { data: authData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !authData.user) {
        console.warn(`[${requestId}] ❌ Unauthorized:`, userError?.message);
        const ip = req.ip ?? req.headers.get('x-forwarded-for') ?? '127.0.0.1';
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
      console.log(`[${requestId}] ✓ User authenticated: ${user.id.substring(0, 8)}`);
    }

    // 3. Request body al
    console.log(`[${requestId}] Reading request body...`);
    let body;
    try {
      body = await req.json();
      console.log(`[${requestId}] ✓ Body received, keys:`, Object.keys(body));
      console.log(`[${requestId}]   modelImage length: ${body.modelImage?.length || 0}`);
      console.log(`[${requestId}]   tshirtImage length: ${body.tshirtImage?.length || 0}`);
    } catch (parseError: any) {
      console.error(`[${requestId}] ❌ JSON parse error:`, parseError.message);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid JSON payload',
          code: 'INVALID_JSON'
        },
        { status: STATUS.BAD_REQUEST }
      );
    }

    // 4. Zod validation
    console.log(`[${requestId}] Validating with Zod...`);
    const validationResult = tryOnSchema.safeParse(body);
    if (!validationResult.success) {
      console.error(`[${requestId}] ❌ Validation error:`, validationResult.error.format());
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
    console.log(`[${requestId}] ✓ Validation passed`);

    const { modelImage, tshirtImage, generateVideo = false, options } = validationResult.data;

    // 5. Kredi kontrolü
    console.log(`[${requestId}] Checking credits...`);
    const requiredCredits = CREDITS.TRYON_COST;
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits, subscription_tier')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error(`[${requestId}] ❌ Profile fetch error:`, profileError?.message);
      console.log(`[${requestId}] User ID: ${user.id}`);
      
      // Profil yoksa oluşturmaya çalış
      console.log(`[${requestId}] Attempting to create profile...`);
      const { error: createError } = await supabase.from('profiles').insert({
        id: user.id,
        email: user.email,
        credits: 5,
        subscription_tier: 'free',
        created_at: new Date().toISOString()
      });
      
      if (createError) {
        console.error(`[${requestId}] ❌ Profile creation also failed:`, createError);
        return NextResponse.json(
          { 
            success: false, 
            error: ERRORS.AUTH.NO_PROFILE,
            code: 'PROFILE_NOT_FOUND'
          },
          { status: STATUS.NOT_FOUND }
        );
      }
      
      console.log(`[${requestId}] ✓ Profile created successfully`);
      // Yeniden seç
      const { data: newProfile } = await supabase
        .from('profiles')
        .select('credits, subscription_tier')
        .eq('id', user.id)
        .single();
      
      if (newProfile && newProfile.credits < requiredCredits) {
        console.warn(`[${requestId}] ❌ Insufficient credits after creation: ${newProfile.credits}`);
        return NextResponse.json(
          { 
            success: false, 
            error: ERRORS.API.INSUFFICIENT_CREDITS,
            code: 'INSUFFICIENT_CREDITS'
          },
          { status: STATUS.PAYMENT_REQUIRED }
        );
      }
    } else if (profile.credits < requiredCredits) {
      console.warn(`[${requestId}] ❌ Insufficient credits: ${profile.credits} < ${requiredCredits}`);
      return NextResponse.json(
        { 
          success: false, 
          error: ERRORS.API.INSUFFICIENT_CREDITS,
          code: 'INSUFFICIENT_CREDITS'
        },
        { status: STATUS.PAYMENT_REQUIRED }
      );
    }

    console.log(`[${requestId}] ✓ Credits available: ${profile?.credits || 5}`);

    // 6. Concurrent request kontrolü (skip edebiliriz debug için)
    console.log(`[${requestId}] Skipping concurrent check for debug...`);

    // 7. History kaydı
    console.log(`[${requestId}] Creating history record...`);
    const { data: newHistoryRecord, error: historyInsertError } = await supabase
      .from('tryon_history')
      .insert({
        user_id: user.id,
        model_image_preview: modelImage.substring(0, 50) + '...',
        garment_type: options?.category || 'tshirt',
        garment_image_preview: tshirtImage.substring(0, 50) + '...',
        status: 'processing',
        credits_used: requiredCredits,
        generate_video: false,
        options: options || {},
        request_id: requestId,
        model_used: 'leffa/virtual-tryon'
      })
      .select()
      .single();

    if (historyInsertError) {
      console.error(`[${requestId}] ❌ History insert error:`, historyInsertError);
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
    console.log(`[${requestId}] ✓ History record created: ${historyRecord.id}`);

    // 8. Kredi rezervasyonu (debug için skip)
    console.log(`[${requestId}] Skipping credit reservation for debug...`);

    // 9. FAL AI API Call
    console.log(`[${requestId}] Preparing FAL AI call...`);
    
    const FAL_API_KEY = env.FAL_API_KEY;
    if (!FAL_API_KEY) {
      console.error(`[${requestId}] ❌ FAL_API_KEY missing!`);
      console.log(`[${requestId}] Check .env.local file for FAL_API_KEY`);
      return NextResponse.json(
        { 
          success: false, 
          error: ERRORS.FAL.API_KEY_MISSING,
          code: 'SERVER_CONFIG_ERROR'
        },
        { status: STATUS.SERVER_ERROR }
      );
    }

    console.log(`[${requestId}] ✓ FAL API Key found (starts with: ${FAL_API_KEY.substring(0, 10)}...)`);

    try {
      // Görselleri hazırla
      console.log(`[${requestId}] Preparing images...`);
      const modelImageFormatted = await prepareImageForFal(modelImage);
      const tshirtImageFormatted = await prepareImageForFal(tshirtImage);
      
      console.log(`[${requestId}] ✓ Images prepared`);
      console.log(`[${requestId}]   modelImage starts with: ${modelImageFormatted.substring(0, 50)}...`);
      console.log(`[${requestId}]   tshirtImage starts with: ${tshirtImageFormatted.substring(0, 50)}...`);

      // FAL AI payload
      interface FalPayload {
        image_url: string;
        garment_image_url: string;
        seed?: number;
        [key: string]: any;
      }
      
      const falPayload: FalPayload = {
        image_url: modelImageFormatted,
        garment_image_url: tshirtImageFormatted,
      };

      if (options?.seed) {
        falPayload.seed = options.seed;
        console.log(`[${requestId}] Using seed: ${options.seed}`);
      }

      console.log(`[${requestId}] 📤 Sending to FAL AI...`);
      console.log(`[${requestId}] Endpoint: https://fal.run/fal-ai/leffa/virtual-tryon`);
      console.log(`[${requestId}] Payload size: ${JSON.stringify(falPayload).length} bytes`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn(`[${requestId}] ⏰ FAL AI request timeout (90s)`);
        controller.abort();
      }, 90000);

      try {
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
        
        console.log(`[${requestId}] 📥 FAL AI response received`);
        console.log(`[${requestId}]   Status: ${falResponse.status}`);
        console.log(`[${requestId}]   Time: ${responseTime}ms`);
        console.log(`[${requestId}]   Headers:`, Object.fromEntries(falResponse.headers.entries()));

        if (!falResponse.ok) {
          let errorData: any;
          try {
            errorData = await falResponse.json();
            console.error(`[${requestId}] ❌ FAL AI API Error (JSON):`, errorData);
          } catch (jsonError: any) {
            const errorText = await falResponse.text();
            console.error(`[${requestId}] ❌ FAL AI API Error (Text):`, errorText.substring(0, 500));
            errorData = { detail: errorText };
          }
          
          console.log(`[${requestId}] Updating history as failed...`);
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

          let userErrorMessage: string = ERRORS.FAL.PROCESSING_FAILED;

          if (falResponse.status === 401) {
            userErrorMessage = 'API authentication failed. Please check API key.';
          } else if (falResponse.status === 402) {
            userErrorMessage = 'Insufficient FAL credits. Please add credits to your FAL account.';
          } else if (falResponse.status === 429) {
            userErrorMessage = 'Rate limit exceeded. Please try again later.';
          }
          
          console.log(`[${requestId}] Returning error to client...`);
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
        console.log(`[${requestId}] ✅ FAL AI SUCCESS!`);
        console.log(`[${requestId}] Response keys:`, Object.keys(falData));
        
        if (falData.image) {
          console.log(`[${requestId}] Image object:`, {
            url: falData.image.url?.substring(0, 100),
            width: falData.image.width,
            height: falData.image.height
          });
        }
        
        let resultImageUrl = null;
        if (falData.image && falData.image.url) {
          resultImageUrl = falData.image.url;
        } else if (falData.url) {
          resultImageUrl = falData.url;
        } else if (falData.output) {
          resultImageUrl = falData.output;
        }
        
        if (!resultImageUrl) {
          console.error(`[${requestId}] ❌ No image URL in response:`, falData);
          throw new Error('No image URL found in FAL AI response');
        }

        console.log(`[${requestId}] ✓ Result URL: ${resultImageUrl.substring(0, 100)}...`);

        // Update history
        console.log(`[${requestId}] Updating history as completed...`);
        await supabase
          .from('tryon_history')
          .update({
            status: 'completed',
            result_url: resultImageUrl,
            video_url: null,
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

        console.log(`[${requestId}] ✓ History updated`);

        // Success response
        const totalTime = Date.now() - startTime;
        const result = {
          success: true,
          data: {
            imageUrl: resultImageUrl,
            videoUrl: null,
            generationTimeMs: responseTime,
            remainingCredits: (profile?.credits || 5) - requiredCredits,
            requestId: falData.request_id || `leffa_${Date.now()}`,
            historyId: historyRecord.id,
            imageDetails: falData.image || { url: resultImageUrl }
          },
          meta: {
            responseTime: totalTime,
            creditsUsed: requiredCredits,
            videoGenerated: false,
            userTier: profile?.subscription_tier || 'free',
            garmentType: options?.category || 'tshirt',
            model: 'leffa/virtual-tryon',
            seed: falPayload.seed || 'not_specified'
          },
          debug: {
            requestId,
            devMode: DEV_TEST_MODE,
            userId: user.id.substring(0, 8)
          }
        };

        console.log(`[${requestId}] 🎉 TRY-ON COMPLETED SUCCESSFULLY!`);
        console.log(`[${requestId}] Total time: ${totalTime}ms`);
        console.log(`[${requestId}] =====================================\n`);

        return NextResponse.json(result, {
          status: STATUS.SUCCESS,
          headers: {
            'X-Request-ID': requestId,
            'X-History-ID': historyRecord.id,
            'X-Response-Time': totalTime.toString(),
            'X-Credits-Used': requiredCredits.toString(),
            'X-Remaining-Credits': ((profile?.credits || 5) - requiredCredits).toString(),
            'X-FAL-Model': 'leffa/virtual-tryon'
          }
        });

      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;
        
        if (fetchError.name === 'AbortError') {
          console.error(`[${requestId}] ⏰ FAL AI timeout after ${responseTime}ms`);
          
          await supabase
            .from('tryon_history')
            .update({
              status: 'failed',
              error_message: 'Request timeout (90s)',
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
        
        console.error(`[${requestId}] ❌ Fetch error:`, fetchError.message);
        throw new Error(`Fetch failed: ${fetchError.message}`);
      }

    } catch (imageProcessingError: any) {
      console.error(`[${requestId}] ❌ Image processing error:`, imageProcessingError);
      
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
    console.error(`\n[${requestId}] ⚠️ UNHANDLED ERROR:`);
    console.error(`[${requestId}] Message:`, err.message);
    console.error(`[${requestId}] Stack:`, err.stack);
    console.error(`[${requestId}] Time: ${responseTime}ms`);
    console.log(`[${requestId}] =====================================\n`);

    return NextResponse.json(
      { 
        success: false, 
        error: ERRORS.API.SERVER_ERROR,
        code: 'INTERNAL_SERVER_ERROR',
        responseTime,
        debug: { requestId }
      },
      { status: STATUS.SERVER_ERROR }
    );
  }
}