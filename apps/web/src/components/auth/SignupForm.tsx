'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterRequestSchema, type RegisterRequest } from '@statify/shared';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { ApiClientError } from '@/lib/api-client';
import { registerUser } from '@/lib/auth/api';

interface SignupFormProps {
  redirectTo?: string;
}

export function SignupForm({ redirectTo = '/me' }: SignupFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterRequest>({
    resolver: zodResolver(RegisterRequestSchema),
    defaultValues: { email: '', password: '', displayName: '' },
  });

  const onSubmit = async (values: RegisterRequest) => {
    setFormError(null);

    try {
      await registerUser(values);
      router.replace(redirectTo);
      router.refresh();
    } catch (error) {
      setFormError(toFormError(error));
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FormField id="signup-display-name" label="Display name" error={errors.displayName?.message}>
        <Input
          id="signup-display-name"
          type="text"
          autoComplete="name"
          aria-invalid={errors.displayName !== undefined}
          {...register('displayName')}
        />
      </FormField>

      <FormField id="signup-email" label="Email" error={errors.email?.message}>
        <Input
          id="signup-email"
          type="email"
          autoComplete="email"
          aria-invalid={errors.email !== undefined}
          {...register('email')}
        />
      </FormField>

      <FormField
        id="signup-password"
        label="Password"
        error={errors.password?.message}
        hint="At least 8 characters."
      >
        <Input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          aria-invalid={errors.password !== undefined}
          {...register('password')}
        />
      </FormField>

      {formError !== null && (
        <p role="alert" className="text-destructive text-sm">
          {formError}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} className="mt-2">
        {isSubmitting ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
  );
}

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

function FormField({ id, label, error, hint, children }: FormFieldProps) {
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
