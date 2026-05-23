import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoginForm } from '@/components/auth';

export const metadata = {
  title: 'Sign in | Statify',
};

interface LoginPageProps {
  searchParams: Promise<{
    next?: string | string[];
    changed?: string | string[];
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirectTo = normalizeNext(params.next);
  const changed = readSingle(params.changed);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to continue.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {changed === 'password' && (
          <p
            role="status"
            className="bg-muted text-muted-foreground rounded-(--radius-sm) px-3 py-2 text-sm"
          >
            Password updated. Sign in with your new password.
          </p>
        )}
        <LoginForm redirectTo={redirectTo} />
        <p className="text-muted-foreground text-center text-sm">
          New to Statify?{' '}
          <Link href="/signup" className="text-accent font-medium hover:underline">
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

function readSingle(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function normalizeNext(value: string | string[] | undefined): string {
  const raw = readSingle(value);

  if (raw === undefined || !raw.startsWith('/') || raw.startsWith('//')) {
    return '/me';
  }

  return raw;
}
