import { argon2id, hash } from 'argon2';

// Mirrors apps/api/src/modules/auth/password.service.ts (ADR-001 Section 3.13).
const HASH_OPTIONS = {
  type: argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
} as const;

export function hashPassword(plain: string): Promise<string> {
  return hash(plain, HASH_OPTIONS);
}
