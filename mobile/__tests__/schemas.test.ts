import { describe, it, expect } from 'vitest';
import { loginSchema, otpSchema } from '../src/features/auth/schemas';

describe('Auth Schemas', () => {
  describe('loginSchema', () => {
    it('should validate correct email', () => {
      const validData = { email: 'test@example.com' };
      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = { email: 'invalid-email' };
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept optional phone', () => {
      const validData = { email: 'test@example.com', phone: '+905551234567' };
      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('otpSchema', () => {
    it('should validate 6-digit code', () => {
      const validData = { code: '123456' };
      const result = otpSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject short code', () => {
      const invalidData = { code: '12345' };
      const result = otpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject long code', () => {
      const invalidData = { code: '1234567' };
      const result = otpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
