// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import { STATUS } from '@/lib/constants';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  
  const healthCheck = {
    status: 'healthy' as const,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: env.NODE_ENV,
    services: {
      api: 'healthy' as const,
      database: 'checking' as const,
      fal_ai: 'checking' as const,
      storage: 'healthy' as const,
    },
    metrics: {
      memory: process.memoryUsage(),
      response_time_ms: 0,
    },
  };

  try {
    // 1. Database health check
    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: false,
        },
      }
    );

    const { data, error, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .limit(1);

    if (error) {
      healthCheck.services.database = 'unhealthy';
      healthCheck.status = 'degraded';
    } else {
      healthCheck.services.database = 'healthy';
    }

    // 2. FAL AI health check (basic - just check if key exists)
    if (!env.FAL_API_KEY) {
      healthCheck.services.fal_ai = 'unhealthy';
      healthCheck.status = 'degraded';
    } else {
      healthCheck.services.fal_ai = 'healthy';
    }

    // Calculate response time
    healthCheck.metrics.response_time_ms = Date.now() - startTime;

    const statusCode = healthCheck.status === 'healthy' 
      ? STATUS.SUCCESS 
      : healthCheck.status === 'degraded' 
        ? STATUS.SERVICE_UNAVAILABLE 
        : STATUS.SERVER_ERROR;

    return NextResponse.json(healthCheck, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'X-Health-Check': 'true',
        'X-Response-Time': healthCheck.metrics.response_time_ms.toString(),
      },
    });

  } catch (error: any) {
    console.error('Health check failed:', error);

    healthCheck.status = 'unhealthy';
    healthCheck.services.database = 'unhealthy';
    healthCheck.services.fal_ai = 'unhealthy';
    healthCheck.metrics.response_time_ms = Date.now() - startTime;

    return NextResponse.json(healthCheck, {
      status: STATUS.SERVICE_UNAVAILABLE,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'X-Health-Check': 'true',
        'X-Error': error.message || 'Unknown error',
      },
    });
  }
}