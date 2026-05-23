'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminUserListItem, UserRole } from '@statify/shared';
import { Button } from '@/components/ui/Button';
import { ApiClientError } from '@/lib/api-client';
import { updateUserBan, updateUserRole } from '@/lib/admin/api';

interface AdminUsersTableProps {
  currentUserId: number;
  initialUsers: AdminUserListItem[];
}

export function AdminUsersTable({ currentUserId, initialUsers }: AdminUsersTableProps) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [busyUserId, setBusyUserId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  if (users.length === 0) {
    return <p className="text-muted-foreground text-sm">No users match your search.</p>;
  }

  async function applyRole(userId: number, role: UserRole) {
    setBusyUserId(userId);
    setError(null);
    try {
      const updated = await updateUserRole(userId, { role });
      setUsers((prev) => prev.map((user) => (user.id === userId ? updated : user)));
      startTransition(() => router.refresh());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyUserId(null);
    }
  }

  async function applyBan(userId: number, banned: boolean) {
    setBusyUserId(userId);
    setError(null);
    try {
      const updated = await updateUserBan(userId, { banned });
      setUsers((prev) => prev.map((user) => (user.id === userId ? updated : user)));
      startTransition(() => router.refresh());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyUserId(null);
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
          <thead className="text-muted-foreground text-left text-xs uppercase tracking-wide">
            <tr>
              <th className="px-3 py-2">User</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Joined</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isSelf = user.id === currentUserId;
              const isBusy = busyUserId === user.id;
              const status = computeStatus(user);
              const nextRole: UserRole = user.role === 'admin' ? 'user' : 'admin';
              return (
                <tr key={user.id} className="border-t">
                  <td className="px-3 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium">{user.displayName}</span>
                      <span className="text-muted-foreground text-xs">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-sm">{user.role}</span>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={status === 'active' ? 'text-muted-foreground' : 'text-destructive'}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={isSelf || isBusy || user.deletedAt !== null}
                        onClick={() => applyRole(user.id, nextRole)}
                      >
                        Make {nextRole}
                      </Button>
                      {user.bannedAt === null ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={isSelf || isBusy || user.deletedAt !== null}
                          onClick={() => applyBan(user.id, true)}
                        >
                          Ban
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={isSelf || isBusy}
                          onClick={() => applyBan(user.id, false)}
                        >
                          Unban
                        </Button>
                      )}
                    </div>
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

function computeStatus(user: AdminUserListItem): 'active' | 'banned' | 'deleted' {
  if (user.deletedAt !== null) return 'deleted';
  if (user.bannedAt !== null) return 'banned';
  return 'active';
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString();
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong';
}
