import { describe, it, expect, vi, beforeEach } from 'vitest';
import { rateLimit, RateLimitError } from '@/lib/rate-limit';

// Isolate from Supabase — use in-memory path by clearing the env var
vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    rpc: vi.fn().mockResolvedValue({ data: null, error: new Error('mocked') }),
  },
}));

// Ensure we're NOT in production so the in-memory fallback activates
vi.stubEnv('NODE_ENV', 'test');
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');

describe('RateLimitError', () => {
  it('has name RateLimitError', () => {
    const err = new RateLimitError('Too many requests');
    expect(err.name).toBe('RateLimitError');
  });

  it('has status 429', () => {
    const err = new RateLimitError('Too many requests');
    expect(err.status).toBe(429);
  });

  it('inherits from Error', () => {
    const err = new RateLimitError('msg');
    expect(err).toBeInstanceOf(Error);
  });
});

describe('rateLimit (in-memory fallback)', () => {
  beforeEach(() => {
    // Each test gets a unique token to avoid cross-test state sharing
    vi.clearAllMocks();
  });

  it('allows requests within the limit', async () => {
    const limiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 100, limit: 5 });
    const token = `test-allow-${Date.now()}-${Math.random()}`;
    // Should not throw for first 5 calls
    for (let i = 0; i < 5; i++) {
      await expect(limiter.check(5, token)).resolves.toBeUndefined();
    }
  });

  it('throws RateLimitError when limit is exceeded', async () => {
    const limiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 100, limit: 3 });
    const token = `test-exceeded-${Date.now()}-${Math.random()}`;
    // Exhaust the limit
    for (let i = 0; i < 3; i++) {
      await limiter.check(3, token);
    }
    // 4th call should throw
    await expect(limiter.check(3, token)).rejects.toBeInstanceOf(RateLimitError);
  });

  it('rejects with a message mentioning seconds', async () => {
    const limiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 100, limit: 1 });
    const token = `test-msg-${Date.now()}-${Math.random()}`;
    await limiter.check(1, token);
    try {
      await limiter.check(1, token);
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(RateLimitError);
      expect((err as RateLimitError).message).toMatch(/segundo/);
    }
  });

  it('different tokens do not share counts', async () => {
    const limiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 100, limit: 1 });
    const tokenA = `test-a-${Date.now()}-${Math.random()}`;
    const tokenB = `test-b-${Date.now()}-${Math.random()}`;
    await limiter.check(1, tokenA);
    // tokenB should still work even though tokenA is exhausted
    await expect(limiter.check(1, tokenB)).resolves.toBeUndefined();
  });

  it('resets after the interval window passes', async () => {
    const limiter = rateLimit({ interval: 50, uniqueTokenPerInterval: 100, limit: 1 });
    const token = `test-reset-${Date.now()}-${Math.random()}`;
    await limiter.check(1, token);
    // Wait for window to expire
    await new Promise((r) => setTimeout(r, 60));
    // Should be allowed again
    await expect(limiter.check(1, token)).resolves.toBeUndefined();
  });
});
