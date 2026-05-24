'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoginRequestSchema, type LoginRequest } from '@statify/shared';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Field, FormError, Input, SubmitButton } from '@/components/forms';
import { ApiClientError } from '@/lib/api-client';
import { loginUser } from '@/lib/auth/api';

interface LoginFormProps {
  redirectTo?: string;
}

export function LoginForm({ redirectTo = '/me' }: LoginFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({
    resolver: zodResolver(LoginRequestSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginRequest) => {
    setFormError(null);

    try {
      await loginUser(values);
      router.replace(redirectTo);
      router.refresh();
    } catch (error) {
      setFormError(toFormError(error));
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Field id="login-email" label="Email" error={errors.email?.message} required>
        <Input type="email" autoComplete="email" {...register('email')} />
      </Field>

      <Field id="login-password" label="Password" error={errors.password?.message} required>
        <Input type="password" autoComplete="current-password" {...register('password')} />
      </Field>

      {formError !== null && <FormError variant="summary">{formError}</FormError>}

      <SubmitButton loading={isSubmitting} loadingLabel="Signing in…" className="mt-2">
        Sign in
      </SubmitButton>
    </form>
  );
}

function toFormError(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (error.status === 401) {
      return 'Invalid email or password.';
    }

    return error.message;
  }

  return 'Something went wrong. Try again.';
}
