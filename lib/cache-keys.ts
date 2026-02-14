// ===========================================
// LUUC.AI - Cache Key Patterns
// ===========================================
// Centralized cache key generation for consistency
// Pattern: resource:id:subresource
// ===========================================

export const CacheKeys = {
  // User cache keys
  user: {
    profile: (userId: string) => `user:${userId}:profile`,
    usage: (userId: string) => `user:${userId}:usage`,
    stats: (userId: string) => `user:${userId}:stats`,
  },

  // Company cache keys
  company: {
    info: (companyId: string) => `company:${companyId}:info`,
    documents: (companyId: string) => `company:${companyId}:documents`,
    stats: (companyId: string) => `company:${companyId}:stats`,
    instructions: (companyId: string) => `company:${companyId}:instructions`,
    contextDocs: (companyId: string, docType: string) =>
      `company:${companyId}:context:${docType}`,
  },

  // Knowledge Base cache keys
  kb: {
    categories: (companyId: string) => `kb:${companyId}:categories`,
    category: (companyId: string, categoryId: string) =>
      `kb:${companyId}:category:${categoryId}`,
    document: (documentId: string) => `kb:document:${documentId}`,
    stats: (companyId: string) => `kb:${companyId}:stats`,
    search: (companyId: string, query: string) =>
      `kb:${companyId}:search:${query}`,
  },

  // Templates cache keys
  templates: {
    all: () => "templates:all",
    byType: (docType: string) => `templates:type:${docType}`,
  },

  // Rate limiting cache keys
  rateLimit: {
    generate: (userId: string) => `rate-limit:${userId}:generate`,
    analyze: (userId: string) => `rate-limit:${userId}:analyze`,
    api: (userId: string, endpoint: string) =>
      `rate-limit:${userId}:${endpoint}`,
  },

  // Document cache keys
  document: {
    byId: (documentId: string) => `document:${documentId}`,
    userHistory: (userId: string) => `document:user:${userId}:history`,
    companyHistory: (companyId: string) =>
      `document:company:${companyId}:history`,
  },

  // Analysis cache keys
  analysis: {
    byId: (analysisId: string) => `analysis:${analysisId}`,
    userHistory: (userId: string) => `analysis:user:${userId}:history`,
  },
} as const;

// Default TTL values (in seconds)
export const CacheTTL = {
  // Short-lived cache (5 minutes)
  SHORT: 300,

  // Medium-lived cache (10 minutes)
  MEDIUM: 600,

  // Long-lived cache (30 minutes)
  LONG: 1800,

  // Very long cache (1 hour)
  VERY_LONG: 3600,

  // Rate limiting (1 minute)
  RATE_LIMIT: 60,

  // User profile (5 minutes)
  USER_PROFILE: 300,

  // Company info (10 minutes)
  COMPANY_INFO: 600,

  // Templates (1 hour)
  TEMPLATES: 3600,

  // Knowledge Base categories (10 minutes)
  KB_CATEGORIES: 600,

  // Search results (5 minutes)
  SEARCH_RESULTS: 300,

  // Usage stats (5 minutes)
  USAGE_STATS: 300,
} as const;

// Helper to generate wildcard patterns for cache invalidation
export const CachePatterns = {
  user: (userId: string) => `user:${userId}:*`,
  company: (companyId: string) => `company:${companyId}:*`,
  kb: (companyId: string) => `kb:${companyId}:*`,
  userDocuments: (userId: string) => `document:user:${userId}:*`,
  companyDocuments: (companyId: string) => `document:company:${companyId}:*`,
} as const;
