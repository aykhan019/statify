import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { DeleteAccountForm, PasswordChangeForm } from '@/components/auth';

export const metadata = {
  title: 'Account settings | Statify',
};

export default function AccountSettingsPage() {
  return (
    <Container size="md" className="flex flex-col gap-8 py-2">
      <PageHeader
        title="Account settings"
        description="Manage your password and remove your account."
      />

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>
            You will be signed out and asked to sign in with your new password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordChangeForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delete account</CardTitle>
          <CardDescription>
            This action is permanent and audit logged. Your listening history is preserved for
            aggregate statistics but is no longer linked to your profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteAccountForm />
        </CardContent>
      </Card>
    </Container>
  );
}
