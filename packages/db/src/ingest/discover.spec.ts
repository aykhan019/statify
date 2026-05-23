import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { discoverSlices } from './discover';

let workDir: string;

beforeAll(async () => {
  workDir = await mkdtemp(join(tmpdir(), 'statify-discover-'));
  await writeFile(join(workDir, 'mpd.slice.1000-1999.json'), '{}', 'utf8');
  await writeFile(join(workDir, 'mpd.slice.0-999.json'), '{}', 'utf8');
  await writeFile(join(workDir, 'mpd.slice.200-299.json'), '{}', 'utf8');
  await writeFile(join(workDir, 'README.md'), 'unrelated', 'utf8');
  await writeFile(join(workDir, 'mpd.summary.json'), 'unrelated', 'utf8');
});

afterAll(async () => {
  await rm(workDir, { recursive: true, force: true });
});

describe('discoverSlices', () => {
  it('returns matching slice files ordered by range start', async () => {
    const slices = await discoverSlices(workDir);
    expect(slices.map((slice) => slice.filename)).toEqual([
      'mpd.slice.0-999.json',
      'mpd.slice.200-299.json',
      'mpd.slice.1000-1999.json',
    ]);
  });

  it('skips files that do not match the slice pattern', async () => {
    const slices = await discoverSlices(workDir);
    const names = slices.map((slice) => slice.filename);
    expect(names).not.toContain('README.md');
    expect(names).not.toContain('mpd.summary.json');
  });
});
