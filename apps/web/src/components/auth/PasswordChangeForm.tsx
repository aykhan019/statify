'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { PasswordChangeRequestSchema, type PasswordChangeRequest } from '@statify/shared';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { ApiClientError } from '@/lib/api-client';
import { changePassword } from '@/lib/auth/api';

export function PasswordChangeForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<PasswordChangeRequest>({
    resolver: zodResolver(PasswordChangeRequestSchema),
    defaultValues: { currentPassword: '', newPassword: '' },
  });

  const onSubmit = async (values: PasswordChangeRequest) => {
    setFormError(null);

    try {
      await changePassword(values);
      reset();
      router.replace('/login?changed=password');
      router.refresh();
    } catch (error) {
      setFormError(toFormError(error));
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Field id="current-password" label="Current password" error={errors.currentPassword?.message}>
        <Input
          id="current-password"
          type="password"
          autoComplete="current-password"
          aria-invalid={errors.currentPassword !== undefined}
          {...register('currentPassword')}
        />
      </Field>

      <Field
        id="new-password"
        label="New password"
        error={errors.newPassword?.message}
        hint="At least 8 characters."
      >
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          aria-invalid={errors.newPassword !== undefined}
          {...register('newPassword')}
        />
      </Field>

      {formError !== null && (
        <p role="alert" className="text-destructive text-sm">
          {formError}
        </p>
      )}
      {isSubmitSuccessful && formError === null && (
        <p role="status" className="text-muted-foreground text-sm">
          Password updated. Redirecting to sign in…
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} className="self-start">
        {isSubmitting ? 'Updating…' : 'Update password'}
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
    if (error.status === 401) {
      return 'Current password is incorrect.';
    }

    return error.message;
  }

  return 'Something went wrong. Try again.';
}
