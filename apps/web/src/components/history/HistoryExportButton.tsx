'use client';

import { Download } from 'lucide-react';
import { useState } from 'react';
import type { ListeningHistoryListItem, ListeningHistoryListResponse } from '@statify/shared';
import { Icon } from '@/components/ui/Icon';
import { apiFetch } from '@/lib/api-client';
import { cn } from '@/lib/utils/cn';

const PAGE_SIZE = 100;

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

function buildCsv(items: ReadonlyArray<ListeningHistoryListItem>): string {
  const header = toCsvRow([
    'played_at',
    'track_id',
    'track_name',
    'artists',
    'album_id',
    'album_name',
    'source',
    'duration_played_ms',
  ]);
  const rows = items.map((item) =>
    toCsvRow([
      item.playedAt,
      item.track.id,
      item.track.name,
      item.track.artists.map((a) => a.name).join('; '),
      item.track.album.id,
      item.track.album.name,
      item.source,
      item.durationPlayedMs,
    ]),
  );
  return [header, ...rows].join('\n');
}

export function HistoryExportButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const all: ListeningHistoryListItem[] = [];
      let page = 1;
      // Cap at 100 pages (10k rows) just in case totalPages is wrong.
      for (let i = 0; i < 100; i++) {
        const res = await apiFetch<ListeningHistoryListResponse>(
          `/api/v1/me/history?page=${page}&limit=${PAGE_SIZE}`,
          { credentials: 'include' },
        );
        all.push(...res.data);
        if (page >= res.totalPages || res.data.length === 0) break;
        page += 1;
      }

      const csv = buildCsv(all);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const stamp = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `statify-history-${stamp}.csv`;
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
      disabled={isExporting}
      aria-busy={isExporting}
      className={cn(
        'inline-flex h-10 items-center gap-2 rounded-(--radius-sm) px-4 text-sm font-semibold motion-interactive',
        'border border-white/22 bg-white/8 text-white hover:bg-white/16',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus-paper',
        'disabled:cursor-not-allowed disabled:opacity-60',
      )}
    >
      <Icon as={Download} size="sm" />
      {isExporting ? 'Exporting…' : 'Export CSV'}
    </button>
  );
}
