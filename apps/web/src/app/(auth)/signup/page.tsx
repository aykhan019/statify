import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { SignupForm } from '@/components/auth';

export const metadata = {
  title: 'Sign up | Statify',
};

export default function SignupPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle headingLevel={1}>Create your account</CardTitle>
        <CardDescription>Track your listening history and explore the catalog.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <SignupForm />
        <p className="text-muted-foreground text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-accent font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
