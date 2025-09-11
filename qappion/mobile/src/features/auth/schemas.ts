import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Geçerli bir email adresi girin'),
});

export const otpSchema = z.object({
  email: z.string().email(),
  token: z.string().min(6, 'OTP 6 haneli olmalı'),
});

export const onboardingSchema = z.object({
  interests: z.array(z.string()).min(1, 'En az bir ilgi alanı seçin'),
  city: z.string().min(1, 'Şehir seçin'),
  locationPermission: z.boolean(),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type OtpForm = z.infer<typeof otpSchema>;
export type OnboardingForm = z.infer<typeof onboardingSchema>;
