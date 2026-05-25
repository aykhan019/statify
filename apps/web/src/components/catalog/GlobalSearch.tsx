'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import type { CatalogSearchResponse } from '@statify/shared';
import { fetchCatalogSearch } from '@/lib/catalog/api';
import { Cover, type EntityKind } from '@/components/ui/Cover';
import { Input } from '@/components/ui/Input';

type SearchStatus = 'idle' | 'loading' | 'ready' | 'error';

export function GlobalSearch() {
  const router = useRouter();
  const panelId = useId();
  const [term, setTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const trimmedTerm = term.trim();
  const { results, setResults, status } = useCatalogSearch(trimmedTerm);
  const closeResults = () => setResults(null);
  const panelOpen = shouldShowPanel(trimmedTerm.length, status, results);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (wrapperRef.current?.contains(event.target as Node) === false) {
        closeResults();
      }
    }

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [closeResults]);

  const submitSearch = () => {
    if (trimmedTerm.length >= 2) {
      closeResults();
      router.push(`/catalog/tracks?q=${encodeURIComponent(trimmedTerm)}`);
    }
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      closeResults();
      event.currentTarget.blur();
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-44 sm:w-72 lg:w-96">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          submitSearch();
        }}
      >
        <Input
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search catalog"
          aria-label="Search catalog"
          aria-controls={panelOpen ? panelId : undefined}
          aria-expanded={panelOpen}
          className="h-9"
        />
      </form>

      <SearchPanel
        onNavigate={closeResults}
        panelId={panelId}
        results={results}
        status={status}
        termLength={trimmedTerm.length}
      />
    </div>
  );
}

function useCatalogSearch(trimmedTerm: string): {
  results: CatalogSearchResponse | null;
  setResults: (results: CatalogSearchResponse | null) => void;
  status: SearchStatus;
} {
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [results, setResults] = useState<CatalogSearchResponse | null>(null);

  useEffect(() => {
    if (trimmedTerm.length < 2) {
      setStatus('idle');
      setResults(null);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setStatus('loading');
      fetchCatalogSearch({ limit: 4, q: trimmedTerm }, { signal: controller.signal })
        .then((response) => {
          setResults(response);
          setStatus('ready');
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === 'AbortError') {
            return;
          }

          setStatus('error');
        });
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [trimmedTerm]);

  return { results, setResults, status };
}

function SearchPanel({
  onNavigate,
  panelId,
  results,
  status,
  termLength,
}: {
  onNavigate: () => void;
  panelId: string;
  results: CatalogSearchResponse | null;
  status: SearchStatus;
  termLength: number;
}) {
  if (!shouldShowPanel(termLength, status, results)) {
    return null;
  }

  if (status === 'loading') {
    return <PanelMessage panelId={panelId}>Searching...</PanelMessage>;
  }

  if (status === 'error') {
    return (
      <PanelMessage panelId={panelId} kind="error">
        Search failed.
      </PanelMessage>
    );
  }

  if (results === null || !hasSearchResults(results)) {
    return <PanelMessage panelId={panelId}>No matches.</PanelMessage>;
  }

  return (
    <PanelShell id={panelId}>
      <div className="flex flex-col gap-2">
        <ResultGroup
          title="Tracks"
          items={results.tracks}
          renderItem={(track) => (
            <ResultLink
              key={`track-${track.id}`}
              href={`/catalog/tracks/${track.id}`}
              title={track.name}
              subtitle={`${track.primaryArtistName} · ${track.albumName}`}
              imageUrl={track.imageUrl}
              entity="track"
              onNavigate={onNavigate}
            />
          )}
        />
        <ResultGroup
          title="Artists"
          items={results.artists}
          renderItem={(artist) => (
            <ResultLink
              key={`artist-${artist.id}`}
              href={`/catalog/artists/${artist.id}`}
              title={artist.name}
              subtitle={`${artist.trackCount.toLocaleString()} tracks`}
              imageUrl={artist.imageUrl}
              entity="artist"
              onNavigate={onNavigate}
            />
          )}
        />
        <ResultGroup
          title="Albums"
          items={results.albums}
          renderItem={(album) => (
            <ResultLink
              key={`album-${album.id}`}
              href={`/catalog/albums/${album.id}`}
              title={album.name}
              subtitle={album.primaryArtistName}
              imageUrl={album.imageUrl}
              entity="album"
              onNavigate={onNavigate}
            />
          )}
        />
      </div>
    </PanelShell>
  );
}

function ResultGroup<T>({
  items,
  renderItem,
  title,
}: {
  items: T[];
  renderItem: (item: T) => ReactNode;
  title: string;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-1">
      <h2 className="text-muted-foreground px-3 text-xs font-semibold uppercase">{title}</h2>
      {items.map(renderItem)}
    </section>
  );
}

function PanelMessage({
  children,
  kind = 'muted',
  panelId,
}: {
  children: ReactNode;
  kind?: 'error' | 'muted';
  panelId: string;
}) {
  return (
    <PanelShell id={panelId}>
      <p
        role={kind === 'error' ? 'alert' : 'status'}
        className={
          kind === 'error'
            ? 'text-destructive px-3 py-2 text-sm'
            : 'text-muted-foreground px-3 py-2 text-sm'
        }
      >
        {children}
      </p>
    </PanelShell>
  );
}

function PanelShell({ children, id }: { children: ReactNode; id: string }) {
  return (
    <div
      id={id}
      role="region"
      aria-label="Search results"
      className="bg-surface border-border absolute right-0 top-11 z-40 flex max-h-[70vh] w-[min(28rem,calc(100vw-2rem))] flex-col overflow-y-auto rounded-lg border p-2 shadow-lg"
    >
      {children}
    </div>
  );
}

function shouldShowPanel(
  termLength: number,
  status: SearchStatus,
  results: CatalogSearchResponse | null,
): boolean {
  return termLength >= 2 && (status === 'loading' || status === 'error' || results !== null);
}

function hasSearchResults(results: CatalogSearchResponse): boolean {
  return results.tracks.length > 0 || results.artists.length > 0 || results.albums.length > 0;
}

function ResultLink({
  entity,
  href,
  imageUrl,
  onNavigate,
  subtitle,
  title,
}: {
  entity: Extract<EntityKind, 'track' | 'artist' | 'album'>;
  href: string;
  imageUrl: string | null;
  onNavigate: () => void;
  subtitle: string;
  title: string;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="flex items-center gap-3 rounded-(--radius-sm) px-3 py-2 motion-colors motion-list-item hover:bg-section-row-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised"
    >
      <Cover
        src={imageUrl}
        name={title}
        entity={entity}
        size="xs"
        context="list-dense"
        inSection={false}
      />
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-fg-strong">{title}</span>
        <span className="block truncate text-xs text-fg-muted">{subtitle}</span>
      </span>
    </Link>
  );
}
