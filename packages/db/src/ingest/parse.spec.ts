import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { extractFilename, parseSlice } from './parse';

let workDir: string;
let slicePath: string;

beforeAll(async () => {
  workDir = await mkdtemp(join(tmpdir(), 'statify-ingest-'));
  slicePath = join(workDir, 'mpd.slice.0-999.json');
  const payload = {
    info: { slice: '0-1' },
    playlists: [
      { pid: 0, name: 'A', tracks: [] },
      { pid: 1, name: 'B', tracks: [] },
    ],
  };
  await writeFile(slicePath, JSON.stringify(payload), 'utf8');
});

afterAll(async () => {
  await rm(workDir, { recursive: true, force: true });
});

describe('parseSlice', () => {
  it('reports the slice filename and playlist count', async () => {
    const parsed = await parseSlice(slicePath);
    expect(parsed.sliceFilename).toBe('mpd.slice.0-999.json');
    expect(parsed.playlistCount).toBe(2);
  });

  it('iterates playlists one at a time', async () => {
    const parsed = await parseSlice(slicePath);
    const pids: number[] = [];
    for await (const playlist of parsed.iterate()) {
      pids.push(playlist.pid);
    }
    expect(pids).toEqual([0, 1]);
  });

  it('throws when the playlists array is missing', async () => {
    const badPath = join(workDir, 'mpd.slice.bad.json');
    await writeFile(badPath, JSON.stringify({ info: {} }), 'utf8');
    await expect(parseSlice(badPath)).rejects.toThrow(/missing a 'playlists' array/);
  });
});

describe('extractFilename', () => {
  it('returns the trailing path segment', () => {
    expect(extractFilename('/data/mpd/mpd.slice.0-999.json')).toBe('mpd.slice.0-999.json');
    expect(extractFilename('mpd.slice.0-999.json')).toBe('mpd.slice.0-999.json');
  });
});
