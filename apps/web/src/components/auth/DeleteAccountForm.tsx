'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AccountDeleteRequestSchema, type AccountDeleteRequest } from '@statify/shared';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Field, FormError, Input, SubmitButton } from '@/components/forms';
import { Button } from '@/components/ui/Button';
import { ApiClientError } from '@/lib/api-client';
import { deleteAccount } from '@/lib/auth/api';

export function DeleteAccountForm() {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AccountDeleteRequest>({
    resolver: zodResolver(AccountDeleteRequestSchema),
    defaultValues: { currentPassword: '' },
  });

  const onSubmit = async (values: AccountDeleteRequest) => {
    setFormError(null);

    try {
      await deleteAccount(values);
      router.replace('/?deleted=account');
      router.refresh();
    } catch (error) {
      setFormError(toFormError(error));
    }
  };

  if (!isConfirming) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-fg-muted">
          Deleting your account is permanent. Your listening history and playlists become
          inaccessible.
        </p>
        <Button
          type="button"
          variant="destructive"
          className="self-start"
          onClick={() => setIsConfirming(true)}
        >
          Delete account
        </Button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Field
        id="delete-password"
        label="Confirm with your current password"
        error={errors.currentPassword?.message}
        required
      >
        <Input type="password" autoComplete="current-password" {...register('currentPassword')} />
      </Field>

      {formError !== null && <FormError variant="summary">{formError}</FormError>}

      <div className="flex flex-wrap gap-2">
        <SubmitButton loading={isSubmitting} loadingLabel="Deleting…" variant="destructive">
          Permanently delete
        </SubmitButton>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            reset();
            setFormError(null);
            setIsConfirming(false);
          }}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function toFormError(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (error.status === 401) {
      return 'Password is incorrect.';
    }

    return error.message;
  }

  return 'Something went wrong. Try again.';
}
