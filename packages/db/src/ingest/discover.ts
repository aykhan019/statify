import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

const SLICE_FILE_PATTERN = /^mpd\.slice\.(\d+)-(\d+)\.json$/;

export interface DiscoveredSlice {
  filename: string;
  path: string;
  rangeStart: number;
}

export async function discoverSlices(dataDir: string): Promise<DiscoveredSlice[]> {
  const entries = await readdir(dataDir);
  const slices: DiscoveredSlice[] = [];

  for (const entry of entries) {
    const match = SLICE_FILE_PATTERN.exec(entry);
    if (match === null) {
      continue;
    }
    slices.push({
      filename: entry,
      path: join(dataDir, entry),
      rangeStart: Number.parseInt(match[1] ?? '0', 10),
    });
  }

  slices.sort((a, b) => a.rangeStart - b.rangeStart);
  return slices;
}
