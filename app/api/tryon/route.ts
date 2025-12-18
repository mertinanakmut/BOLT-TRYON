// app/api/tryon/route.ts - UUID FIXED VERSION
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { tryOnSchema } from '@/lib/validation';
import { CREDITS, ERRORS, STATUS } from '@/lib/constants';
import { env } from '@/lib/env';

// DEBUG: Başlangıç log'u
console.log('🔧 API Route yüklendi:', new Date().toISOString());

// GEÇERLİ UUID oluşturma fonksiyonu
function generateValidUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

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
      
      // GEÇERLİ UUID KULLAN - ÖNEMLİ DEĞİŞİKLİK!
      const testUserId = generateValidUUID();
      console.log(`[${requestId}] Generated valid UUID for test user: ${testUserId}`);
      
      user = {
        id: testUserId,  // GEÇERLİ UUID
        email: 'dev@test.com'
      };
      
      // Test user için profile kontrol et (artık UUID ile)
      console.log(`[${requestId}] Checking test user profile with UUID: ${user.id}`);
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('credits, subscription_tier')
        .eq('id', user.id)
        .single();
        
      if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error(`[${requestId}] Profile query error:`, profileError);
      } else if (profileError?.code === 'PGRST116') {
        console.log(`[${requestId}] Profile not found (expected), will create...`);
      }
      
      if (!existingProfile) {
        console.log(`[${requestId}] Creating test user profile with UUID...`);
        const { error: insertError } = await supabase.from('profiles').insert({
          id: user.id,
          email: user.email,
          credits: 100,
          subscription_tier: 'free',
          created_at: new Date().toISOString()
        });
        
        if (insertError) {
          console.error(`[${requestId}] ❌ Profile creation error:`, insertError);
          // Profile oluşturulamazsa bile devam et, FAL AI'yi test et
          console.log(`[${requestId}] Continuing without profile for FAL AI test...`);
          // Varsayılan profile oluştur
          user.credits = 100;
          user.subscription_tier = 'free';
        } else {
          console.log(`[${requestId}] ✓ Test profile created with UUID`);
        }
      } else {
        console.log(`[${requestId}] ✓ Test profile exists, credits: ${existingProfile.credits}`);
        user.credits = existingProfile.credits;
        user.subscription_tier = existingProfile.subscription_tier;
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

    // 5. Kredi kontrolü - DEV MODE için basitleştirilmiş
    console.log(`[${requestId}] Checking credits (simplified for DEV mode)...`);
    const requiredCredits = CREDITS.TRYON_COST;
    
    let userCredits = 100; // DEV MODE için varsayılan
    let userSubscriptionTier = 'free';
    
    if (!DEV_TEST_MODE || user.id !== 'dev-test-user-id-123456') {
      // Normal mod veya UUID'li test kullanıcısı için profile kontrol et
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('credits, subscription_tier')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error(`[${requestId}] ❌ Profile fetch error:`, profileError?.message);
      } else if (profile) {
        userCredits = profile.credits;
        userSubscriptionTier = profile.subscription_tier || 'free';
        console.log(`[${requestId}] ✓ Profile found, credits: ${userCredits}`);
      } else {
        console.log(`[${requestId}] No profile found, using defaults`);
      }
    } else {
      console.log(`[${requestId}] Using default credits for DEV mode`);
    }
    
    if (userCredits < requiredCredits) {
      console.warn(`[${requestId}] ❌ Insufficient credits: ${userCredits} < ${requiredCredits}`);
      return NextResponse.json(
        { 
          success: false, 
          error: ERRORS.API.INSUFFICIENT_CREDITS,
          code: 'INSUFFICIENT_CREDITS'
        },
        { status: STATUS.PAYMENT_REQUIRED }
      );
    }

    console.log(`[${requestId}] ✓ Credits available: ${userCredits}`);

    // 6. Concurrent request kontrolü (skip edebiliriz debug için)
    console.log(`[${requestId}] Skipping concurrent check for debug...`);

    // 7. History kaydı - DEV MODE için basitleştirilmiş
    console.log(`[${requestId}] Creating history record...`);
    try {
      // Önce history oluşturmaya çalış, başarısız olursa devam et
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
        console.warn(`[${requestId}] ⚠️ History insert error (continuing anyway):`, historyInsertError.message);
        // History oluşturulamazsa bile devam et
        historyRecord = { id: 'temp-history-id' };
      } else {
        historyRecord = newHistoryRecord;
        console.log(`[${requestId}] ✓ History record created: ${historyRecord.id}`);
      }
    } catch (historyError) {
      console.warn(`[${requestId}] ⚠️ History creation failed, continuing:`, historyError);
      historyRecord = { id: 'temp-history-id' };
    }

    // 8. Kredi rezervasyonu (debug için skip - FAL AI testine odaklan)
    console.log(`[${requestId}] Skipping credit reservation for FAL AI test...`);

    // 9. FAL AI API Call - ANA KISIM
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
        console.log(`[${requestId}]   OK: ${falResponse.ok}`);

        if (!falResponse.ok) {
          let errorData: any;
          try {
            errorData = await falResponse.json();
            console.error(`[${requestId}] ❌ FAL AI API Error (JSON):`, {
              status: falResponse.status,
              error: errorData
            });
          } catch (jsonError: any) {
            const errorText = await falResponse.text();
            console.error(`[${requestId}] ❌ FAL AI API Error (Text):`, errorText.substring(0, 500));
            errorData = { detail: errorText };
          }
          
          // History'i güncelle (eğer varsa)
          if (historyRecord && historyRecord.id !== 'temp-history-id') {
            try {
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
            } catch (updateError) {
              console.warn(`[${requestId}] Could not update history:`, updateError);
            }
          }

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
            falStatus: falResponse.status,
            code: 'AI_PROCESSING_FAILED',
            responseTime: responseTime,
            debug: {
              requestId,
              devMode: DEV_TEST_MODE
            }
          }, { 
            status: falResponse.status > 400 ? falResponse.status : STATUS.SERVER_ERROR 
          });
        }

        const falData = await falResponse.json();
        console.log(`[${requestId}] ✅ FAL AI SUCCESS!`);
        console.log(`[${requestId}] Response type:`, typeof falData);
        console.log(`[${requestId}] Response keys:`, Object.keys(falData));
        
        if (falData.image) {
          console.log(`[${requestId}] Image object found:`, {
            hasUrl: !!falData.image.url,
            width: falData.image.width,
            height: falData.image.height,
            contentType: falData.image.content_type
          });
        }
        
        let resultImageUrl = null;
        if (falData.image && falData.image.url) {
          resultImageUrl = falData.image.url;
          console.log(`[${requestId}] Found URL in image.url`);
        } else if (falData.url) {
          resultImageUrl = falData.url;
          console.log(`[${requestId}] Found URL in falData.url`);
        } else if (falData.output) {
          resultImageUrl = falData.output;
          console.log(`[${requestId}] Found URL in falData.output`);
        } else {
          console.log(`[${requestId}] Full FAL response:`, JSON.stringify(falData).substring(0, 500));
        }
        
        if (!resultImageUrl) {
          console.error(`[${requestId}] ❌ No image URL in response`);
          console.log(`[${requestId}] Full response:`, falData);
          throw new Error('No image URL found in FAL AI response');
        }

        console.log(`[${requestId}] ✓ Result URL: ${resultImageUrl.substring(0, 100)}...`);

        // Update history (eğer varsa)
        if (historyRecord && historyRecord.id !== 'temp-history-id') {
          try {
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
          } catch (updateError) {
            console.warn(`[${requestId}] Could not update history:`, updateError);
          }
        }

        // Success response
        const totalTime = Date.now() - startTime;
        const result = {
          success: true,
          data: {
            imageUrl: resultImageUrl,
            videoUrl: null,
            generationTimeMs: responseTime,
            remainingCredits: userCredits - requiredCredits,
            requestId: falData.request_id || `leffa_${Date.now()}`,
            historyId: historyRecord?.id || 'temp-id',
            imageDetails: falData.image || { url: resultImageUrl }
          },
          meta: {
            responseTime: totalTime,
            creditsUsed: requiredCredits,
            videoGenerated: false,
            userTier: userSubscriptionTier,
            garmentType: options?.category || 'tshirt',
            model: 'leffa/virtual-tryon',
            seed: falPayload.seed || 'not_specified'
          },
          debug: {
            requestId,
            devMode: DEV_TEST_MODE,
            userId: user.id.substring(0, 8),
            falStatus: 'success'
          }
        };

        console.log(`[${requestId}] 🎉 TRY-ON COMPLETED SUCCESSFULLY!`);
        console.log(`[${requestId}] Total time: ${totalTime}ms`);
        console.log(`[${requestId}] Image URL: ${resultImageUrl.substring(0, 150)}`);
        console.log(`[${requestId}] =====================================\n`);

        return NextResponse.json(result, {
          status: STATUS.SUCCESS,
          headers: {
            'X-Request-ID': requestId,
            'X-History-ID': historyRecord?.id || 'temp-id',
            'X-Response-Time': totalTime.toString(),
            'X-Credits-Used': requiredCredits.toString(),
            'X-Remaining-Credits': (userCredits - requiredCredits).toString(),
            'X-FAL-Model': 'leffa/virtual-tryon'
          }
        });

      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;
        
        if (fetchError.name === 'AbortError') {
          console.error(`[${requestId}] ⏰ FAL AI timeout after ${responseTime}ms`);
          
          if (historyRecord && historyRecord.id !== 'temp-history-id') {
            try {
              await supabase
                .from('tryon_history')
                .update({
                  status: 'failed',
                  error_message: 'Request timeout (90s)',
                  processing_time_ms: responseTime,
                  model_used: 'leffa/virtual-tryon'
                })
                .eq('id', historyRecord.id);
            } catch (updateError) {
              console.warn(`[${requestId}] Could not update history:`, updateError);
            }
          }
          
          return NextResponse.json(
            { 
              success: false, 
              error: ERRORS.API.TIMEOUT,
              code: 'REQUEST_TIMEOUT',
              responseTime,
              debug: { requestId, timeout: true }
            },
            { status: STATUS.SERVER_ERROR }
          );
        }
        
        console.error(`[${requestId}] ❌ Fetch error:`, fetchError.message);
        console.error(`[${requestId}] Fetch error stack:`, fetchError.stack);
        
        return NextResponse.json({
          success: false,
          error: 'Network error connecting to FAL AI',
          details: fetchError.message,
          code: 'NETWORK_ERROR',
          responseTime,
          debug: { requestId, errorType: fetchError.name }
        }, { status: STATUS.SERVER_ERROR });
      }

    } catch (imageProcessingError: any) {
      console.error(`[${requestId}] ❌ Image processing error:`, imageProcessingError);
      
      if (historyRecord && historyRecord.id !== 'temp-history-id') {
        try {
          await supabase
            .from('tryon_history')
            .update({
              status: 'failed',
              error_message: `Image processing error: ${imageProcessingError.message}`,
              processing_time_ms: Date.now() - startTime,
              model_used: 'leffa/virtual-tryon'
            })
            .eq('id', historyRecord.id);
        } catch (updateError) {
          console.warn(`[${requestId}] Could not update history:`, updateError);
        }
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to process images',
          details: imageProcessingError.message,
          code: 'IMAGE_PROCESSING_ERROR',
          debug: { requestId }
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
        debug: { requestId, error: err.message }
      },
      { status: STATUS.SERVER_ERROR }
    );
  }
}