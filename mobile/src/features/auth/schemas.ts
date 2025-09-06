import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Geçerli bir email adresi girin'),
  phone: z.string().optional(),
});

export const otpSchema = z.object({
  code: z.string().min(6, 'OTP kodu 6 haneli olmalı').max(6),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type OtpForm = z.infer<typeof otpSchema>;
