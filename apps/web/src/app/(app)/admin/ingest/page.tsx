import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { IngestCheckpoint } from '@statify/shared';
import { IngestTriggerForm } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { fetchIngestRuns } from '@/lib/admin/api';
import { isAdmin } from '@/lib/auth/admin';
import { getServerSession } from '@/lib/auth/session';

export const metadata = {
  title: 'Ingestion | Statify admin',
};

export const dynamic = 'force-dynamic';

export default async function AdminIngestPage() {
  const user = await getServerSession();
  if (user === null || !isAdmin(user)) {
    redirect('/me');
  }

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const response = await fetchIngestRuns({ cookieHeader, cache: 'no-store' });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Ingestion"
        description="Trigger an MPD ingest run and review prior checkpoint state."
      />
      <Card>
        <CardHeader>
          <CardTitle>Trigger a run</CardTitle>
        </CardHeader>
        <CardContent>
          <IngestTriggerForm running={response.running} />
          {response.running && response.startedAt !== null && (
            <p className="text-muted-foreground mt-3 text-sm">
              In progress since {new Date(response.startedAt).toLocaleString()}.
            </p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recent checkpoints</CardTitle>
        </CardHeader>
        <CardContent>
          {response.data.length === 0 ? (
            <p className="text-fg-muted text-sm">
              No ingest checkpoints recorded yet. Trigger a run above to populate this list.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-muted-foreground text-left text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-3 py-2">Slice</th>
                    <th className="px-3 py-2">Playlists</th>
                    <th className="px-3 py-2">Tracks</th>
                    <th className="px-3 py-2">Started</th>
                    <th className="px-3 py-2">Finished</th>
                    <th className="px-3 py-2">State</th>
                  </tr>
                </thead>
                <tbody>
                  {response.data.map((row) => (
                    <tr
                      key={row.id}
                      className="border-t transition-colors hover:bg-section-row-hover"
                    >
                      <td className="px-3 py-2 font-medium">{row.sliceFilename}</td>
                      <td className="px-3 py-2">
                        {row.playlistsDone.toLocaleString()} / {row.playlistsTotal.toLocaleString()}
                      </td>
                      <td className="px-3 py-2">{row.tracksUpserted.toLocaleString()}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {formatDate(row.startedAt)}
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {row.completedAt === null ? '-' : formatDate(row.completedAt)}
                      </td>
                      <td className="px-3 py-2">{renderState(row)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <Link href="/admin" className="text-muted-foreground hover:text-foreground text-sm">
        ← Back to admin
      </Link>
    </div>
  );
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}

function renderState(row: IngestCheckpoint) {
  if (row.errorMessage !== null) {
    return <span className="text-destructive text-sm">error: {row.errorMessage}</span>;
  }
  if (row.completedAt === null) {
    return <span className="text-sm">running</span>;
  }
  return <span className="text-muted-foreground text-sm">done</span>;
}
