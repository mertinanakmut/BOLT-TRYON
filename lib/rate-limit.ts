// lib/rate-limit.ts
interface RateLimitConfig {
  limit: number;
  windowMs: number;
  message?: string;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  limit: 10,
  windowMs: 10000, // 10 seconds
  message: 'Too many requests, please try again later.',
};

export class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>();
  private config: RateLimitConfig;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  check(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    let record = this.requests.get(ip);

    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + this.config.windowMs };
      this.requests.set(ip, record);
    } else if (record.count >= this.config.limit) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
      };
    } else {
      record.count++;
    }

    return {
      allowed: true,
      remaining: Math.max(0, this.config.limit - record.count),
      resetTime: record.resetTime,
    };
  }

  cleanup() {
    const now = Date.now();
    for (const [ip, record] of this.requests.entries()) {
      if (now > record.resetTime + 60000) { // 1 minute after expiry
        this.requests.delete(ip);
      }
    }
  }
}

// Per-endpoint rate limiters
export const apiRateLimiter = new RateLimiter({ limit: 10 });
export const authRateLimiter = new RateLimiter({ limit: 5 });
export const tryOnRateLimiter = new RateLimiter({ limit: 3, windowMs: 60000 }); // 3/min

// Cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    apiRateLimiter.cleanup();
    authRateLimiter.cleanup();
    tryOnRateLimiter.cleanup();
  }, 5 * 60 * 1000);
}