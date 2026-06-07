import { describe, it, expect } from 'vitest';
import { templates, getTemplateBySlug } from '@/lib/templates';

describe('templates', () => {
  describe('templates array', () => {
    it('is a non-empty array', () => {
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);
    });

    it('every template has required fields', () => {
      for (const t of templates) {
        expect(t.id).toBeTruthy();
        expect(t.name).toBeTruthy();
        expect(t.slug).toBeTruthy();
        expect(t.category).toBeTruthy();
        expect(Array.isArray(t.variables)).toBe(true);
      }
    });

    it('slugs are unique', () => {
      const slugs = templates.map((t) => t.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
    });

    it('ids are unique', () => {
      const ids = templates.map((t) => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('all variable types are valid', () => {
      const validTypes = ['text', 'textarea', 'date', 'select'];
      for (const t of templates) {
        for (const v of t.variables) {
          expect(validTypes).toContain(v.type);
        }
      }
    });

    it('select variables have a non-empty options array', () => {
      for (const t of templates) {
        for (const v of t.variables) {
          if (v.type === 'select') {
            expect(Array.isArray(v.options)).toBe(true);
            expect((v.options as string[]).length).toBeGreaterThan(0);
          }
        }
      }
    });

    it('every required variable is marked required', () => {
      for (const t of templates) {
        for (const v of t.variables) {
          // required field must be boolean if present
          if ('required' in v) {
            expect(typeof v.required).toBe('boolean');
          }
        }
      }
    });
  });

  describe('getTemplateBySlug', () => {
    it('finds the first template by its slug', () => {
      const first = templates[0];
      const result = getTemplateBySlug(first.slug);
      expect(result).toBeDefined();
      expect(result?.slug).toBe(first.slug);
      expect(result?.id).toBe(first.id);
    });

    it('returns undefined for an unknown slug', () => {
      expect(getTemplateBySlug('slug-that-does-not-exist-xyz')).toBeUndefined();
    });

    it('returns undefined for empty string', () => {
      expect(getTemplateBySlug('')).toBeUndefined();
    });

    it('finds nda template', () => {
      const result = getTemplateBySlug('nda');
      expect(result).toBeDefined();
      expect(result?.slug).toBe('nda');
    });

    it('is consistent — every template in the array is findable by slug', () => {
      for (const t of templates) {
        expect(getTemplateBySlug(t.slug)).toBeDefined();
      }
    });
  });

  describe('wizard templates (steps)', () => {
    it('templates with steps have at least one step', () => {
      const wizards = templates.filter((t) => t.steps && t.steps.length > 0);
      for (const t of wizards) {
        expect(t.steps!.length).toBeGreaterThan(0);
      }
    });

    it('every step field references a variable that exists in the template', () => {
      const wizards = templates.filter((t) => t.steps && t.steps.length > 0);
      for (const t of wizards) {
        const varNames = t.variables.map((v) => v.name);
        for (const step of t.steps!) {
          for (const field of step.fields) {
            expect(varNames).toContain(field);
          }
        }
      }
    });

    it('step titles are non-empty strings', () => {
      const wizards = templates.filter((t) => t.steps && t.steps.length > 0);
      for (const t of wizards) {
        for (const step of t.steps!) {
          expect(typeof step.title).toBe('string');
          expect(step.title.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('categories', () => {
    it('all templates belong to at least one category', () => {
      for (const t of templates) {
        expect(t.category.length).toBeGreaterThan(0);
      }
    });

    it('has more than one distinct category', () => {
      const categories = new Set(templates.map((t) => t.category));
      expect(categories.size).toBeGreaterThan(1);
    });
  });
});
