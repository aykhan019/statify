'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterRequestSchema, type RegisterRequest } from '@statify/shared';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Field, FormError, Input, SubmitButton } from '@/components/forms';
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
      <Field
        id="signup-display-name"
        label="Display name"
        error={errors.displayName?.message}
        required
      >
        <Input type="text" autoComplete="name" {...register('displayName')} />
      </Field>

      <Field id="signup-email" label="Email" error={errors.email?.message} required>
        <Input type="email" autoComplete="email" {...register('email')} />
      </Field>

      <Field
        id="signup-password"
        label="Password"
        error={errors.password?.message}
        hint="At least 8 characters."
        required
      >
        <Input type="password" autoComplete="new-password" {...register('password')} />
      </Field>

      {formError !== null && <FormError variant="summary">{formError}</FormError>}

      <SubmitButton loading={isSubmitting} loadingLabel="Creating account…" className="mt-2">
        Create account
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
