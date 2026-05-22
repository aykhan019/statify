import { describe, expect, it } from 'vitest';
import { PasswordService } from './password.service';

describe('PasswordService', () => {
  it('hashes and verifies passwords with the configured algorithm', async () => {
    const service = new PasswordService();
    const hash = await service.hash('correct horse battery staple');

    expect(hash).toContain('argon2id');
    await expect(service.verify(hash, 'correct horse battery staple')).resolves.toBe(true);
    await expect(service.verify(hash, 'wrong password')).resolves.toBe(false);
  });
});
