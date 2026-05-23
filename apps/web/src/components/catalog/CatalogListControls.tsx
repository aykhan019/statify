import Link from 'next/link';
import type {
  AlbumControlsState,
  ArtistControlsState,
  TrackControlsState,
} from '@/lib/catalog/query';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const CONTROL_BASE =
  'bg-input text-foreground h-10 rounded-(--radius-sm) border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60';

export function TrackCatalogControls({ values }: { values: TrackControlsState }) {
  return (
    <form
      className="border-border bg-surface flex flex-col gap-3 rounded-lg border p-4"
      action="/catalog/tracks"
    >
      {values.q !== undefined && <input type="hidden" name="q" value={values.q} />}
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Field label="Sort">
          <select name="sort" defaultValue={values.sort} className={CONTROL_BASE}>
            <option value="name">Name A-Z</option>
            <option value="-name">Name Z-A</option>
            <option value="durationMs">Shortest</option>
            <option value="-durationMs">Longest</option>
          </select>
        </Field>
        <Field label="Preview">
          <select name="hasPreview" defaultValue={values.hasPreview ?? ''} className={CONTROL_BASE}>
            <option value="">Any</option>
            <option value="true">Available</option>
            <option value="false">Missing</option>
          </select>
        </Field>
        <Field label="Min seconds">
          <Input
            name="minDurationSec"
            type="number"
            min={0}
            defaultValue={values.minDurationSec ?? ''}
          />
        </Field>
        <Field label="Max seconds">
          <Input
            name="maxDurationSec"
            type="number"
            min={0}
            defaultValue={values.maxDurationSec ?? ''}
          />
        </Field>
        <Field label="Genre">
          <select disabled className={CONTROL_BASE} defaultValue="">
            <option value="">Unavailable</option>
          </select>
        </Field>
        <Field label="Year">
          <select disabled className={CONTROL_BASE} defaultValue="">
            <option value="">Unavailable</option>
          </select>
        </Field>
      </div>
      <ControlActions resetHref="/catalog/tracks" />
    </form>
  );
}

export function ArtistCatalogControls({ values }: { values: ArtistControlsState }) {
  return (
    <form
      className="border-border bg-surface flex flex-col gap-3 rounded-lg border p-4"
      action="/catalog/artists"
    >
      {values.q !== undefined && <input type="hidden" name="q" value={values.q} />}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Sort">
          <select name="sort" defaultValue={values.sort} className={CONTROL_BASE}>
            <option value="name">Name A-Z</option>
            <option value="-name">Name Z-A</option>
            <option value="-createdAt">Newest</option>
            <option value="createdAt">Oldest</option>
          </select>
        </Field>
      </div>
      <ControlActions resetHref="/catalog/artists" />
    </form>
  );
}

export function AlbumCatalogControls({ values }: { values: AlbumControlsState }) {
  return (
    <form
      className="border-border bg-surface flex flex-col gap-3 rounded-lg border p-4"
      action="/catalog/albums"
    >
      {values.q !== undefined && <input type="hidden" name="q" value={values.q} />}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Sort">
          <select name="sort" defaultValue={values.sort} className={CONTROL_BASE}>
            <option value="name">Name A-Z</option>
            <option value="-name">Name Z-A</option>
            <option value="-createdAt">Newest</option>
            <option value="createdAt">Oldest</option>
          </select>
        </Field>
      </div>
      <ControlActions resetHref="/catalog/albums" />
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="text-foreground flex min-w-0 flex-col gap-1.5 text-sm font-medium">
      <span>{label}</span>
      {children}
    </label>
  );
}

function ControlActions({ resetHref }: { resetHref: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="submit" size="sm">
        Apply
      </Button>
      <Link
        href={resetHref}
        className="text-muted-foreground hover:text-foreground rounded-(--radius-sm) px-3 py-1.5 text-sm"
      >
        Reset
      </Link>
    </div>
  );
}
