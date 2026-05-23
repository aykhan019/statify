'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function AdminUsersSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get('q') ?? '');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      params.set('q', trimmed);
    }
    const query = params.toString();
    router.push(query.length === 0 ? '/admin/users' : `/admin/users?${query}`);
  }

  function clear() {
    setValue('');
    router.push('/admin/users');
  }

  return (
    <form onSubmit={submit} className="flex gap-2" role="search">
      <Input
        type="search"
        name="q"
        placeholder="Search by email or display name"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        aria-label="Search users"
      />
      <Button type="submit">Search</Button>
      {searchParams.has('q') && (
        <Button type="button" variant="ghost" onClick={clear}>
          Clear
        </Button>
      )}
    </form>
  );
}
