import { describe, expect, it } from 'vitest';
import { parseIngestArgs } from './args';

describe('parseIngestArgs', () => {
  it('applies defaults when no arguments are provided', () => {
    expect(parseIngestArgs([])).toEqual({
      dataDir: './data/mpd',
      slices: null,
      resume: false,
      batchSize: 500,
    });
  });

  it('parses --data-dir, --slices, --resume, and --batch-size', () => {
    const args = parseIngestArgs([
      '--data-dir',
      '/tmp/mpd',
      '--slices',
      '10',
      '--resume',
      '--batch-size',
      '250',
    ]);

    expect(args).toEqual({
      dataDir: '/tmp/mpd',
      slices: 10,
      resume: true,
      batchSize: 250,
    });
  });

  it('rejects non-positive slice counts', () => {
    expect(() => parseIngestArgs(['--slices', '0'])).toThrow(/positive integer/);
    expect(() => parseIngestArgs(['--slices', '-5'])).toThrow(/positive integer/);
  });

  it('rejects unknown flags', () => {
    expect(() => parseIngestArgs(['--unknown'])).toThrow(/Unknown argument/);
  });

  it('rejects missing values for flags that take an argument', () => {
    expect(() => parseIngestArgs(['--slices'])).toThrow(/Missing value/);
    expect(() => parseIngestArgs(['--data-dir', '--resume'])).toThrow(/Missing value/);
  });
});
