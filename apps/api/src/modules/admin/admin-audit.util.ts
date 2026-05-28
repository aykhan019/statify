export type AuditFieldChange = { from: unknown; to: unknown };
export type AuditChangeSet = Record<string, AuditFieldChange>;

export function diffAuditFields<T extends Record<string, unknown>>(
  before: T,
  after: T,
): AuditChangeSet | null {
  const changes: AuditChangeSet = {};
  for (const key of Object.keys(after)) {
    if (before[key] !== after[key]) {
      changes[key] = { from: before[key], to: after[key] };
    }
  }
  return Object.keys(changes).length === 0 ? null : changes;
}
