import { readFile } from 'node:fs/promises';
import type { RawMpdPlaylist, RawMpdSlice } from './types';

export interface ParsedSlice {
  sliceFilename: string;
  playlistCount: number;
  iterate(): AsyncIterableIterator<RawMpdPlaylist>;
}

export async function parseSlice(filePath: string): Promise<ParsedSlice> {
  const contents = await readFile(filePath, 'utf8');
  const parsed = JSON.parse(contents) as RawMpdSlice;

  if (!Array.isArray(parsed.playlists)) {
    throw new Error(`Slice ${filePath} is missing a 'playlists' array`);
  }

  const sliceFilename = extractFilename(filePath);

  return {
    sliceFilename,
    playlistCount: parsed.playlists.length,
    iterate() {
      return iterate(parsed.playlists);
    },
  };
}

export function extractFilename(filePath: string): string {
  const lastSlash = Math.max(filePath.lastIndexOf('/'), filePath.lastIndexOf('\\'));
  return lastSlash === -1 ? filePath : filePath.slice(lastSlash + 1);
}

async function* iterate(playlists: RawMpdPlaylist[]): AsyncIterableIterator<RawMpdPlaylist> {
  for (const playlist of playlists) {
    yield playlist;
  }
}
