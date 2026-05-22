import { describe, it, expect } from 'vitest';
import {
  API_CONFIG,
  APP_CONFIG,
  SEARCH_CONFIG,
  PLAN_LIMITS,
  ERROR_MESSAGES,
  LOCAL_STORAGE_KEYS,
} from './constants';

// Mock environment variables for testing purposes.
// In a real Vitest setup, this might be in a dedicated setup file.
if (process.env.NODE_ENV === 'test') {
  process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
  process.env.VITE_SUPABASE_ANON_KEY = 'test_anon_key';
}

describe('Application Constants', () => {
  describe('API_CONFIG', () => {
    it('should contain correct BOAMP V2.1 configuration', () => {
      expect(API_CONFIG.BOAMP.BASE_URL).toBe('https://www.boamp.fr/api/explore/v2.1/catalog/datasets/boamp/records');
      expect(API_CONFIG.BOAMP.TIMEOUT).toBe(15000);
    });

    it('should contain Supabase configuration from environment variables', async () => {
      const MOCK_URL = 'https://test.supabase.co';
      const MOCK_KEY = 'test_anon_key';

      vi.stubEnv('VITE_SUPABASE_URL', MOCK_URL);
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', MOCK_KEY);

      // Reset modules to ensure constants are re-evaluated with the mocked env
      vi.resetModules();
      const { API_CONFIG } = await import('./constants');

      expect(API_CONFIG.SUPABASE.URL).toBe(MOCK_URL);
      expect(API_CONFIG.SUPABASE.ANON_KEY).toBe(MOCK_KEY);

      vi.unstubAllEnvs();
    });
  });

  describe('APP_CONFIG', () => {
    it('should have correct application details', () => {
      expect(APP_CONFIG.NAME).toBe('AOMaster');
      expect(APP_CONFIG.RESULTS_PER_PAGE).toBe(20);
      // A simple regex to check for semantic versioning format
      expect(APP_CONFIG.VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  describe('SEARCH_CONFIG', () => {
    it('should have correct search parameters', () => {
      expect(SEARCH_CONFIG.MAX_QUERY_LENGTH).toBe(255);
      expect(SEARCH_CONFIG.DEBOUNCE_DELAY).toBe(500);
      expect(SEARCH_CONFIG.DEFAULT_FILTERS).toBeInstanceOf(Object);
    });
  });

  describe('PLAN_LIMITS', () => {
    it('should define limits for all plans', () => {
      expect(PLAN_LIMITS.FREE).toBeDefined();
      expect(PLAN_LIMITS.PRO).toBeDefined();
      expect(PLAN_LIMITS.ENTERPRISE).toBeDefined();
      expect(PLAN_LIMITS.FREE.MAX_ALERTS).toBe(3);
      expect(PLAN_LIMITS.PRO.DAILY_API_CALLS).toBe(1000);
      expect(PLAN_LIMITS.ENTERPRISE.MAX_SAVED_SEARCHES).toBe(Infinity);
    });
  });

  describe('ERROR_MESSAGES', () => {
    it('should contain a variety of standardized error messages', () => {
      expect(ERROR_MESSAGES.UNEXPECTED).toBe('Une erreur inattendue est survenue. Veuillez réessayer plus tard.');
      expect(ERROR_MESSAGES.INVALID_EMAIL).toBe('Veuillez saisir une adresse email valide.');
    });

    it('should correctly format functional error messages', () => {
      const minLength = 8;
      const expectedMessage = `Le mot de passe doit contenir au moins ${minLength} caractères.`;
      expect(ERROR_MESSAGES.PASSWORD_TOO_SHORT(minLength)).toBe(expectedMessage);
    });
  });

  describe('LOCAL_STORAGE_KEYS', () => {
    it('should define all necessary local storage keys', () => {
      expect(LOCAL_STORAGE_KEYS.AUTH_TOKEN).toBe('aomaster-auth-token');
      expect(LOCAL_STORAGE_KEYS.THEME).toBe('aomaster-theme');
      expect(LOCAL_STORAGE_KEYS.SAVED_SEARCHES).toBe('aomaster-saved-searches');
    });
  });
});
