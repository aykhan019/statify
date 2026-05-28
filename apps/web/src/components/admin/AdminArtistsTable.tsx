'use client';

import { Eye, EyeOff, Pencil, X } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminArtistListItem } from '@statify/shared';
import { EmptyState } from '@/components/states';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ApiClientError } from '@/lib/api-client';
import { setAdminArtistHidden, updateAdminArtist } from '@/lib/admin/api';
import { CopyButton } from './CopyButton';

interface AdminArtistsTableProps {
  initial: AdminArtistListItem[];
}

interface EditState {
  id: number;
  name: string;
  imageUrl: string;
}

export function AdminArtistsTable({ initial }: AdminArtistsTableProps) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  if (items.length === 0) {
    return <EmptyState title="No artists match your search" />;
  }

  async function applyEdit(id: number) {
    if (editing === null) return;
    setBusyId(id);
    setError(null);
    try {
      const updated = await updateAdminArtist(id, {
        name: editing.name.trim(),
        imageUrl: editing.imageUrl.trim().length > 0 ? editing.imageUrl.trim() : null,
      });
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setEditing(null);
      startTransition(() => router.refresh());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  async function applyHidden(id: number, hidden: boolean) {
    setBusyId(id);
    setError(null);
    try {
      const updated = await setAdminArtistHidden(id, { hidden });
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      startTransition(() => router.refresh());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error !== null && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">Admin artists</caption>
          <thead className="text-muted-foreground text-left text-xs uppercase tracking-wide">
            <tr>
              <th scope="col" className="px-3 py-2">
                Id
              </th>
              <th scope="col" className="px-3 py-2">
                Artist
              </th>
              <th scope="col" className="px-3 py-2">
                Image URL
              </th>
              <th scope="col" className="px-3 py-2">
                Albums
              </th>
              <th scope="col" className="px-3 py-2">
                Tracks
              </th>
              <th scope="col" className="px-3 py-2">
                Status
              </th>
              <th scope="col" className="px-3 py-2">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {/* eslint-disable-next-line complexity */}
            {items.map((item) => {
              const isEditing = editing?.id === item.id;
              const isBusy = busyId === item.id;
              const isHidden = item.hiddenAt !== null;
              return (
                <tr
                  key={item.id}
                  className="border-t motion-colors motion-list-item hover:bg-section-row-hover"
                >
                  <td className="px-3 py-3 text-xs text-muted-foreground tabular-nums">
                    {item.id}
                  </td>
                  <th scope="row" className="px-3 py-3 text-left">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editing.name}
                        onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                        className="w-full rounded-(--radius-sm) border border-border-default bg-surface-page px-2 py-1"
                      />
                    ) : (
                      <span className="font-medium">{item.name}</span>
                    )}
                  </th>
                  <td className="w-56 max-w-56 px-3 py-3 text-xs text-muted-foreground">
                    {isEditing ? (
                      <input
                        type="url"
                        value={editing.imageUrl}
                        onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })}
                        placeholder="(blank to clear)"
                        className="w-full rounded-(--radius-sm) border border-border-default bg-surface-page px-2 py-1"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="line-clamp-1 min-w-0 flex-1 truncate">
                          {item.imageUrl ?? '—'}
                        </span>
                        {item.imageUrl !== null && <CopyButton value={item.imageUrl} />}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3 tabular-nums">{item.albumCount}</td>
                  <td className="px-3 py-3 tabular-nums">{item.trackCount}</td>
                  <td className="px-3 py-3">
                    <span className={isHidden ? 'text-destructive' : 'text-muted-foreground'}>
                      {isHidden ? 'hidden' : 'visible'}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    {isEditing ? (
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={isBusy}
                          onClick={() => setEditing(null)}
                        >
                          <Icon as={X} size="xs" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          disabled={isBusy || editing.name.trim().length === 0}
                          onClick={() => applyEdit(item.id)}
                        >
                          Save
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={isBusy}
                          onClick={() =>
                            setEditing({
                              id: item.id,
                              name: item.name,
                              imageUrl: item.imageUrl ?? '',
                            })
                          }
                        >
                          <Icon as={Pencil} size="xs" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant={isHidden ? 'secondary' : 'destructive'}
                          disabled={isBusy}
                          onClick={() => applyHidden(item.id, !isHidden)}
                          className="w-24 justify-center"
                        >
                          <Icon as={isHidden ? Eye : EyeOff} size="xs" />
                          {isHidden ? 'Unhide' : 'Hide'}
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
}
