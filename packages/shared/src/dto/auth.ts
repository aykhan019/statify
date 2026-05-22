import { z } from 'zod';

export const UserRoleSchema = z.enum(['user', 'admin']);

export const AuthUserSchema = z.object({
  id: z.number().int(),
  email: z.string().email(),
  displayName: z.string(),
  role: UserRoleSchema,
});

export const RegisterRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(200),
  displayName: z.string().trim().min(1).max(100),
});

export const LoginRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(200),
});

export const AuthResponseSchema = z.object({
  user: AuthUserSchema,
});

export type UserRole = z.infer<typeof UserRoleSchema>;
export type AuthUser = z.infer<typeof AuthUserSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
