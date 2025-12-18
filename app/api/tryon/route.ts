// app/api/tryon/route.ts - KLING KOLORS V1.5 VERSION - FIXED DOT NOTATION ERRORS
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { tryOnSchema } from '@/lib/validation';
import { CREDITS, ERRORS, STATUS } from '@/lib/constants';
import { env } from '@/lib/env';

// DEBUG: Başlangıç log'u
console.log('🔧 API Route yüklendi:', new Date().toISOString());

// 🎯 DÜZELTME: Kling Kolors için görsel hazırlama - SADECE BASE64 KISMI
async function prepareImageForFal(input: string): Promise<string> {
  console.log('🖼️ prepareImageForFal called, input length:', input?.length || 0);
  
  try {
    // Kling Kolors için sadece base64 kısmını al (data URL formatından temizle)
    if (input.startsWith('data:image/')) {
      console.log('✓ Data URL formatı tespit edildi, sadece base64 kısmı alınıyor');
      // data:image/jpeg;base64,/9j/4AA... formatından sadece /9j/4AA... kısmını al
      const base64Part = input.split(',')[1];
      if (base64Part) {
        console.log('✓ Base64 kısmı çıkarıldı, length:', base64Part.length);
        return base64Part; // SADECE BASE64, DATA URL DEĞİL!
      }
    }
    
    // Eğer sadece base64 string ise direkt döndür
    const cleanStr = input.replace(/\s/g, '');
    if (/^[A-Za-z0-9+/]+=*$/.test(cleanStr) && cleanStr.length % 4 === 0) {
      console.log('✓ Saf base64 formatı, direkt kullanılıyor, length:', cleanStr.length);
      return cleanStr;
    }
    
    throw new Error('Invalid base64 format');
  } catch (error) {
    console.error('❌ Image preparation error:', error);
    throw new Error('Failed to prepare image for processing');
  }
}

// 🎯 DÜZELTME: FAL AI queue durumunu kontrol et - hata detaylarıyla
async function checkFalQueueStatus(statusUrl: string, apiKey: string): Promise<any> {
  try {
    const response = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      // Hata detaylarını oku
      const errorText = await response.text();
      console.error('❌ Queue status check error details:', {
        status: response.status,
        statusText: response.statusText,
        errorBody: errorText,
        url: statusUrl
      });
      throw new Error(`Status check failed: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Queue status check error:', error);
    throw error;
  }
}

// 🎯 DÜZELTME: FAL AI response URL'den sonucu al - hata detaylarıyla
async function getFalResult(responseUrl: string, apiKey: string): Promise<any> {
  try {
    console.log('📥 Fetching FAL result from:', responseUrl);
    const response = await fetch(responseUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      // Hata detaylarını oku
      const errorText = await response.text();
      console.error('❌ Result fetch error details:', {
        status: response.status,
        statusText: response.statusText,
        errorBody: errorText,
        url: responseUrl
      });
      throw new Error(`Result fetch failed: ${response.status} - ${errorText.substring(0, 200)}`);
    }
    
    const result = await response.json();
    console.log('✅ FAL result received, keys:', Object.keys(result));
    return result;
  } catch (error) {
    console.error('Result fetch error:', error);
    throw error;
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
    // 1. DEV_TEST_MODE kontrolü - env'den al
    const DEV_TEST_MODE = env.DEV_TEST_MODE;
    console.log(`[${requestId}] DEV_TEST_MODE: ${DEV_TEST_MODE}`);
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
      
      const testUserId = '00000000-0000-0000-0000-000000000123';
      console.log(`[${requestId}] Using fixed test user UUID: ${testUserId}`);
      
      user = {
        id: testUserId,
        email: 'dev@test.com',
        credits: 100,
        subscription_tier: 'free'
      };
      
      console.log(`[${requestId}] Checking test user profile with UUID: ${user.id}`);
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('credits, subscription_tier')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profileError) {
        console.warn(`[${requestId}] Profile query warning:`, profileError.message);
      }
      
      if (existingProfile) {
        console.log(`[${requestId}] ✓ Test profile exists, credits: ${existingProfile.credits}`);
        user.credits = existingProfile.credits;
        user.subscription_tier = existingProfile.subscription_tier;
      } else {
        console.log(`[${requestId}] Test profile not found, using default credits (100)`);
      }
      
    } else {
      console.log(`[${requestId}] 🔐 NORMAL MODE - Checking authentication`);
      const { data: authData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !authData?.user) {
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
    let body: any;
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

    const { modelImage, tshirtImage, options } = validationResult.data;

    // 5. Kredi kontrolü
    console.log(`[${requestId}] Checking credits...`);
    const requiredCredits = CREDITS.TRYON_COST;
    
    let userCredits = user.credits || 100;
    let userSubscriptionTier = user.subscription_tier || 'free';
    
    if (!DEV_TEST_MODE) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('credits, subscription_tier')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.warn(`[${requestId}] Profile fetch warning:`, profileError?.message);
      } else if (profile) {
        userCredits = profile.credits;
        userSubscriptionTier = profile.subscription_tier || 'free';
        console.log(`[${requestId}] ✓ Profile found, credits: ${userCredits}`);
      } else {
        console.log(`[${requestId}] No profile found, using defaults`);
      }
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

    // 6. Concurrent request kontrolü (skip)
    console.log(`[${requestId}] Skipping concurrent check for debug...`);

    // 7. History kaydı
    console.log(`[${requestId}] Creating history record...`);
    try {
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
          model_used: 'kling/v1.5/kolors-virtual-try-on'
        })
        .select()
        .single();

      if (historyInsertError) {
        console.warn(`[${requestId}] ⚠️ History insert error (continuing anyway):`, historyInsertError.message);
        historyRecord = { 
          id: `temp-${requestId}`,
          user_id: user.id
        };
      } else {
        historyRecord = newHistoryRecord;
        console.log(`[${requestId}] ✓ History record created: ${historyRecord.id}`);
      }
    } catch (historyError: any) {
      console.warn(`[${requestId}] ⚠️ History creation failed, continuing:`, historyError.message);
      historyRecord = { 
        id: `temp-${requestId}`,
        user_id: user.id
      };
    }

    // 8. Kredi rezervasyonu (skip for now)
    console.log(`[${requestId}] Skipping credit reservation for FAL AI test...`);

    // 9. FAL AI API Call - KLING KOLORS V1.5 - DÜZELTİLDİ!
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
      // Görselleri hazırla - SADECE BASE64 KISMI!
      console.log(`[${requestId}] Preparing images...`);
      const modelImageBase64 = await prepareImageForFal(modelImage);
      const tshirtImageBase64 = await prepareImageForFal(tshirtImage);
      
      console.log(`[${requestId}] ✓ Images prepared (base64 only)`);
      console.log(`[${requestId}]   modelImage base64 length: ${modelImageBase64.length}`);
      console.log(`[${requestId}]   tshirtImage base64 length: ${tshirtImageBase64.length}`);
      console.log(`[${requestId}]   modelImage starts with: ${modelImageBase64.substring(0, 30)}...`);
      console.log(`[${requestId}]   tshirtImage starts with: ${tshirtImageBase64.substring(0, 30)}...`);

      // 🎯 DÜZELTME: FAL AI payload - SADECE GEREKLİ PARAMETRELER
      const falPayload: Record<string, any> = {
        model_image: modelImageBase64,
        garment_image: tshirtImageBase64,
        size: 'portrait' // Default size
      };

      // Options'dan parametreler
      if (options) {
        // Seed
        if (options.seed !== undefined && options.seed !== null) {
          falPayload['seed'] = Number(options.seed);
        }
        
        // Guidance scale
        if (options.guidanceScale !== undefined && options.guidanceScale !== null) {
          falPayload['guidance_scale'] = Number(options.guidanceScale);
        }
        
        // Inference steps
        if (options.numInferenceSteps !== undefined && options.numInferenceSteps !== null) {
          falPayload['num_inference_steps'] = Number(options.numInferenceSteps);
        }
        
        // Size
        if (options.size && ['portrait', 'square', 'landscape'].includes(options.size)) {
          falPayload['size'] = options.size;
        }
      }

      console.log(`[${requestId}] 📤 Sending to FAL AI (Kling Kolors v1.5)...`);
      console.log(`[${requestId}] Endpoint: https://queue.fal.run/fal-ai/kling/v1-5/kolors-virtual-try-on`);
      console.log(`[${requestId}] Payload keys:`, Object.keys(falPayload));
      console.log(`[${requestId}] Payload preview:`, {
        model_image_length: falPayload['model_image']?.length || 0,
        garment_image_length: falPayload['garment_image']?.length || 0,
        size: falPayload['size'],
        has_seed: !!falPayload['seed']
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn(`[${requestId}] ⏰ FAL AI request timeout (90s)`);
        controller.abort();
      }, 90000);

      try {
        // FAL AI'ye istek gönder
        const falResponse = await fetch('https://queue.fal.run/fal-ai/kling/v1-5/kolors-virtual-try-on', {
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
          
          if (historyRecord && !historyRecord.id.startsWith('temp-')) {
            try {
              await supabase
                .from('tryon_history')
                .update({
                  status: 'failed',
                  error_message: errorData.detail || errorData.message || `FAL API error: ${falResponse.status}`,
                  processing_time_ms: responseTime,
                  fal_response: errorData,
                  model_used: 'kling/v1.5/kolors-virtual-try-on'
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
          } else if (falResponse.status === 422) {
            userErrorMessage = 'Invalid image format or parameters. Please check your images.';
            // 422 hatasının detaylarını ekle
            if (errorData?.detail) {
              userErrorMessage += ` Details: ${errorData.detail}`;
            }
          }
          
          console.log(`[${requestId}] Returning error to client...`);
          return NextResponse.json({
            success: false,
            error: userErrorMessage,
            details: errorData?.detail || errorData?.message || 'Unknown error',
            falStatus: falResponse.status,
            code: 'AI_PROCESSING_FAILED',
            responseTime: responseTime,
            debug: {
              requestId,
              devMode: DEV_TEST_MODE,
              errorDetails: errorData
            }
          }, { 
            status: falResponse.status > 400 ? falResponse.status : STATUS.SERVER_ERROR 
          });
        }

        const falData = await falResponse.json();
        console.log(`[${requestId}] ✅ FAL AI initial response received`);
        console.log(`[${requestId}] Response type:`, typeof falData);
        console.log(`[${requestId}] Response keys:`, Object.keys(falData));
        
        // 🎯 QUEUE RESPONSE İŞLEME
        let pollingAttempts = 0;
        let finalResult = null;
        
        if (falData.status && (falData.status === "IN_QUEUE" || falData.status === "PROCESSING")) {
          console.log(`[${requestId}] 🕒 FAL AI queue response detected`);
          console.log(`[${requestId}]   Request ID: ${falData.request_id}`);
          console.log(`[${requestId}]   Status: ${falData.status}`);
          console.log(`[${requestId}]   Queue position: ${falData.queue_position || 0}`);
          console.log(`[${requestId}]   Status URL: ${falData.status_url}`);
          console.log(`[${requestId}]   Response URL: ${falData.response_url}`);
          
          // History'i queue durumuyla güncelle
          if (historyRecord && !historyRecord.id.startsWith('temp-')) {
            try {
              await supabase
                .from('tryon_history')
                .update({
                  status: 'queued',
                  fal_request_id: falData.request_id,
                  fal_status: falData.status,
                  queue_position: falData.queue_position || 0,
                  processing_time_ms: responseTime,
                  result_url: falData.response_url,
                  metrics: {
                    queue_info: {
                      status: falData.status,
                      queue_position: falData.queue_position || 0,
                      has_status_url: !!falData.status_url,
                      has_response_url: !!falData.response_url
                    }
                  }
                })
                .eq('id', historyRecord.id);
              console.log(`[${requestId}] ✓ History updated with queue info`);
            } catch (updateError) {
              console.warn(`[${requestId}] Could not update history:`, updateError);
            }
          }
          
          // ⏱️ Sıra beklerken polling yap
          console.log(`[${requestId}] ⏱️ Starting queue polling...`);
          
          const maxPollingAttempts = 60;
          
          while (pollingAttempts < maxPollingAttempts && !finalResult) {
            pollingAttempts++;
            
            try {
              console.log(`[${requestId}] 🔄 Polling attempt ${pollingAttempts}/${maxPollingAttempts}...`);
              
              const statusResult = await checkFalQueueStatus(falData.status_url, FAL_API_KEY);
              console.log(`[${requestId}]   Polling status: ${statusResult.status}`);
              
              if (statusResult.status === "COMPLETED") {
                console.log(`[${requestId}] ✅ Queue processing completed!`);
                
                // Sonucu al
                try {
                  finalResult = await getFalResult(falData.response_url, FAL_API_KEY);
                  console.log(`[${requestId}] ✓ Final result received`);
                } catch (resultError: any) {
                  console.error(`[${requestId}] ❌ Error fetching final result:`, resultError.message);
                  // Hata olursa queue bilgilerini döndür
                  break;
                }
                break;
              } else if (statusResult.status === "FAILED") {
                console.error(`[${requestId}] ❌ Queue processing failed`);
                throw new Error(`FAL AI processing failed: ${statusResult.error || 'Unknown error'}`);
              }
              
              // Bekle
              await new Promise(resolve => setTimeout(resolve, 500));
              
            } catch (pollingError: any) {
              console.warn(`[${requestId}] Polling error:`, pollingError.message);
              // Devam et, bir sonraki attempt'te tekrar dene
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
          
          if (!finalResult) {
            console.error(`[${requestId}] ❌ Max polling attempts reached or result fetch failed`);
            
            // Polling timeout, queue bilgilerini döndür
            const queueResponse = {
              success: true,
              data: {
                status: "queued",
                queueRequestId: falData.request_id,
                statusUrl: falData.status_url,
                responseUrl: falData.response_url,
                queuePosition: falData.queue_position || 0,
                estimatedWaitTime: "10-30 seconds"
              },
              meta: {
                message: "Image generation queued successfully",
                queuePosition: falData.queue_position || 0,
                responseTime: responseTime
              },
              debug: {
                requestId,
                falStatus: falData.status,
                pollingAttempts,
                queueInfo: {
                  hasStatusUrl: !!falData.status_url,
                  hasResponseUrl: !!falData.response_url
                }
              }
            };
            
            console.log(`[${requestId}] 🕒 Returning queue info to client (frontend will poll)`);
            return NextResponse.json(queueResponse, {
              status: STATUS.SUCCESS,
              headers: {
                'X-Request-ID': requestId,
                'X-Queue-Request-ID': falData.request_id,
                'X-FAL-Status': falData.status,
                'X-Queue-Position': (falData.queue_position || 0).toString()
              }
            });
          }
          
          // Final result'ı işle
          console.log(`[${requestId}] Final result keys:`, Object.keys(finalResult));
          
        } else {
          console.log(`[${requestId}] ⚡ Immediate response (no queue)`);
          finalResult = falData;
        }
        
        // 🎯 FİNAL RESULT İŞLEME
        let resultImageUrl: string | null = null;
        let imageDetails: any = null;
        
        // DEBUG: Tüm response'u logla
        console.log(`[${requestId}] Full final response structure:`, JSON.stringify(finalResult, null, 2).substring(0, 1000));
        
        // Kling Kolors formatını kontrol et
        if (finalResult.image && finalResult.image.url) {
          resultImageUrl = finalResult.image.url;
          imageDetails = finalResult.image;
          console.log(`[${requestId}] Found URL in image.url`);
        } else if (finalResult.images && Array.isArray(finalResult.images) && finalResult.images.length > 0) {
          resultImageUrl = finalResult.images[0].url;
          imageDetails = finalResult.images[0];
          console.log(`[${requestId}] Found URL in images[0].url`);
        } else if (finalResult.url) {
          resultImageUrl = finalResult.url;
          imageDetails = { url: finalResult.url };
          console.log(`[${requestId}] Found URL in finalResult.url`);
        } else if (finalResult.output) {
          resultImageUrl = finalResult.output;
          imageDetails = { url: finalResult.output };
          console.log(`[${requestId}] Found URL in finalResult.output`);
        } else if (finalResult.data && finalResult.data.url) {
          resultImageUrl = finalResult.data.url;
          imageDetails = finalResult.data;
          console.log(`[${requestId}] Found URL in data.url`);
        } else {
          console.log(`[${requestId}] 🔍 Searching for URL in response...`);
          
          // Recursive search for URL
          function findUrlInObject(obj: any): string | null {
            if (typeof obj === 'string' && obj.startsWith('http')) {
              return obj;
            }
            
            if (typeof obj === 'object' && obj !== null) {
              for (const key in obj) {
                if (key.toLowerCase().includes('url') && typeof obj[key] === 'string' && obj[key].startsWith('http')) {
                  return obj[key];
                }
                if (typeof obj[key] === 'object') {
                  const found = findUrlInObject(obj[key]);
                  if (found) return found;
                }
              }
            }
            return null;
          }
          
          resultImageUrl = findUrlInObject(finalResult);
          if (resultImageUrl) {
            imageDetails = { url: resultImageUrl, foundBySearch: true };
            console.log(`[${requestId}] Found URL via recursive search: ${resultImageUrl.substring(0, 100)}...`);
          }
        }
        
        if (!resultImageUrl) {
          console.error(`[${requestId}] ❌ No image URL in final response`);
          
          if (historyRecord && !historyRecord.id.startsWith('temp-')) {
            try {
              await supabase
                .from('tryon_history')
                .update({
                  status: 'failed',
                  error_message: 'No image URL found in FAL AI response',
                  processing_time_ms: Date.now() - startTime,
                  model_used: 'kling/v1.5/kolors-virtual-try-on',
                  fal_response: finalResult // Hata ayıklama için tüm response'u kaydet
                })
                .eq('id', historyRecord.id);
            } catch (updateError) {
              console.warn(`[${requestId}] Could not update history:`, updateError);
            }
          }
          
          return NextResponse.json({
            success: false,
            error: 'No image URL found in response',
            code: 'NO_IMAGE_URL',
            falResponse: finalResult,
            responseTime: Date.now() - startTime,
            debug: {
              requestId,
              responseKeys: Object.keys(finalResult),
              responseSample: JSON.stringify(finalResult).substring(0, 500)
            }
          }, { 
            status: STATUS.SERVER_ERROR 
          });
        }

        console.log(`[${requestId}] ✅ Final result URL: ${resultImageUrl.substring(0, 100)}...`);

        // Update history with final result
        if (historyRecord && !historyRecord.id.startsWith('temp-')) {
          try {
            console.log(`[${requestId}] Updating history with final result...`);
            await supabase
              .from('tryon_history')
              .update({
                status: 'completed',
                result_url: resultImageUrl,
                video_url: null,
                processing_time_ms: Date.now() - startTime,
                fal_request_id: falData.request_id || `kling_${Date.now()}`,
                model_used: 'kling/v1.5/kolors-virtual-try-on',
                metrics: {
                  inference_time: Date.now() - startTime,
                  // 🎯 DÜZELTME: Köşeli parantez notasyonu kullan
                  seed: falPayload['seed'] || 'not_specified',
                  model: 'kling/v1.5/kolors-virtual-try-on',
                  image_details: imageDetails || { url: resultImageUrl },
                  was_queued: !!falData.status_url,
                  queue_position: falData.queue_position || 0
                }
              })
              .eq('id', historyRecord.id);
            console.log(`[${requestId}] ✓ History updated with final result`);
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
            generationTimeMs: totalTime,
            remainingCredits: userCredits - requiredCredits,
            requestId: falData.request_id || `kling_${Date.now()}`,
            historyId: historyRecord?.id || 'temp-id',
            imageDetails: imageDetails || { url: resultImageUrl },
            wasQueued: !!falData.status_url,
            queueInfo: falData.status_url ? {
              queuePosition: falData.queue_position || 0,
              statusUrl: falData.status_url,
              responseUrl: falData.response_url
            } : null
          },
          meta: {
            responseTime: totalTime,
            creditsUsed: requiredCredits,
            videoGenerated: false,
            userTier: userSubscriptionTier,
            garmentType: options?.category || 'tshirt',
            model: 'kling/v1.5/kolors-virtual-try-on',
            // 🎯 DÜZELTME: Köşeli parantez notasyonu kullan
            seed: falPayload['seed'] || 'not_specified',
            processingType: falData.status_url ? 'queued' : 'immediate'
          },
          debug: {
            requestId,
            devMode: DEV_TEST_MODE,
            userId: user.id.substring(0, 8),
            falStatus: 'success',
            ...(falData.status_url && { pollingAttempts })
          }
        };

        console.log(`[${requestId}] 🎉 TRY-ON COMPLETED SUCCESSFULLY!`);
        console.log(`[${requestId}] Total time: ${totalTime}ms`);
        console.log(`[${requestId}] Processing type: ${falData.status_url ? 'Queued' : 'Immediate'}`);
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
            'X-FAL-Model': 'kling/v1.5/kolors-virtual-try-on',
            'X-Processing-Type': falData.status_url ? 'queued' : 'immediate'
          }
        });

      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;
        
        if (fetchError.name === 'AbortError') {
          console.error(`[${requestId}] ⏰ FAL AI timeout after ${responseTime}ms`);
          
          if (historyRecord && !historyRecord.id.startsWith('temp-')) {
            try {
              await supabase
                .from('tryon_history')
                .update({
                  status: 'failed',
                  error_message: 'Request timeout (90s)',
                  processing_time_ms: responseTime,
                  model_used: 'kling/v1.5/kolors-virtual-try-on'
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
      
      if (historyRecord && !historyRecord.id.startsWith('temp-')) {
        try {
          await supabase
            .from('tryon_history')
            .update({
              status: 'failed',
              error_message: `Image processing error: ${imageProcessingError.message}`,
              processing_time_ms: Date.now() - startTime,
              model_used: 'kling/v1.5/kolors-virtual-try-on'
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
    console.error(`\n[${requestId}] ⚡ UNHANDLED ERROR:`);
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