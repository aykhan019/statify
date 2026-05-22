const DURATION_PATTERN = /^(\d+)([smhd])$/;
const UNIT_MS = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
} as const;

export function durationToMs(value: string): number {
  const match = DURATION_PATTERN.exec(value);
  if (match === null) {
    throw new Error(`Unsupported duration: ${value}`);
  }

  const amount = Number(match[1]);
  const unit = match[2] as keyof typeof UNIT_MS;

  return amount * UNIT_MS[unit];
}
