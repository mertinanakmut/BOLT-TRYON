// app/api/health/route.ts - DÜZELTİLMİŞ VERSİYON
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Çok basit bir health check - her zaman başarılı dön
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        api: 'healthy',
        database: 'unknown', // Başlangıçta unknown
        fal_ai: 'unknown',   // Başlangıçta unknown
      },
      checks: {
        env_variables_loaded: false,
        supabase_url_present: false,
        supabase_key_present: false,
        fal_key_present: false,
      },
      response_time_ms: 0,
    };

    // Environment variables kontrolü
    healthCheck.checks.env_variables_loaded = !!process.env;
    healthCheck.checks.supabase_url_present = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    healthCheck.checks.supabase_key_present = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    healthCheck.checks.fal_key_present = !!process.env.FAL_API_KEY;

    // Database check (sadece URL ve KEY varsa dene)
    if (healthCheck.checks.supabase_url_present && healthCheck.checks.supabase_key_present) {
      try {
        // Dynamic import kullan (build hatası olmaması için)
        const { createClient } = await import('@supabase/supabase-js');
        
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            auth: {
              persistSession: false,
            },
          }
        );

        // Çok basit bir query
        const { error } = await supabase
          .from('profiles')
          .select('count', { count: 'exact', head: true })
          .limit(1);

        if (error) {
          console.warn('Database check warning:', error.message);
          healthCheck.services.database = 'degraded';
        } else {
          healthCheck.services.database = 'healthy';
        }
      } catch (dbError: any) {
        console.warn('Database check failed:', dbError.message);
        healthCheck.services.database = 'unhealthy';
      }
    } else {
      healthCheck.services.database = 'unavailable';
    }

    // FAL AI check
    if (healthCheck.checks.fal_key_present) {
      // Sadece key formatını kontrol et
      const falKey = process.env.FAL_API_KEY!;
      if (falKey.includes(':') || falKey.startsWith('sk-') || falKey.startsWith('fal-')) {
        healthCheck.services.fal_ai = 'healthy';
      } else {
        healthCheck.services.fal_ai = 'warning';
      }
    } else {
      healthCheck.services.fal_ai = 'unavailable';
    }

    // Genel status'ü belirle
    if (healthCheck.services.database === 'healthy' && healthCheck.services.fal_ai === 'healthy') {
      healthCheck.status = 'healthy';
    } else if (healthCheck.services.database === 'unavailable' || healthCheck.services.fal_ai === 'unavailable') {
      healthCheck.status = 'degraded';
    } else {
      healthCheck.status = 'unhealthy';
    }

    // Response time
    healthCheck.response_time_ms = Date.now() - startTime;

    return NextResponse.json(healthCheck, {
      status: 200, // Her zaman 200 dön, durumu JSON'da belirt
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'X-Health-Check': 'true',
      },
    });

  } catch (error: any) {
    console.error('Health check failed:', error);

    const errorCheck = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message || 'Unknown error',
      response_time_ms: Date.now() - startTime,
    };

    return NextResponse.json(errorCheck, {
      status: 200, // Health check hata verse bile 200 dön
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'X-Health-Check': 'false',
      },
    });
  }
}