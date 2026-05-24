'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Field, Input, SubmitButton } from '@/components/forms';
import { Button } from '@/components/ui/Button';

export function AuditLogFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [action, setAction] = useState(searchParams.get('action') ?? '');
  const [actorUserId, setActorUserId] = useState(searchParams.get('actorUserId') ?? '');
  const [targetTable, setTargetTable] = useState(searchParams.get('targetTable') ?? '');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    appendIfFilled(params, 'action', action);
    appendIfFilled(params, 'actorUserId', actorUserId);
    appendIfFilled(params, 'targetTable', targetTable);
    const query = params.toString();
    router.push(query.length === 0 ? '/admin/audit-log' : `/admin/audit-log?${query}`);
  }

  function clear() {
    setAction('');
    setActorUserId('');
    setTargetTable('');
    router.push('/admin/audit-log');
  }

  const hasFilters =
    searchParams.has('action') ||
    searchParams.has('actorUserId') ||
    searchParams.has('targetTable');

  return (
    <form
      onSubmit={submit}
      noValidate
      className="grid gap-3 sm:grid-cols-3 sm:items-end"
      aria-label="Audit log filters"
    >
      <Field id="filter-action" label="Action" optional>
        <Input
          value={action}
          onChange={(event) => setAction(event.target.value)}
          placeholder="admin.user.banned"
        />
      </Field>
      <Field id="filter-actor" label="Actor user id" optional>
        <Input
          type="number"
          min="1"
          value={actorUserId}
          onChange={(event) => setActorUserId(event.target.value)}
          placeholder="1"
        />
      </Field>
      <Field id="filter-target" label="Target table" optional>
        <Input
          value={targetTable}
          onChange={(event) => setTargetTable(event.target.value)}
          placeholder="users"
        />
      </Field>
      <div className="flex flex-wrap gap-2 sm:col-span-3">
        <SubmitButton>Apply filters</SubmitButton>
        {hasFilters && (
          <Button type="button" variant="ghost" onClick={clear}>
            Clear
          </Button>
        )}
      </div>
    </form>
  );
}

function appendIfFilled(params: URLSearchParams, key: string, value: string): void {
  const trimmed = value.trim();
  if (trimmed.length > 0) {
    params.set(key, trimmed);
  }
}
