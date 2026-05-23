'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { ApiClientError } from '@/lib/api-client';
import { triggerIngestRun } from '@/lib/admin/api';

interface IngestTriggerFormProps {
  running: boolean;
}

export function IngestTriggerForm({ running }: IngestTriggerFormProps) {
  const router = useRouter();
  const [slices, setSlices] = useState('');
  const [dataDir, setDataDir] = useState('');
  const [resume, setResume] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: 'info' | 'error'; text: string } | null>(null);
  const [, startTransition] = useTransition();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (running || busy) return;

    setBusy(true);
    setMessage(null);

    const payload: Parameters<typeof triggerIngestRun>[0] = { resume };
    const trimmedDataDir = dataDir.trim();
    if (trimmedDataDir.length > 0) {
      payload.dataDir = trimmedDataDir;
    }
    if (slices.trim().length > 0) {
      const parsed = Number(slices);
      if (Number.isFinite(parsed) && parsed > 0) {
        payload.slices = parsed;
      }
    }

    try {
      const result = await triggerIngestRun(payload);
      setMessage({ kind: result.accepted ? 'info' : 'error', text: result.message });
      startTransition(() => router.refresh());
    } catch (error) {
      setMessage({ kind: 'error', text: getErrorMessage(error) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Label htmlFor="ingest-data-dir">Data directory (optional)</Label>
          <Input
            id="ingest-data-dir"
            value={dataDir}
            onChange={(event) => setDataDir(event.target.value)}
            placeholder="./data/mpd"
            autoComplete="off"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="ingest-slices">Slice limit (optional)</Label>
          <Input
            id="ingest-slices"
            type="number"
            min="1"
            max="50"
            value={slices}
            onChange={(event) => setSlices(event.target.value)}
            placeholder="all slices in the directory"
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={resume}
          onChange={(event) => setResume(event.target.checked)}
        />
        Skip slices that already completed (resume mode)
      </label>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={running || busy}>
          {running ? 'Run in progress' : busy ? 'Starting...' : 'Trigger ingest run'}
        </Button>
        {message !== null && (
          <span
            role={message.kind === 'error' ? 'alert' : 'status'}
            className={message.kind === 'error' ? 'text-destructive text-sm' : 'text-sm'}
          >
            {message.text}
          </span>
        )}
      </div>
    </form>
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
}
