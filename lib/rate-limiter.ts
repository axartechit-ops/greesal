/**
 * In-memory sliding window Rate Limiter for Next.js API routes.
 * Enforces:
 * 1. Minimum 1000ms (1 second) cooldown between consecutive requests per user.
 * 2. Maximum 5 OTP requests per minute (60 seconds) per user.
 */

interface RateLimitRecord {
  lastRequestTime: number;
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up stale entries every 5 minutes to prevent memory buildup
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      // If last request was more than 10 minutes ago, delete entry
      if (now - record.lastRequestTime > 10 * 60 * 1000) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitResult {
  allowed: boolean;
  error?: string;
  retryAfterSeconds?: number;
}

/**
 * Check if the user is within the rate limits.
 * @param identifier User identifier (email, phone, or IP)
 * @param minIntervalMs Minimum interval between consecutive requests in ms (default: 1000ms)
 * @param maxPerMinute Maximum requests per 60 seconds window (default: 5)
 */
export function checkOtpRateLimit(
  identifier: string,
  minIntervalMs: number = 1000,
  maxPerMinute: number = 5
): RateLimitResult {
  const normalizedId = identifier.trim().toLowerCase();
  const now = Date.now();

  const record = rateLimitStore.get(normalizedId) || {
    lastRequestTime: 0,
    timestamps: [],
  };

  // 1. Check 1000ms cooldown rule
  const timeSinceLast = now - record.lastRequestTime;
  if (record.lastRequestTime > 0 && timeSinceLast < minIntervalMs) {
    const remainingMs = minIntervalMs - timeSinceLast;
    return {
      allowed: false,
      error: `Please wait at least ${(minIntervalMs / 1000).toFixed(1)}s between OTP requests.`,
      retryAfterSeconds: Math.ceil(remainingMs / 1000),
    };
  }

  // 2. Clean up timestamps older than 60 seconds (1 minute window)
  const windowStart = now - 60 * 1000;
  const recentTimestamps = record.timestamps.filter((ts) => ts > windowStart);

  // 3. Check 5 requests per minute rule
  if (recentTimestamps.length >= maxPerMinute) {
    const oldestInWindow = recentTimestamps[0];
    const resetTimeMs = oldestInWindow + 60 * 1000 - now;
    const retryAfter = Math.max(1, Math.ceil(resetTimeMs / 1000));
    return {
      allowed: false,
      error: `Rate limit exceeded: Maximum ${maxPerMinute} OTP requests allowed per minute per user. Please wait ${retryAfter}s.`,
      retryAfterSeconds: retryAfter,
    };
  }

  // Record valid request
  recentTimestamps.push(now);
  rateLimitStore.set(normalizedId, {
    lastRequestTime: now,
    timestamps: recentTimestamps,
  });

  return {
    allowed: true,
  };
}
