'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ProfileUpdateRequestSchema, type ProfileUpdateRequest } from '@statify/shared';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Field, FormError, Input, SubmitButton } from '@/components/forms';
import { ApiClientError } from '@/lib/api-client';
import { updateProfile } from '@/lib/auth/api';

interface ProfileFormProps {
  initialDisplayName: string;
  initialEmail: string;
}

export function ProfileForm({ initialDisplayName, initialEmail }: ProfileFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<ProfileUpdateRequest>({
    resolver: zodResolver(ProfileUpdateRequestSchema),
    defaultValues: { displayName: initialDisplayName, email: initialEmail, currentPassword: '' },
  });

  const onSubmit = async (values: ProfileUpdateRequest) => {
    setFormError(null);
    setSavedMessage(null);

    try {
      await updateProfile(values);
      resetField('currentPassword');
      setSavedMessage('Profile updated.');
      router.refresh();
    } catch (error) {
      setFormError(toFormError(error));
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Field id="display-name" label="Display name" error={errors.displayName?.message} required>
        <Input type="text" autoComplete="name" {...register('displayName')} />
      </Field>

      <Field id="email" label="Email" error={errors.email?.message} required>
        <Input type="email" autoComplete="email" {...register('email')} />
      </Field>

      <Field
        id="profile-current-password"
        label="Current password"
        hint="Required to save changes to your profile."
        error={errors.currentPassword?.message}
        required
      >
        <Input type="password" autoComplete="current-password" {...register('currentPassword')} />
      </Field>

      {formError !== null && <FormError variant="summary">{formError}</FormError>}
      {savedMessage !== null && formError === null && (
        <p role="status" className="text-sm text-fg-muted">
          {savedMessage}
        </p>
      )}

      <SubmitButton loading={isSubmitting} loadingLabel="Saving…" className="self-start">
        Save changes
      </SubmitButton>
    </form>
  );
}

function toFormError(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (error.status === 401) {
      return 'Current password is incorrect.';
    }
    if (error.status === 409) {
      return 'That email is already in use by another account.';
    }

    return error.message;
  }

  return 'Something went wrong. Try again.';
}
