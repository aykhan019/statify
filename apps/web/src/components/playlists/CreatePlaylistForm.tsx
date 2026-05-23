'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CreateUserPlaylistRequestSchema, type CreateUserPlaylistRequest } from '@statify/shared';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { ApiClientError } from '@/lib/api-client';
import { createMyPlaylist } from '@/lib/user-playlists/api';

type FormValues = z.input<typeof CreateUserPlaylistRequestSchema>;

export function CreatePlaylistForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues, unknown, CreateUserPlaylistRequest>({
    resolver: zodResolver(CreateUserPlaylistRequestSchema),
    defaultValues: { name: '', description: '', isPublic: false },
  });

  const onSubmit = async (values: CreateUserPlaylistRequest) => {
    setFormError(null);

    try {
      const payload: CreateUserPlaylistRequest = {
        name: values.name,
        isPublic: values.isPublic,
      };
      if (values.description !== undefined && values.description.length > 0) {
        payload.description = values.description;
      }

      await createMyPlaylist(payload);
      router.replace('/me/playlists');
      router.refresh();
    } catch (error) {
      setFormError(toFormError(error));
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Field id="playlist-name" label="Name" error={errors.name?.message}>
        <Input
          id="playlist-name"
          type="text"
          autoComplete="off"
          aria-invalid={errors.name !== undefined}
          {...register('name')}
        />
      </Field>

      <Field
        id="playlist-description"
        label="Description"
        error={errors.description?.message}
        hint="Optional. A short note about what this playlist is for."
      >
        <Input
          id="playlist-description"
          type="text"
          autoComplete="off"
          aria-invalid={errors.description !== undefined}
          {...register('description')}
        />
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register('isPublic')} />
        <span>Make this playlist public</span>
      </label>

      {formError !== null && (
        <p role="alert" className="text-destructive text-sm">
          {formError}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} className="mt-2">
        {isSubmitting ? 'Creating…' : 'Create playlist'}
      </Button>
    </form>
  );
}

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

function Field({ id, label, error, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint !== undefined && error === undefined && (
        <p className="text-muted-foreground text-xs">{hint}</p>
      )}
      {error !== undefined && (
        <p className="text-destructive text-xs" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function toFormError(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }
  return 'Something went wrong. Try again.';
}
