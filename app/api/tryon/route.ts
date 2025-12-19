// app/api/tryon/route.ts - KLING KOLORS V1.5 VERSION - FINAL & OPTIMIZED
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { tryOnSchema } from '@/lib/validation';
import { CREDITS, ERRORS, STATUS } from '@/lib/constants';
import { env } from '@/lib/env';

// DEBUG: Başlangıç log'u
console.log('🔧 API Route yüklendi:', new Date().toISOString());

// 🎯 OPTİMİZASYON: Environment kontrolü
if (!env.FAL_API_KEY) {
  console.error('❌ FAL_API_KEY missing in environment!');
}

// 🎯 DÜZELTME: API'nin beklediği Data URL formatını döndür
async function prepareImageForFal(input: string): Promise<string> {
  console.log('🖼️ prepareImageForFal called, input length:', input?.length || 0);
  
  try {
    // Eğer zaten data URL formatındaysa, olduğu gibi döndür
    if (input.startsWith('data:image/')) {
      console.log('✓ Data URL formatı tespit edildi, direkt kullanılıyor');
      return input;
    }
    
    // Eğer saf base64 string ise, data URL formatına çevir
    const cleanStr = input.replace(/\s/g, '');
    if (/^[A-Za-z0-9+/]+=*$/.test(cleanStr) && cleanStr.length % 4 === 0) {
      const result = `data:image/jpeg;base64,${cleanStr}`;
      console.log('✓ Saf base64, Data URL formatına çevrildi, length:', result.length);
      return result;
    }
    
    throw new Error('Invalid base64 format');
  } catch (error) {
    console.error('❌ Image preparation error:', error);
    throw new Error('Failed to prepare image for processing');
  }
}

// 🎯 OPTİMİZASYON: Daha hızlı queue polling
async function checkFalQueueStatus(statusUrl: string, apiKey: string): Promise<any> {
  try {
    const response = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Accept': 'application/json',
      },
      // Timeout ekleyelim
      signal: AbortSignal.timeout(10000),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Queue status check error:', {
        status: response.status,
        url: statusUrl
      });
      throw new Error(`Status check failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Queue status check error:', error);
    throw error;
  }
}

// 🎯 OPTİMİZASYON: FAL AI result alma
async function getFalResult(responseUrl: string, apiKey: string): Promise<any> {
  try {
    console.log('📥 Fetching FAL result from:', responseUrl);
    const response = await fetch(responseUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(15000),
    });
    
    if (!response.ok) {
      throw new Error(`Result fetch failed: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ FAL result received');
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
  
  try {
    // 1. Environment kontrolü
    const DEV_TEST_MODE = env.DEV_TEST_MODE;
    const FAL_API_KEY = env.FAL_API_KEY;
    
    if (!FAL_API_KEY) {
      console.error(`[${requestId}] ❌ FAL_API_KEY missing!`);
      return NextResponse.json(
        { 
          success: false, 
          error: ERRORS.FAL.API_KEY_MISSING,
          code: 'SERVER_CONFIG_ERROR'
        },
        { status: STATUS.SERVER_ERROR }
      );
    }
    
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

    // 3. Authentication
    if (DEV_TEST_MODE) {
      console.log(`[${requestId}] 🧪 DEV TEST MODE ACTIVE - Bypassing authentication`);
      
      const testUserId = '00000000-0000-0000-0000-000000000123';
      user = {
        id: testUserId,
        email: 'dev@test.com',
        credits: 100,
        subscription_tier: 'free'
      };
      
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('credits, subscription_tier')
        .eq('id', user.id)
        .maybeSingle();
      
      if (existingProfile) {
        user.credits = existingProfile.credits;
        user.subscription_tier = existingProfile.subscription_tier;
      }
      
    } else {
      console.log(`[${requestId}] 🔐 NORMAL MODE - Checking authentication`);
      const { data: authData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !authData?.user) {
        console.warn(`[${requestId}] ❌ Unauthorized:`, userError?.message);
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

    // 4. Request body al
    console.log(`[${requestId}] Reading request body...`);
    let body: any;
    try {
      body = await req.json();
      console.log(`[${requestId}] ✓ Body received`);
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

    // 5. Validation
    console.log(`[${requestId}] Validating with Zod...`);
    const validationResult = tryOnSchema.safeParse(body);
    if (!validationResult.success) {
      console.error(`[${requestId}] ❌ Validation error:`, validationResult.error.format());
      return NextResponse.json(
        {
          success: false,
          error: ERRORS.VALIDATION.REQUIRED,
          code: 'VALIDATION_ERROR'
        },
        { status: STATUS.BAD_REQUEST }
      );
    }
    console.log(`[${requestId}] ✓ Validation passed`);

    const { modelImage, tshirtImage, options } = validationResult.data;

    // 6. Kredi kontrolü
    console.log(`[${requestId}] Checking credits...`);
    const requiredCredits = CREDITS.TRYON_COST;
    
    let userCredits = user.credits || 100;
    let userSubscriptionTier = user.subscription_tier || 'free';
    
    if (!DEV_TEST_MODE) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits, subscription_tier')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        userCredits = profile.credits;
        userSubscriptionTier = profile.subscription_tier || 'free';
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
        console.warn(`[${requestId}] ⚠️ History insert error:`, historyInsertError.message);
        historyRecord = { 
          id: `temp-${requestId}`,
          user_id: user.id
        };
      } else {
        historyRecord = newHistoryRecord;
        console.log(`[${requestId}] ✓ History record created: ${historyRecord.id}`);
      }
    } catch (historyError: any) {
      console.warn(`[${requestId}] ⚠️ History creation failed:`, historyError.message);
      historyRecord = { 
        id: `temp-${requestId}`,
        user_id: user.id
      };
    }

    // 8. FAL AI API Call
    console.log(`[${requestId}] Preparing FAL AI call...`);
    
    try {
      // Görselleri Data URL formatına çevir
      console.log(`[${requestId}] Preparing images (Data URL format)...`);
      const humanImageDataUrl = await prepareImageForFal(modelImage);
      const garmentImageDataUrl = await prepareImageForFal(tshirtImage);
      
      console.log(`[${requestId}] ✓ Images prepared as Data URL`);

      const falPayload = {
        human_image_url: humanImageDataUrl,
        garment_image_url: garmentImageDataUrl
      };

      console.log(`[${requestId}] 📤 Sending to FAL AI (Kling Kolors v1.5)...`);

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

        if (!falResponse.ok) {
          let errorData: any;
          try {
            errorData = await falResponse.json();
          } catch {
            errorData = { detail: await falResponse.text() };
          }
          
          if (historyRecord && !historyRecord.id.startsWith('temp-')) {
            try {
              await supabase
                .from('tryon_history')
                .update({
                  status: 'failed',
                  error_message: errorData.detail || `FAL API error: ${falResponse.status}`,
                  processing_time_ms: responseTime,
                })
                .eq('id', historyRecord.id);
            } catch (updateError) {
              console.warn(`[${requestId}] Could not update history:`, updateError);
            }
          }

          let userErrorMessage: string = ERRORS.FAL.PROCESSING_FAILED;

          if (falResponse.status === 422) {
            userErrorMessage = 'Image validation failed. Please check image format and size.';
          }
          
          return NextResponse.json({
            success: false,
            error: userErrorMessage,
            code: 'AI_PROCESSING_FAILED',
            responseTime: responseTime,
          }, { 
            status: falResponse.status > 400 ? falResponse.status : STATUS.SERVER_ERROR 
          });
        }

        const falData = await falResponse.json();
        console.log(`[${requestId}] ✅ FAL AI initial response received`);
        
        // QUEUE RESPONSE İŞLEME
        let pollingAttempts = 0;
        let finalResult = null;
        
        if (falData.status && (falData.status === "IN_QUEUE" || falData.status === "PROCESSING")) {
          console.log(`[${requestId}] 🕒 FAL AI queue response detected`);
          
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
                })
                .eq('id', historyRecord.id);
            } catch (updateError) {
              console.warn(`[${requestId}] Could not update history:`, updateError);
            }
          }
          
          // Sıra beklerken polling yap
          console.log(`[${requestId}] ⏱️ Starting queue polling...`);
          
          const maxPollingAttempts = 60;
          
          while (pollingAttempts < maxPollingAttempts && !finalResult) {
            pollingAttempts++;
            
            try {
              console.log(`[${requestId}] 🔄 Polling attempt ${pollingAttempts}/${maxPollingAttempts}...`);
              
              const statusResult = await checkFalQueueStatus(falData.status_url, FAL_API_KEY);
              
              if (statusResult.status === "COMPLETED") {
                console.log(`[${requestId}] ✅ Queue processing completed!`);
                
                // Sonucu al
                try {
                  finalResult = await getFalResult(falData.response_url, FAL_API_KEY);
                  console.log(`[${requestId}] ✓ Final result received`);
                } catch (resultError: any) {
                  console.error(`[${requestId}] ❌ Error fetching final result:`, resultError.message);
                  break;
                }
                break;
              } else if (statusResult.status === "FAILED") {
                console.error(`[${requestId}] ❌ Queue processing failed`);
                throw new Error(`FAL AI processing failed: ${statusResult.error || 'Unknown error'}`);
              }
              
              await new Promise(resolve => setTimeout(resolve, 500));
              
            } catch (pollingError: any) {
              console.warn(`[${requestId}] Polling error:`, pollingError.message);
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
          
          if (!finalResult) {
            console.error(`[${requestId}] ❌ Max polling attempts reached`);
            
            const queueResponse = {
              success: true,
              data: {
                status: "queued",
                queueRequestId: falData.request_id,
                statusUrl: falData.status_url,
                responseUrl: falData.response_url,
                queuePosition: falData.queue_position || 0,
              },
            };
            
            console.log(`[${requestId}] 🕒 Returning queue info to client`);
            return NextResponse.json(queueResponse, {
              status: STATUS.SUCCESS,
              headers: {
                'X-Request-ID': requestId,
                'X-Queue-Request-ID': falData.request_id,
              }
            });
          }
          
        } else {
          console.log(`[${requestId}] ⚡ Immediate response (no queue)`);
          finalResult = falData;
        }
        
        // FİNAL RESULT İŞLEME
        let resultImageUrl: string | null = null;
        
        // URL arama
        if (finalResult.image?.url) {
          resultImageUrl = finalResult.image.url;
        } else if (finalResult.images?.[0]?.url) {
          resultImageUrl = finalResult.images[0].url;
        } else if (finalResult.url) {
          resultImageUrl = finalResult.url;
        } else if (finalResult.output) {
          resultImageUrl = finalResult.output;
        } else if (finalResult.data?.url) {
          resultImageUrl = finalResult.data.url;
        } else {
          // Recursive search
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
          }, { 
            status: STATUS.SERVER_ERROR 
          });
        }

        console.log(`[${requestId}] ✅ Final result URL found`);

        // Update history with final result
        if (historyRecord && !historyRecord.id.startsWith('temp-')) {
          try {
            await supabase
              .from('tryon_history')
              .update({
                status: 'completed',
                result_url: resultImageUrl,
                video_url: null,
                processing_time_ms: Date.now() - startTime,
                fal_request_id: falData.request_id || `kling_${Date.now()}`,
              })
              .eq('id', historyRecord.id);
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
          },
        };

        console.log(`[${requestId}] 🎉 TRY-ON COMPLETED SUCCESSFULLY!`);
        console.log(`[${requestId}] Total time: ${totalTime}ms`);
        console.log(`[${requestId}] =====================================\n`);

        return NextResponse.json(result, {
          status: STATUS.SUCCESS,
          headers: {
            'X-Request-ID': requestId,
            'X-History-ID': historyRecord?.id || 'temp-id',
            'X-Response-Time': totalTime.toString(),
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
            },
            { status: STATUS.SERVER_ERROR }
          );
        }
        
        console.error(`[${requestId}] ❌ Fetch error:`, fetchError.message);
        
        return NextResponse.json({
          success: false,
          error: 'Network error connecting to FAL AI',
          code: 'NETWORK_ERROR',
          responseTime,
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
          code: 'IMAGE_PROCESSING_ERROR',
        },
        { status: STATUS.SERVER_ERROR }
      );
    }

  } catch (err: any) {
    const responseTime = Date.now() - startTime;
    console.error(`\n[${requestId}] ⚡ UNHANDLED ERROR:`, err.message);

    return NextResponse.json(
      { 
        success: false, 
        error: ERRORS.API.SERVER_ERROR,
        code: 'INTERNAL_SERVER_ERROR',
        responseTime,
      },
      { status: STATUS.SERVER_ERROR }
    );
  }
}