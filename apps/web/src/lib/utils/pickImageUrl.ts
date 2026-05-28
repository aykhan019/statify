export function pickImageUrl(
  ...candidates: ReadonlyArray<string | null | undefined>
): string | null {
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.length > 0) return candidate;
  }
  return null;
}
