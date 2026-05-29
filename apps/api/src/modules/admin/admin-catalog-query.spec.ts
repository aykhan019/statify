import { AdminTracksListQuerySchema } from '@statify/shared';
import { describe, expect, it } from 'vitest';

// Regression: `includeHidden` was declared with `z.coerce.boolean()`, which runs
// `Boolean(value)` — so the query string 'false' coerced to `true` and the
// admin catalog "Hidden off" toggle never filtered hidden rows.
describe('AdminTracksListQuerySchema.includeHidden', () => {
  it('parses the string "false" to false', () => {
    expect(AdminTracksListQuerySchema.parse({ includeHidden: 'false' }).includeHidden).toBe(false);
  });

  it('parses the string "true" to true', () => {
    expect(AdminTracksListQuerySchema.parse({ includeHidden: 'true' }).includeHidden).toBe(true);
  });

  it('defaults to true when omitted', () => {
    expect(AdminTracksListQuerySchema.parse({}).includeHidden).toBe(true);
  });
});
