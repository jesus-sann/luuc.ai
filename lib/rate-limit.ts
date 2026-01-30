/**
 * In-memory rate limiter with sliding window
 * Simple, no external dependencies, automatic cleanup
 */

interface RateLimitConfig {
  interval: number; // milliseconds
  uniqueTokenPerInterval: number; // max unique tokens to track
  limit: number; // max requests per interval
}

interface TokenData {
  count: number;
  resetTime: number;
}

export class RateLimitError extends Error {
  status: number;

  constructor(message: string) {
    super(message);
    this.name = "RateLimitError";
    this.status = 429;
  }
}

export function rateLimit(config: RateLimitConfig) {
  const tokenCache = new Map<string, TokenData>();
  let lastCleanup = Date.now();

  // Cleanup old entries every 5 minutes
  const cleanup = () => {
    const now = Date.now();
    if (now - lastCleanup < 5 * 60 * 1000) return;

    const entries = Array.from(tokenCache.entries());
    for (let i = 0; i < entries.length; i++) {
      const [token, data] = entries[i];
      if (now > data.resetTime) {
        tokenCache.delete(token);
      }
    }
    lastCleanup = now;

    // If still too many tokens, remove oldest ones
    if (tokenCache.size > config.uniqueTokenPerInterval) {
      const allEntries = Array.from(tokenCache.entries());
      allEntries.sort((a, b) => a[1].resetTime - b[1].resetTime);
      const toRemove = allEntries.slice(0, allEntries.length - config.uniqueTokenPerInterval);
      for (let i = 0; i < toRemove.length; i++) {
        tokenCache.delete(toRemove[i][0]);
      }
    }
  };

  return {
    check: async (limit: number, token: string): Promise<void> => {
      cleanup();

      const now = Date.now();
      const tokenData = tokenCache.get(token);

      if (!tokenData) {
        // First request from this token
        tokenCache.set(token, {
          count: 1,
          resetTime: now + config.interval,
        });
        return;
      }

      // Reset if interval has passed
      if (now > tokenData.resetTime) {
        tokenCache.set(token, {
          count: 1,
          resetTime: now + config.interval,
        });
        return;
      }

      // Check if limit exceeded
      if (tokenData.count >= limit) {
        throw new RateLimitError(
          `Demasiadas solicitudes. Intenta de nuevo en ${Math.ceil((tokenData.resetTime - now) / 1000)} segundos.`
        );
      }

      // Increment count
      tokenData.count++;
    },
  };
}
