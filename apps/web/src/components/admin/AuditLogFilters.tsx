'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

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
      className="grid gap-3 sm:grid-cols-3 sm:items-end"
      aria-label="Audit log filters"
    >
      <div className="flex flex-col gap-1">
        <Label htmlFor="filter-action">Action</Label>
        <Input
          id="filter-action"
          value={action}
          onChange={(event) => setAction(event.target.value)}
          placeholder="admin.user.banned"
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="filter-actor">Actor user id</Label>
        <Input
          id="filter-actor"
          type="number"
          min="1"
          value={actorUserId}
          onChange={(event) => setActorUserId(event.target.value)}
          placeholder="1"
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="filter-target">Target table</Label>
        <Input
          id="filter-target"
          value={targetTable}
          onChange={(event) => setTargetTable(event.target.value)}
          placeholder="users"
        />
      </div>
      <div className="flex gap-2 sm:col-span-3">
        <Button type="submit">Apply filters</Button>
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
