'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { UpdateUserPlaylistRequestSchema, type UpdateUserPlaylistRequest } from '@statify/shared';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { Field, FormError, Input, SubmitButton, Textarea } from '@/components/forms';
import { Button } from '@/components/ui/Button';
import { ApiClientError } from '@/lib/api-client';
import { updateMyPlaylist } from '@/lib/user-playlists/api';

type FormValues = z.input<typeof UpdateUserPlaylistRequestSchema>;

interface EditPlaylistDetailsFormProps {
  playlistId: number;
  name: string;
  description: string | null;
}

export function EditPlaylistDetailsForm({
  playlistId,
  name,
  description,
}: EditPlaylistDetailsFormProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues, unknown, UpdateUserPlaylistRequest>({
    resolver: zodResolver(UpdateUserPlaylistRequestSchema),
    defaultValues: { name, description: description ?? '' },
  });

  const onSubmit = async (values: UpdateUserPlaylistRequest) => {
    setFormError(null);
    try {
      await updateMyPlaylist(playlistId, {
        name: values.name,
        description: values.description ?? '',
      });
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      setFormError(error instanceof ApiClientError ? error.message : 'Could not save changes.');
    }
  };

  if (!isEditing) {
    return (
      <Button type="button" variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
        Edit details
      </Button>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="border-border bg-surface flex flex-col gap-4 rounded-lg border p-4"
    >
      <Field id="edit-playlist-name" label="Name" error={errors.name?.message} required>
        <Input type="text" autoComplete="off" {...register('name')} />
      </Field>

      <Field
        id="edit-playlist-description"
        label="Description"
        error={errors.description?.message}
        optional
      >
        <Textarea rows={3} {...register('description')} />
      </Field>

      {formError !== null && <FormError variant="summary">{formError}</FormError>}

      <div className="flex items-center gap-2">
        <SubmitButton loading={isSubmitting} loadingLabel="Saving…">
          Save
        </SubmitButton>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            reset({ name, description: description ?? '' });
            setFormError(null);
            setIsEditing(false);
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
