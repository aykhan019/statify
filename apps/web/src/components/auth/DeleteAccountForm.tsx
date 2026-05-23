'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AccountDeleteRequestSchema, type AccountDeleteRequest } from '@statify/shared';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
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
        <p className="text-muted-foreground text-sm">
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
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="delete-password">Confirm with your current password</Label>
        <Input
          id="delete-password"
          type="password"
          autoComplete="current-password"
          aria-invalid={errors.currentPassword !== undefined}
          {...register('currentPassword')}
        />
        {errors.currentPassword?.message !== undefined && (
          <p className="text-destructive text-xs" role="alert">
            {errors.currentPassword.message}
          </p>
        )}
      </div>

      {formError !== null && (
        <p role="alert" className="text-destructive text-sm">
          {formError}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="destructive" disabled={isSubmitting}>
          {isSubmitting ? 'Deleting…' : 'Permanently delete'}
        </Button>
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
