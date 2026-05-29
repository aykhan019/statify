import Link from 'next/link';
import type {
  AlbumControlsState,
  ArtistControlsState,
  TrackControlsState,
} from '@/lib/catalog/query';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const CONTROL_BASE =
  'bg-input text-foreground h-10 rounded-(--radius-sm) border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page disabled:cursor-not-allowed disabled:opacity-60';

export function TrackCatalogControls({ values }: { values: TrackControlsState }) {
  return (
    <form className="border-border bg-surface rounded-lg border p-4" action="/catalog/tracks">
      <div className="grid items-end gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Field label="Search">
          <Input name="q" type="search" defaultValue={values.q ?? ''} placeholder="Search tracks" />
        </Field>
        <Field label="Sort">
          <select name="sort" defaultValue={values.sort} className={CONTROL_BASE}>
            <option value="-plays">Most played</option>
            <option value="plays">Least played</option>
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
        <ControlActions resetHref="/catalog/tracks" />
      </div>
    </form>
  );
}

export function ArtistCatalogControls({ values }: { values: ArtistControlsState }) {
  return (
    <form className="border-border bg-surface rounded-lg border p-4" action="/catalog/artists">
      <div className="grid items-end gap-3 sm:grid-cols-3">
        <Field label="Search">
          <Input
            name="q"
            type="search"
            defaultValue={values.q ?? ''}
            placeholder="Search artists"
          />
        </Field>
        <Field label="Sort">
          <select name="sort" defaultValue={values.sort} className={CONTROL_BASE}>
            <option value="-plays">Most played</option>
            <option value="plays">Least played</option>
            <option value="name">Name A-Z</option>
            <option value="-name">Name Z-A</option>
            <option value="-createdAt">Newest</option>
            <option value="createdAt">Oldest</option>
          </select>
        </Field>
        <ControlActions resetHref="/catalog/artists" />
      </div>
    </form>
  );
}

export function AlbumCatalogControls({ values }: { values: AlbumControlsState }) {
  return (
    <form className="border-border bg-surface rounded-lg border p-4" action="/catalog/albums">
      <div className="grid items-end gap-3 sm:grid-cols-3">
        <Field label="Search">
          <Input name="q" type="search" defaultValue={values.q ?? ''} placeholder="Search albums" />
        </Field>
        <Field label="Sort">
          <select name="sort" defaultValue={values.sort} className={CONTROL_BASE}>
            <option value="-plays">Most played</option>
            <option value="plays">Least played</option>
            <option value="name">Name A-Z</option>
            <option value="-name">Name Z-A</option>
            <option value="-createdAt">Newest</option>
            <option value="createdAt">Oldest</option>
          </select>
        </Field>
        <ControlActions resetHref="/catalog/albums" />
      </div>
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
    <div className="flex items-center justify-end gap-2">
      <Button type="submit">Apply</Button>
      <Link
        href={resetHref}
        className="text-muted-foreground hover:text-foreground inline-flex h-10 items-center rounded-(--radius-sm) px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page"
      >
        Reset
      </Link>
    </div>
  );
}
