import { describe, expect, it } from 'vitest';
import { z, ZodError } from 'zod';
import { ZodValidationPipe } from './zod-validation.pipe';

describe('ZodValidationPipe', () => {
  const schema = z.object({
    limit: z.coerce.number().int().min(1).max(100),
  });

  it('returns parsed values from the schema', () => {
    const pipe = new ZodValidationPipe(schema);

    expect(pipe.transform({ limit: '20' })).toEqual({ limit: 20 });
  });

  it('throws ZodError for the global exception filter to serialize', () => {
    const pipe = new ZodValidationPipe(schema);

    expect(() => pipe.transform({ limit: '200' })).toThrow(ZodError);
  });
});
