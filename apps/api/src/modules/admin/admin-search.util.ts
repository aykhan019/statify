export function toPositiveInt(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  const n = Number(value);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}

export interface ParsedSearchQuery {
  /** Lowercased field qualifier (e.g. `id`, `artist`), or null for free text. */
  field: string | null;
  /** The value after the qualifier, or the whole trimmed query when unscoped. */
  value: string;
}

const FIELD_QUALIFIER = /^([a-z][a-z0-9_-]*):([\s\S]+)$/i;

/**
 * Splits a `field:value` qualifier out of a search string so admins can scope
 * a search to one column — `id:1` → `{ field: 'id', value: '1' }`,
 * `artist:shakira` → `{ field: 'artist', value: 'shakira' }`. A plain string
 * (or an empty value after the colon) falls back to free text.
 */
export function parseSearchQuery(q: string): ParsedSearchQuery {
  const trimmed = q.trim();
  const match = FIELD_QUALIFIER.exec(trimmed);
  if (match === null) return { field: null, value: trimmed };
  const value = match[2]!.trim();
  if (value.length === 0) return { field: null, value: trimmed };
  return { field: match[1]!.toLowerCase(), value };
}

/**
 * Resolves a parsed search against a map of per-field condition builders.
 * Returns the scoped where-condition, or null to signal a free-text fallback
 * (no qualifier present, or an unrecognized field for this entity).
 */
export function buildScopedFilter<W>(
  search: ParsedSearchQuery,
  fields: Record<string, (value: string) => W>,
): W | null {
  if (search.field === null) return null;
  const builder = fields[search.field];
  return builder === undefined ? null : builder(search.value);
}

/** Exact-id match value; a non-positive-int qualifier matches no row. */
export function idFilterValue(value: string): number {
  return toPositiveInt(value) ?? -1;
}
