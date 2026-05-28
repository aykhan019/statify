'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Field, Input, SubmitButton } from '@/components/forms';
import { Button } from '@/components/ui/Button';
import { ClearInputButton } from './ClearInputButton';

// eslint-disable-next-line complexity
export function AuditLogFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [action, setAction] = useState(searchParams.get('action') ?? '');
  const [actorUserId, setActorUserId] = useState(searchParams.get('actorUserId') ?? '');
  const [targetTable, setTargetTable] = useState(searchParams.get('targetTable') ?? '');
  const [targetId, setTargetId] = useState(searchParams.get('targetId') ?? '');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    appendIfFilled(params, 'action', action);
    appendIfFilled(params, 'actorUserId', actorUserId);
    appendIfFilled(params, 'targetTable', targetTable);
    appendIfFilled(params, 'targetId', targetId);
    const query = params.toString();
    router.push(query.length === 0 ? '/admin/audit-log' : `/admin/audit-log?${query}`);
  }

  function clear() {
    setAction('');
    setActorUserId('');
    setTargetTable('');
    setTargetId('');
    router.push('/admin/audit-log');
  }

  const hasFilters =
    searchParams.has('action') ||
    searchParams.has('actorUserId') ||
    searchParams.has('targetTable') ||
    searchParams.has('targetId');

  return (
    <form
      onSubmit={submit}
      noValidate
      className="flex flex-wrap items-end gap-3"
      aria-label="Audit log filters"
    >
      <Field id="filter-action" label="Action" optional className="min-w-[12rem] flex-1">
        <Input
          value={action}
          onChange={(event) => setAction(event.target.value)}
          placeholder="admin.user.banned"
          endSlot={
            action.length > 0 ? (
              <ClearInputButton onClick={() => setAction('')} label="Clear action" />
            ) : undefined
          }
        />
      </Field>
      <Field id="filter-actor" label="Actor user id" optional className="min-w-[8rem] flex-1">
        <Input
          type="number"
          min="1"
          value={actorUserId}
          onChange={(event) => setActorUserId(event.target.value)}
          placeholder="1"
          endSlot={
            actorUserId.length > 0 ? (
              <ClearInputButton onClick={() => setActorUserId('')} label="Clear actor user id" />
            ) : undefined
          }
        />
      </Field>
      <Field id="filter-target" label="Target table" optional className="min-w-[8rem] flex-1">
        <Input
          value={targetTable}
          onChange={(event) => setTargetTable(event.target.value)}
          placeholder="users"
          endSlot={
            targetTable.length > 0 ? (
              <ClearInputButton onClick={() => setTargetTable('')} label="Clear target table" />
            ) : undefined
          }
        />
      </Field>
      <Field id="filter-target-id" label="Target ID" optional className="min-w-[8rem] flex-1">
        <Input
          value={targetId}
          onChange={(event) => setTargetId(event.target.value)}
          placeholder="42"
          endSlot={
            targetId.length > 0 ? (
              <ClearInputButton onClick={() => setTargetId('')} label="Clear target ID" />
            ) : undefined
          }
        />
      </Field>
      <div className="flex gap-2">
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
