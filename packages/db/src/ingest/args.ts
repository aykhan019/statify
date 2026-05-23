export interface IngestCliArgs {
  dataDir: string;
  slices: number | null;
  resume: boolean;
  batchSize: number;
}

const DEFAULT_DATA_DIR = './data/mpd';
const DEFAULT_BATCH_SIZE = 500;

export function parseIngestArgs(argv: string[]): IngestCliArgs {
  const args: IngestCliArgs = {
    dataDir: DEFAULT_DATA_DIR,
    slices: null,
    resume: false,
    batchSize: DEFAULT_BATCH_SIZE,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    switch (token) {
      case '--resume': {
        args.resume = true;
        break;
      }
      case '--data-dir': {
        args.dataDir = requireValue(argv, i, token);
        i += 1;
        break;
      }
      case '--slices': {
        args.slices = parsePositiveInt(requireValue(argv, i, token), token);
        i += 1;
        break;
      }
      case '--batch-size': {
        args.batchSize = parsePositiveInt(requireValue(argv, i, token), token);
        i += 1;
        break;
      }
      default: {
        throw new Error(`Unknown argument: ${token ?? '<undefined>'}`);
      }
    }
  }

  return args;
}

function requireValue(argv: string[], index: number, flag: string): string {
  const value = argv[index + 1];
  if (value === undefined || value.startsWith('--')) {
    throw new Error(`Missing value for ${flag}`);
  }
  return value;
}

function parsePositiveInt(raw: string, flag: string): number {
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${flag} expects a positive integer, got ${raw}`);
  }
  return value;
}
