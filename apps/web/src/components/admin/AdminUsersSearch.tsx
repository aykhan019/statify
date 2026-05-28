'use client';

import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Field, Input, SubmitButton } from '@/components/forms';
import { Icon } from '@/components/ui/Icon';
import { ClearInputButton } from './ClearInputButton';

export function AdminUsersSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get('q') ?? '');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    const trimmed = value.trim();
    if (trimmed.length > 0) params.set('q', trimmed);
    const query = params.toString();
    router.push(query.length === 0 ? '/admin/users' : `/admin/users?${query}`);
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-2" role="search" noValidate>
      <Field
        id="admin-users-search"
        label="Search users"
        hideLabel
        className="flex-1 min-w-[16rem]"
      >
        <Input
          type="search"
          name="q"
          placeholder="Search by ID, email, or display name"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          startSlot={<Icon as={Search} size="sm" />}
          endSlot={value.length > 0 ? <ClearInputButton onClick={() => setValue('')} /> : undefined}
          className="[&::-webkit-search-cancel-button]:hidden"
        />
      </Field>
      <SubmitButton>Search</SubmitButton>
    </form>
  );
}
