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

export const PasswordChangeRequestSchema = z
  .object({
    currentPassword: z.string().min(1).max(200),
    newPassword: z.string().min(8).max(200),
  })
  .refine((value) => value.currentPassword !== value.newPassword, {
    message: 'New password must differ from current password',
    path: ['newPassword'],
  });

export const ProfileUpdateRequestSchema = z.object({
  displayName: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email(),
  currentPassword: z.string().min(1).max(200),
});

export const AccountDeleteRequestSchema = z.object({
  currentPassword: z.string().min(1).max(200),
});

export type UserRole = z.infer<typeof UserRoleSchema>;
export type AuthUser = z.infer<typeof AuthUserSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type PasswordChangeRequest = z.infer<typeof PasswordChangeRequestSchema>;
export type ProfileUpdateRequest = z.infer<typeof ProfileUpdateRequestSchema>;
export type AccountDeleteRequest = z.infer<typeof AccountDeleteRequestSchema>;
