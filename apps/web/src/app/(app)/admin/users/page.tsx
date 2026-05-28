import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AdminUsersSearch, AdminUsersTable } from '@/components/admin';
import { Card, CardContent } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { fetchAdminUsers } from '@/lib/admin/api';
import { isAdmin } from '@/lib/auth/admin';
import { getServerSession } from '@/lib/auth/session';

export const metadata = {
  title: 'Users | Statify admin',
};

export const dynamic = 'force-dynamic';

interface SearchParams {
  page?: string;
  q?: string;
}

const DEFAULT_LIMIT = 25;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await getServerSession();
  if (user === null || !isAdmin(user)) {
    redirect('/me');
  }

  const params = await searchParams;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const page = Math.max(1, Number(params.page) || 1);

  const response = await fetchAdminUsers(
    { page, limit: DEFAULT_LIMIT, q: params.q },
    { cookieHeader, cache: 'no-store' },
  );

  const queryString = params.q ? `&q=${encodeURIComponent(params.q)}` : '';

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        headingLevel={2}
        title="Users"
        description={`${response.total.toLocaleString()} accounts total.`}
      />
      <AdminUsersSearch />
      <Card>
        <CardContent className="p-3 sm:p-4">
          <AdminUsersTable
            key={`${params.q ?? ''}-${response.page}`}
            currentUserId={user.id}
            initialUsers={response.data}
          />
        </CardContent>
      </Card>
      <nav aria-label="User pagination" className="flex items-center justify-between gap-4 text-sm">
        <span className="text-muted-foreground">
          Page {response.page} of {Math.max(response.totalPages, 1)}
        </span>
        <div className="flex gap-2">
          {response.page > 1 && (
            <Link
              className="font-medium text-section-accent"
              href={`/admin/users?page=${response.page - 1}${queryString}`}
            >
              ← Prev
            </Link>
          )}
          {response.page < response.totalPages && (
            <Link
              className="font-medium text-section-accent"
              href={`/admin/users?page=${response.page + 1}${queryString}`}
            >
              Next →
            </Link>
          )}
        </div>
      </nav>
      <Link href="/admin" className="text-muted-foreground hover:text-foreground text-sm">
        ← Back to admin
      </Link>
    </div>
  );
}
