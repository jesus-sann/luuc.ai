import { describe, it, expect } from 'vitest';
import {
  DOCUMENT_TYPES,
  CUSTOM_DOCUMENT_TYPES,
  ALLOWED_CUSTOM_DOCUMENT_TYPES,
  USAGE_ACTION_TYPES,
  RISK_LEVELS,
  PLANS,
  COMPANY_DOCUMENT_CATEGORIES,
  KB_FILE_TYPES,
  COMPANY_STATUSES,
  USER_ROLES,
  HTTP_STATUS,
  PLAN_LIMITS,
  AI_PROVIDERS,
  AI_MODELS,
  CLAUDE_MODEL,
  TIMEOUTS,
} from '@/lib/constants';

describe('constants', () => {
  describe('DOCUMENT_TYPES', () => {
    it('contains expected document type values', () => {
      expect(DOCUMENT_TYPES.NDA).toBe('nda');
      expect(DOCUMENT_TYPES.CONTRATO).toBe('contrato');
      expect(DOCUMENT_TYPES.CARTA_CORREO).toBe('carta_correo');
    });

    it('has no duplicate values', () => {
      const values = Object.values(DOCUMENT_TYPES);
      expect(new Set(values).size).toBe(values.length);
    });
  });

  describe('ALLOWED_CUSTOM_DOCUMENT_TYPES', () => {
    it('is derived from CUSTOM_DOCUMENT_TYPES values', () => {
      const expected = Object.values(CUSTOM_DOCUMENT_TYPES);
      expect(ALLOWED_CUSTOM_DOCUMENT_TYPES).toEqual(expect.arrayContaining(expected));
      expect(ALLOWED_CUSTOM_DOCUMENT_TYPES.length).toBe(expected.length);
    });

    it('includes contrato and carta', () => {
      expect(ALLOWED_CUSTOM_DOCUMENT_TYPES).toContain('contrato');
      expect(ALLOWED_CUSTOM_DOCUMENT_TYPES).toContain('carta');
    });
  });

  describe('USAGE_ACTION_TYPES', () => {
    it('has generate and analyze actions', () => {
      expect(USAGE_ACTION_TYPES.GENERATE).toBe('generate');
      expect(USAGE_ACTION_TYPES.ANALYZE).toBe('analyze');
    });
  });

  describe('RISK_LEVELS', () => {
    it('contains all four risk levels', () => {
      expect(Object.keys(RISK_LEVELS)).toHaveLength(4);
      expect(RISK_LEVELS.CRITICO).toBe('CRITICO');
      expect(RISK_LEVELS.BAJO).toBe('BAJO');
    });
  });

  describe('PLANS', () => {
    it('has free, pro, enterprise', () => {
      expect(PLANS.FREE).toBe('free');
      expect(PLANS.PRO).toBe('pro');
      expect(PLANS.ENTERPRISE).toBe('enterprise');
    });
  });

  describe('PLAN_LIMITS', () => {
    it('free tier has lower limits than pro', () => {
      expect(PLAN_LIMITS.FREE.DOCUMENTS).toBeLessThan(PLAN_LIMITS.PRO.DOCUMENTS);
      expect(PLAN_LIMITS.FREE.ANALYSES).toBeLessThan(PLAN_LIMITS.PRO.ANALYSES);
    });

    it('enterprise has infinite document limit', () => {
      expect(PLAN_LIMITS.ENTERPRISE.DOCUMENTS).toBe(Infinity);
      expect(PLAN_LIMITS.ENTERPRISE.ANALYSES).toBe(Infinity);
    });

    it('free tier has no KB access', () => {
      expect(PLAN_LIMITS.FREE.KB_DOCUMENTS).toBe(0);
      expect(PLAN_LIMITS.FREE.KB_SIZE_MB).toBe(0);
    });

    it('free tier allows 10 documents and 5 analyses', () => {
      expect(PLAN_LIMITS.FREE.DOCUMENTS).toBe(10);
      expect(PLAN_LIMITS.FREE.ANALYSES).toBe(5);
    });
  });

  describe('USER_ROLES', () => {
    it('has owner, admin, member', () => {
      expect(USER_ROLES.OWNER).toBe('owner');
      expect(USER_ROLES.ADMIN).toBe('admin');
      expect(USER_ROLES.MEMBER).toBe('member');
    });
  });

  describe('HTTP_STATUS', () => {
    it('has standard HTTP codes', () => {
      expect(HTTP_STATUS.OK).toBe(200);
      expect(HTTP_STATUS.CREATED).toBe(201);
      expect(HTTP_STATUS.BAD_REQUEST).toBe(400);
      expect(HTTP_STATUS.UNAUTHORIZED).toBe(401);
      expect(HTTP_STATUS.FORBIDDEN).toBe(403);
      expect(HTTP_STATUS.NOT_FOUND).toBe(404);
      expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
    });
  });

  describe('AI_PROVIDERS', () => {
    it('has anthropic, google, groq', () => {
      expect(AI_PROVIDERS.ANTHROPIC).toBe('anthropic');
      expect(AI_PROVIDERS.GOOGLE).toBe('google');
      expect(AI_PROVIDERS.GROQ).toBe('groq');
    });
  });

  describe('AI_MODELS', () => {
    it('CLAUDE_MODEL alias matches AI_MODELS.ANTHROPIC', () => {
      expect(CLAUDE_MODEL).toBe(AI_MODELS.ANTHROPIC);
    });

    it('anthropic model is a claude model', () => {
      expect(AI_MODELS.ANTHROPIC).toMatch(/^claude/);
    });
  });

  describe('TIMEOUTS', () => {
    it('claude API timeout is at least 30 seconds', () => {
      expect(TIMEOUTS.CLAUDE_API).toBeGreaterThanOrEqual(30000);
    });

    it('database query timeout is reasonable', () => {
      expect(TIMEOUTS.DATABASE_QUERY).toBeGreaterThan(0);
      expect(TIMEOUTS.DATABASE_QUERY).toBeLessThanOrEqual(30000);
    });
  });

  describe('COMPANY_DOCUMENT_CATEGORIES', () => {
    it('has aprobado, borrador, ejemplo', () => {
      expect(COMPANY_DOCUMENT_CATEGORIES.APROBADO).toBe('aprobado');
      expect(COMPANY_DOCUMENT_CATEGORIES.BORRADOR).toBe('borrador');
      expect(COMPANY_DOCUMENT_CATEGORIES.EJEMPLO).toBe('ejemplo');
    });
  });

  describe('KB_FILE_TYPES', () => {
    it('supports pdf, docx, txt', () => {
      expect(KB_FILE_TYPES.PDF).toBe('pdf');
      expect(KB_FILE_TYPES.DOCX).toBe('docx');
      expect(KB_FILE_TYPES.TXT).toBe('txt');
    });
  });

  describe('COMPANY_STATUSES', () => {
    it('has active, inactive, suspended', () => {
      expect(COMPANY_STATUSES.ACTIVE).toBe('active');
      expect(COMPANY_STATUSES.INACTIVE).toBe('inactive');
      expect(COMPANY_STATUSES.SUSPENDED).toBe('suspended');
    });
  });
});
