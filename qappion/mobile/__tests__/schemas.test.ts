import { describe, it, expect } from 'vitest';
import { loginSchema, otpSchema, onboardingSchema } from '@/src/features/auth/schemas';

describe('Auth Schemas', () => {
  describe('loginSchema', () => {
    it('should validate correct email', () => {
      const result = loginSchema.safeParse({ email: 'test@example.com' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = loginSchema.safeParse({ email: 'invalid-email' });
      expect(result.success).toBe(false);
    });

    it('should reject empty email', () => {
      const result = loginSchema.safeParse({ email: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('otpSchema', () => {
    it('should validate correct OTP', () => {
      const result = otpSchema.safeParse({ 
        email: 'test@example.com', 
        token: '123456' 
      });
      expect(result.success).toBe(true);
    });

    it('should reject short OTP', () => {
      const result = otpSchema.safeParse({ 
        email: 'test@example.com', 
        token: '123' 
      });
      expect(result.success).toBe(false);
    });
  });

  describe('onboardingSchema', () => {
    it('should validate correct onboarding data', () => {
      const result = onboardingSchema.safeParse({
        interests: ['Teknoloji', 'Spor'],
        city: 'İstanbul',
        locationPermission: true,
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty interests', () => {
      const result = onboardingSchema.safeParse({
        interests: [],
        city: 'İstanbul',
        locationPermission: true,
      });
      expect(result.success).toBe(false);
    });
  });
});
