'use client';

import { Eye, EyeOff, Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Field, Input, SubmitButton } from '@/components/forms';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ClearInputButton } from './ClearInputButton';

interface AdminCatalogSearchProps {
  basePath: string;
  placeholder: string;
  fieldId: string;
  fieldLabel: string;
}

export function AdminCatalogSearch({
  basePath,
  placeholder,
  fieldId,
  fieldLabel,
}: AdminCatalogSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get('q') ?? '');
  const [includeHidden, setIncludeHidden] = useState(searchParams.get('includeHidden') !== 'false');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    const trimmed = value.trim();
    if (trimmed.length > 0) params.set('q', trimmed);
    if (!includeHidden) params.set('includeHidden', 'false');
    const query = params.toString();
    router.push(query.length === 0 ? basePath : `${basePath}?${query}`);
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-2" role="search" noValidate>
      <Field id={fieldId} label={fieldLabel} hideLabel className="flex-1 min-w-[16rem]">
        <Input
          type="search"
          name="q"
          maxLength={2048}
          placeholder={placeholder}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          startSlot={<Icon as={Search} size="sm" />}
          endSlot={value.length > 0 ? <ClearInputButton onClick={() => setValue('')} /> : undefined}
          className="[&::-webkit-search-cancel-button]:hidden"
        />
      </Field>
      <Button
        type="button"
        variant={includeHidden ? 'primary' : 'secondary'}
        onClick={() => setIncludeHidden((prev) => !prev)}
        aria-pressed={includeHidden}
      >
        <Icon as={includeHidden ? Eye : EyeOff} size="sm" />
        {includeHidden ? 'Showing hidden' : 'Hidden off'}
      </Button>
      <SubmitButton>Search</SubmitButton>
    </form>
  );
}
