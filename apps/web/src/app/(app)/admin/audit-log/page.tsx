import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { AuditLogEntry } from '@statify/shared';
import { AuditLogFilters } from '@/components/admin';
import { Card, CardContent } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { fetchAuditLog } from '@/lib/admin/api';
import { isAdmin } from '@/lib/auth/admin';
import { getServerSession } from '@/lib/auth/session';

export const metadata = {
  title: 'Audit log | Statify admin',
};

export const dynamic = 'force-dynamic';

interface SearchParams {
  page?: string;
  action?: string;
  actorUserId?: string;
  targetTable?: string;
  targetId?: string;
}

const DEFAULT_LIMIT = 25;

export default async function AdminAuditLogPage({
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
  const actorUserIdNumeric = Number(params.actorUserId);

  const response = await fetchAuditLog(
    {
      page,
      limit: DEFAULT_LIMIT,
      action: params.action,
      actorUserId:
        Number.isFinite(actorUserIdNumeric) && actorUserIdNumeric > 0
          ? actorUserIdNumeric
          : undefined,
      targetTable: params.targetTable,
      targetId: params.targetId,
    },
    { cookieHeader, cache: 'no-store' },
  );

  const filterQuery = buildFilterQuery(params);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        headingLevel={2}
        title="Audit log"
        description={`${response.total.toLocaleString()} entries match the current filters.`}
      />
      <AuditLogFilters />
      <Card>
        <CardContent className="p-3 sm:p-4">
          {response.data.length === 0 ? (
            <p className="text-fg-muted text-sm">No audit log entries to show.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Audit log entries</caption>
                <thead className="text-muted-foreground text-left text-xs uppercase tracking-wide">
                  <tr>
                    <th scope="col" className="px-3 py-2">
                      Id
                    </th>
                    <th scope="col" className="px-3 py-2">
                      When
                    </th>
                    <th scope="col" className="px-3 py-2">
                      Actor
                    </th>
                    <th scope="col" className="px-3 py-2">
                      Action
                    </th>
                    <th scope="col" className="px-3 py-2">
                      Target
                    </th>
                    <th scope="col" className="px-3 py-2">
                      Metadata
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {response.data.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-t align-top motion-colors motion-list-item hover:bg-section-row-hover"
                    >
                      <td className="px-3 py-2 text-xs text-muted-foreground tabular-nums">
                        {entry.id}
                      </td>
                      <th
                        scope="row"
                        className="px-3 py-2 text-left text-xs whitespace-nowrap text-muted-foreground"
                      >
                        {formatDate(entry.createdAt)}
                      </th>
                      <td className="px-3 py-2">{entry.actorUserId ?? 'system'}</td>
                      <td className="px-3 py-2 font-mono text-xs">{entry.action}</td>
                      <td className="px-3 py-2 text-xs">
                        {entry.targetTable}
                        {entry.targetId !== null ? `:${entry.targetId}` : ''}
                      </td>
                      <td className="px-3 py-2 text-xs">{formatMetadata(entry)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <nav
        aria-label="Audit log pagination"
        className="flex items-center justify-between gap-4 text-sm"
      >
        <span className="text-muted-foreground">
          Page {response.page} of {Math.max(response.totalPages, 1)}
        </span>
        <div className="flex gap-2">
          {response.page > 1 && (
            <Link
              className="font-medium text-section-accent"
              href={`/admin/audit-log?page=${response.page - 1}${filterQuery}`}
            >
              ← Prev
            </Link>
          )}
          {response.page < response.totalPages && (
            <Link
              className="font-medium text-section-accent"
              href={`/admin/audit-log?page=${response.page + 1}${filterQuery}`}
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

function buildFilterQuery(params: SearchParams): string {
  const usp = new URLSearchParams();
  if (params.action) usp.set('action', params.action);
  if (params.actorUserId) usp.set('actorUserId', params.actorUserId);
  if (params.targetTable) usp.set('targetTable', params.targetTable);
  if (params.targetId) usp.set('targetId', params.targetId);
  const serialized = usp.toString();
  return serialized.length === 0 ? '' : `&${serialized}`;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}

function formatMetadata(entry: AuditLogEntry): string {
  if (entry.metadata === null) return '-';
  return JSON.stringify(entry.metadata);
}
