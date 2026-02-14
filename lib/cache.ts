// ===========================================
// LUUC.AI - Vercel KV Cache Layer
// ===========================================
// Redis-based caching with graceful fallback
// ===========================================

import type { VercelKV } from "@vercel/kv";
import { CacheKeys, CacheTTL } from "./cache-keys";
import type { AuthUser } from "./auth";
import type { Company } from "./company";

// ===========================================
// TYPE DEFINITIONS
// ===========================================

interface CacheConfig {
  enabled: boolean;
  logMisses: boolean;
  logHits: boolean;
}

let kv: VercelKV | null = null;

// ===========================================
// CONFIGURATION
// ===========================================

const config: CacheConfig = {
  enabled: !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN),
  logMisses: process.env.NODE_ENV === "development",
  logHits: process.env.NODE_ENV === "development",
};

// Initialize KV client
async function getKV(): Promise<VercelKV | null> {
  if (!config.enabled) return null;
  if (kv) return kv;

  try {
    const vercelKV = await import("@vercel/kv");
    kv = vercelKV.kv;
    return kv;
  } catch {
    console.warn("[Cache] @vercel/kv package not installed. Run: npm install @vercel/kv");
    config.enabled = false;
    return null;
  }
}

// Log warning if cache is disabled
if (!config.enabled && process.env.NODE_ENV !== "test") {
  console.warn(
    "[Cache] Vercel KV not configured - caching disabled. Set KV_REST_API_URL and KV_REST_API_TOKEN to enable caching."
  );
}

// ===========================================
// CORE CACHE OPERATIONS
// ===========================================

export async function getCache<T>(key: string): Promise<T | null> {
  const kvClient = await getKV();
  if (!kvClient) return null;

  try {
    const value = await kvClient.get(key) as T | null;

    if (config.logHits && value !== null) {
      console.log(`[Cache HIT] ${key}`);
    } else if (config.logMisses && value === null) {
      console.log(`[Cache MISS] ${key}`);
    }

    return value;
  } catch (error) {
    console.error(`[Cache Error] Failed to get key: ${key}`, error);
    return null;
  }
}

export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds: number = CacheTTL.SHORT
): Promise<void> {
  const kvClient = await getKV();
  if (!kvClient) return;

  try {
    await kvClient.set(key, value, { ex: ttlSeconds });

    if (process.env.NODE_ENV === "development") {
      console.log(`[Cache SET] ${key} (TTL: ${ttlSeconds}s)`);
    }
  } catch (error) {
    console.error(`[Cache Error] Failed to set key: ${key}`, error);
  }
}

export async function deleteCache(key: string): Promise<void> {
  const kvClient = await getKV();
  if (!kvClient) return;

  try {
    await kvClient.del(key);

    if (process.env.NODE_ENV === "development") {
      console.log(`[Cache DELETE] ${key}`);
    }
  } catch (error) {
    console.error(`[Cache Error] Failed to delete key: ${key}`, error);
  }
}

export async function withCache<T>(
  key: string,
  ttl: number,
  fn: () => Promise<T>
): Promise<T> {
  const cached = await getCache<T>(key);
  if (cached !== null) {
    return cached;
  }

  const result = await fn();
  void setCache(key, result, ttl);

  return result;
}

// ===========================================
// USER PROFILE CACHING
// ===========================================

export async function cacheUserProfile(
  userId: string,
  profile: AuthUser,
  ttl: number = CacheTTL.USER_PROFILE
): Promise<void> {
  const key = CacheKeys.user.profile(userId);
  await setCache(key, profile, ttl);
}

export async function getCachedUserProfile(
  userId: string
): Promise<AuthUser | null> {
  const key = CacheKeys.user.profile(userId);
  return getCache<AuthUser>(key);
}

export async function cacheUserUsage(
  userId: string,
  usage: { documents: number; analyses: number },
  ttl: number = CacheTTL.USAGE_STATS
): Promise<void> {
  const key = CacheKeys.user.usage(userId);
  await setCache(key, usage, ttl);
}

export async function getCachedUserUsage(userId: string): Promise<{
  documents: number;
  analyses: number;
} | null> {
  const key = CacheKeys.user.usage(userId);
  return getCache<{ documents: number; analyses: number }>(key);
}

export async function invalidateUserCache(userId: string): Promise<void> {
  await Promise.all([
    deleteCache(CacheKeys.user.profile(userId)),
    deleteCache(CacheKeys.user.usage(userId)),
    deleteCache(CacheKeys.user.stats(userId)),
  ]);

  if (process.env.NODE_ENV === "development") {
    console.log(`[Cache] Invalidated all cache for user: ${userId}`);
  }
}

// ===========================================
// COMPANY CACHING
// ===========================================

export async function cacheCompanyInfo(
  companyId: string,
  info: Company,
  ttl: number = CacheTTL.COMPANY_INFO
): Promise<void> {
  const key = CacheKeys.company.info(companyId);
  await setCache(key, info, ttl);
}

export async function getCachedCompanyInfo(
  companyId: string
): Promise<Company | null> {
  const key = CacheKeys.company.info(companyId);
  return getCache<Company>(key);
}

export async function cacheCompanyInstructions(
  companyId: string,
  instructions: string,
  ttl: number = CacheTTL.COMPANY_INFO
): Promise<void> {
  const key = CacheKeys.company.instructions(companyId);
  await setCache(key, instructions, ttl);
}

export async function getCachedCompanyInstructions(
  companyId: string
): Promise<string | null> {
  const key = CacheKeys.company.instructions(companyId);
  return getCache<string>(key);
}

export async function invalidateCompanyCache(companyId: string): Promise<void> {
  await Promise.all([
    deleteCache(CacheKeys.company.info(companyId)),
    deleteCache(CacheKeys.company.documents(companyId)),
    deleteCache(CacheKeys.company.stats(companyId)),
    deleteCache(CacheKeys.company.instructions(companyId)),
  ]);

  if (process.env.NODE_ENV === "development") {
    console.log(`[Cache] Invalidated all cache for company: ${companyId}`);
  }
}

// ===========================================
// TEMPLATES CACHING
// ===========================================

export async function cacheTemplates<T>(
  templates: T[],
  ttl: number = CacheTTL.TEMPLATES
): Promise<void> {
  const key = CacheKeys.templates.all();
  await setCache(key, templates, ttl);
}

export async function getCachedTemplates<T>(): Promise<T[] | null> {
  const key = CacheKeys.templates.all();
  return getCache<T[]>(key);
}

export async function invalidateTemplatesCache(): Promise<void> {
  await deleteCache(CacheKeys.templates.all());
}

// ===========================================
// KNOWLEDGE BASE CACHING
// ===========================================

export async function cacheKBCategories<T>(
  companyId: string,
  categories: T[],
  ttl: number = CacheTTL.KB_CATEGORIES
): Promise<void> {
  const key = CacheKeys.kb.categories(companyId);
  await setCache(key, categories, ttl);
}

export async function getCachedKBCategories<T>(
  companyId: string
): Promise<T[] | null> {
  const key = CacheKeys.kb.categories(companyId);
  return getCache<T[]>(key);
}

export async function invalidateKBCache(companyId: string): Promise<void> {
  await Promise.all([
    deleteCache(CacheKeys.kb.categories(companyId)),
    deleteCache(CacheKeys.kb.stats(companyId)),
  ]);

  if (process.env.NODE_ENV === "development") {
    console.log(`[Cache] Invalidated KB cache for company: ${companyId}`);
  }
}

// ===========================================
// RATE LIMITING WITH CACHE
// ===========================================

export async function checkRateLimit(
  userId: string,
  action: "generate" | "analyze",
  limit: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const kvClient = await getKV();
  if (!kvClient) {
    return { allowed: true, remaining: limit, resetAt: Date.now() + 60000 };
  }

  const key =
    action === "generate"
      ? CacheKeys.rateLimit.generate(userId)
      : CacheKeys.rateLimit.analyze(userId);

  try {
    const current = ((await kvClient.get(key)) as number | null) || 0;

    if (current >= limit) {
      const ttl = await kvClient.ttl(key);
      return {
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + (ttl > 0 ? ttl * 1000 : 60000),
      };
    }

    const newCount = await kvClient.incr(key);

    if (newCount === 1) {
      await kvClient.expire(key, CacheTTL.RATE_LIMIT);
    }

    return {
      allowed: true,
      remaining: limit - newCount,
      resetAt: Date.now() + CacheTTL.RATE_LIMIT * 1000,
    };
  } catch (error) {
    console.error(`[Cache Error] Rate limit check failed for ${key}`, error);
    return { allowed: true, remaining: limit, resetAt: Date.now() + 60000 };
  }
}

export async function resetRateLimit(
  userId: string,
  action: "generate" | "analyze"
): Promise<void> {
  const key =
    action === "generate"
      ? CacheKeys.rateLimit.generate(userId)
      : CacheKeys.rateLimit.analyze(userId);
  await deleteCache(key);
}

// ===========================================
// CACHE HEALTH CHECK
// ===========================================

export async function checkCacheHealth(): Promise<{
  available: boolean;
  configured: boolean;
  latency?: number;
}> {
  const kvClient = await getKV();
  if (!kvClient) {
    return { available: false, configured: false };
  }

  try {
    const start = Date.now();
    const testKey = "health-check";
    const testValue = { timestamp: start };

    await setCache(testKey, testValue, 10);
    const result = await getCache(testKey);
    await deleteCache(testKey);

    const latency = Date.now() - start;

    return {
      available: result !== null,
      configured: true,
      latency,
    };
  } catch (error) {
    console.error("[Cache Health Check] Failed:", error);
    return { available: false, configured: true };
  }
}

// ===========================================
// EXPORTS
// ===========================================

export { CacheKeys, CacheTTL, config as cacheConfig };
