'use client';

import { Download } from 'lucide-react';
import { useState } from 'react';
import type { TopArtistEntry } from '@statify/shared';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils/cn';

function escapeCsvCell(value: string | number): string {
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsvRow(values: ReadonlyArray<string | number>): string {
  return values.map(escapeCsvCell).join(',');
}

function buildCsv(entries: ReadonlyArray<TopArtistEntry>): string {
  const header = toCsvRow(['rank', 'artist_id', 'artist_name', 'listen_count', 'total_minutes']);
  const rows = entries.map((entry) =>
    toCsvRow([entry.rank, entry.artistId, entry.artistName, entry.listenCount, entry.totalMinutes]),
  );
  return [header, ...rows].join('\n');
}

export function TopArtistsExportButton({ entries }: { entries: ReadonlyArray<TopArtistEntry> }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    if (isExporting || entries.length === 0) return;
    setIsExporting(true);
    try {
      const csv = buildCsv(entries);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const stamp = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `statify-top-artists-${stamp}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isExporting || entries.length === 0}
      aria-busy={isExporting}
      className={cn(
        'inline-flex h-10 items-center gap-2 rounded-(--radius-sm) px-4 text-sm font-semibold motion-interactive',
        'border border-border-strong bg-transparent text-fg-default hover:bg-section-row-hover',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus-paper',
        'disabled:cursor-not-allowed disabled:opacity-60',
      )}
    >
      <Icon as={Download} size="sm" />
      {isExporting ? 'Exporting…' : 'Export CSV'}
    </button>
  );
}
