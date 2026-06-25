import { supabaseAdmin } from "./supabase";

export interface RateLimitConfig {
  interval: number; // milliseconds
  uniqueTokenPerInterval: number;
  limit: number;
}

export class RateLimitError extends Error {
  status: number;
  constructor(message: string) {
    super(message);
    this.name = "RateLimitError";
    this.status = 429;
  }
}

// In-memory fallback used in dev or when Supabase is unreachable
interface TokenData {
  count: number;
  resetTime: number;
}
const memoryCache = new Map<string, TokenData>();

function checkMemory(key: string, limit: number, windowMs: number): void {
  const now = Date.now();
  const data = memoryCache.get(key);

  if (!data || now > data.resetTime) {
    memoryCache.set(key, { count: 1, resetTime: now + windowMs });
    return;
  }

  if (data.count >= limit) {
    const secondsLeft = Math.ceil((data.resetTime - now) / 1000);
    throw new RateLimitError(
      `Demasiadas solicitudes. Intenta de nuevo en ${secondsLeft} segundos.`
    );
  }

  data.count++;
}

async function checkSupabase(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<void> {
  const { data, error } = await supabaseAdmin.rpc(
    "check_and_increment_rate_limit",
    { p_key: key, p_limit: limit, p_window_seconds: windowSeconds }
  );

  if (error) throw error;

  const result = Array.isArray(data) ? data[0] : data;
  if (!result?.allowed) {
    const secondsLeft = Math.ceil(
      (new Date(result.reset_at).getTime() - Date.now()) / 1000
    );
    throw new RateLimitError(
      `Demasiadas solicitudes. Intenta de nuevo en ${Math.max(1, secondsLeft)} segundos.`
    );
  }
}

export function rateLimit(config: RateLimitConfig) {
  const windowSeconds = Math.floor(config.interval / 1000);
  const useSupabase = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  return {
    check: async (limit: number, token: string): Promise<void> => {
      const key = `rl:${token}`;

      if (useSupabase) {
        try {
          await checkSupabase(key, limit, windowSeconds);
          return;
        } catch (err) {
          if (err instanceof RateLimitError) throw err;
          // Supabase unreachable — in production, fail closed (strict) so limits
          // are never bypassed during cold-start or connectivity loss.
          // In dev/test, degrade to in-memory so local iteration isn't blocked.
          if (process.env.NODE_ENV === "production") {
            console.error("[rate-limit] Supabase RPC failed in production; denying request:", err);
            throw new RateLimitError("Servicio temporalmente no disponible. Intenta de nuevo en un momento.");
          }
          console.warn("[rate-limit] Supabase RPC failed, using in-memory fallback:", err);
        }
      }

      checkMemory(key, limit, config.interval);
    },
  };
}
