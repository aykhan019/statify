import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AdminCatalogSearch, AdminTracksTable } from '@/components/admin';
import { Card, CardContent } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { fetchAdminTracks } from '@/lib/admin/api';
import { isAdmin } from '@/lib/auth/admin';
import { getServerSession } from '@/lib/auth/session';

export const metadata = {
  title: 'Tracks | Statify admin',
};

export const dynamic = 'force-dynamic';

interface SearchParams {
  page?: string;
  q?: string;
  includeHidden?: string;
}

const DEFAULT_LIMIT = 25;

export default async function AdminTracksPage({
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
  const includeHidden = params.includeHidden !== 'false';

  const response = await fetchAdminTracks(
    { page, limit: DEFAULT_LIMIT, q: params.q, includeHidden },
    { cookieHeader, cache: 'no-store' },
  );

  const queryParts: string[] = [];
  if (params.q) queryParts.push(`q=${encodeURIComponent(params.q)}`);
  if (!includeHidden) queryParts.push('includeHidden=false');
  const tailQuery = queryParts.length === 0 ? '' : `&${queryParts.join('&')}`;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        headingLevel={2}
        title="Tracks"
        description={`${response.total.toLocaleString()} tracks in the catalog.`}
      />
      <AdminCatalogSearch
        basePath="/admin/tracks"
        placeholder="Search title, album, artist — or scope it: id:1, artist:shakira"
        fieldId="admin-tracks-search"
        fieldLabel="Search tracks"
      />
      <Card>
        <CardContent className="p-3 sm:p-4">
          <AdminTracksTable
            key={`${params.q ?? ''}-${String(includeHidden)}-${response.page}`}
            initial={response.data}
          />
        </CardContent>
      </Card>
      <nav
        aria-label="Track pagination"
        className="flex items-center justify-between gap-4 text-sm"
      >
        <span className="text-muted-foreground">
          Page {response.page} of {Math.max(response.totalPages, 1)}
        </span>
        <div className="flex gap-2">
          {response.page > 1 && (
            <Link
              className="font-medium text-section-accent"
              href={`/admin/tracks?page=${response.page - 1}${tailQuery}`}
            >
              ← Prev
            </Link>
          )}
          {response.page < response.totalPages && (
            <Link
              className="font-medium text-section-accent"
              href={`/admin/tracks?page=${response.page + 1}${tailQuery}`}
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
