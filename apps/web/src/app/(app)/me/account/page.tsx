import { SectionContent } from '@/components/section';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { DeleteAccountForm, PasswordChangeForm, ProfileForm } from '@/components/auth';
import { getServerSession } from '@/lib/auth/session';

export const metadata = {
  title: 'Account settings | Statify',
};

export default async function AccountSettingsPage() {
  const user = await getServerSession();

  return (
    <SectionContent size="prose" className="flex flex-col gap-8">
      <PageHeader
        title="Account settings"
        description="Manage your profile, password, and remove your account."
      />

      {user !== null && (
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your display name and email address.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm initialDisplayName={user.displayName} initialEmail={user.email} />
          </CardContent>
        </Card>
      )}

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
    </SectionContent>
  );
}
