'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Checkbox, Field, FormError, Input, SubmitButton } from '@/components/forms';
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
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field id="ingest-data-dir" label="Data directory" optional>
          <Input
            value={dataDir}
            onChange={(event) => setDataDir(event.target.value)}
            placeholder="./data/mpd"
            autoComplete="off"
          />
        </Field>
        <Field id="ingest-slices" label="Slice limit" optional>
          <Input
            type="number"
            min="1"
            max="50"
            value={slices}
            onChange={(event) => setSlices(event.target.value)}
            placeholder="all slices in the directory"
          />
        </Field>
      </div>

      <Checkbox
        id="ingest-resume"
        checked={resume}
        onChange={(event) => setResume(event.target.checked)}
        label="Skip slices that already completed"
        description="Resume mode reads the ingest_checkpoints table and only processes new slices."
      />

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton loading={busy} loadingLabel="Starting…" disabled={running}>
          {running ? 'Run in progress' : 'Trigger ingest run'}
        </SubmitButton>
        {message !== null &&
          (message.kind === 'error' ? (
            <FormError className="text-sm">{message.text}</FormError>
          ) : (
            <span role="status" className="text-sm text-fg-muted">
              {message.text}
            </span>
          ))}
      </div>
    </form>
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
}
