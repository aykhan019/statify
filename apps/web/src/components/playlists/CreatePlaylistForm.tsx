'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CreateUserPlaylistRequestSchema, type CreateUserPlaylistRequest } from '@statify/shared';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { z } from 'zod';
import { Field, FormError, Input, SubmitButton, Switch, Textarea } from '@/components/forms';
import { ApiClientError } from '@/lib/api-client';
import { createMyPlaylist } from '@/lib/user-playlists/api';

type FormValues = z.input<typeof CreateUserPlaylistRequestSchema>;

export function CreatePlaylistForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
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

      const playlist = await createMyPlaylist(payload);
      router.replace(`/me/playlists/${playlist.id}`);
      router.refresh();
    } catch (error) {
      setFormError(toFormError(error));
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <Field id="playlist-name" label="Name" error={errors.name?.message} required>
        <Input type="text" autoComplete="off" {...register('name')} />
      </Field>

      <Field
        id="playlist-description"
        label="Description"
        error={errors.description?.message}
        hint="A short note about what this playlist is for."
        optional
      >
        <Textarea rows={3} {...register('description')} />
      </Field>

      <Controller
        control={control}
        name="isPublic"
        render={({ field }) => (
          <Switch
            checked={field.value === true}
            onCheckedChange={field.onChange}
            label="Make this playlist public"
            description="Public playlists appear in the community list."
          />
        )}
      />

      {formError !== null && <FormError variant="summary">{formError}</FormError>}

      <SubmitButton loading={isSubmitting} loadingLabel="Creating…" className="mt-2 self-start">
        Create playlist
      </SubmitButton>
    </form>
  );
}

function toFormError(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }
  return 'Something went wrong. Try again.';
}
