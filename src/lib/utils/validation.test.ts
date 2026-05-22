import { describe, it, expect } from 'vitest';
import { ZodError } from 'zod';
import { emailSchema, passwordSchema } from './validation';
import { ERROR_MESSAGES } from './constants';

describe('Validation Schemas', () => {
  describe('emailSchema', () => {
    it('should pass for a valid email', () => {
      expect(() => emailSchema.parse('test@example.com')).not.toThrow();
    });

    it('should fail for an invalid email format', () => {
      expect(() => emailSchema.parse('invalid-email')).toThrow('Veuillez saisir une adresse email valide.');
    });

    it('should fail for an empty string with a required message', () => {
      // Zod's .min(1) should now catch this and provide the correct error message.
      expect(() => emailSchema.parse('')).toThrow(ERROR_MESSAGES.REQUIRED_FIELD);
    });
  });

  describe('passwordSchema', () => {
    it('should pass for a valid password', () => {
      expect(() => passwordSchema.parse('password123')).not.toThrow();
    });

    it('should fail for a password that is too short', () => {
      // The schema requires 8 characters, so we test against that.
      // We also check the specific Zod error message.
      try {
        passwordSchema.parse('12345');
        throw new Error('Parsing should have failed for a short password.');
      } catch (error) {
        expect(error).toBeInstanceOf(ZodError);
        if (error instanceof ZodError) {
          expect(error.issues[0].message).toBe(ERROR_MESSAGES.PASSWORD_TOO_SHORT(8));
        }
      }
    });
  });
});