'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import type { CatalogSearchResponse } from '@statify/shared';
import { fetchCatalogSearch } from '@/lib/catalog/api';
import { Input } from '@/components/ui/Input';

type SearchStatus = 'idle' | 'loading' | 'ready' | 'error';

export function GlobalSearch() {
  const router = useRouter();
  const [term, setTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const trimmedTerm = term.trim();
  const { results, setResults, status } = useCatalogSearch(trimmedTerm);
  const closeResults = () => setResults(null);

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
          aria-expanded={shouldShowPanel(trimmedTerm.length, status, results)}
          className="h-9"
        />
      </form>

      <SearchPanel
        onNavigate={closeResults}
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
  results,
  status,
  termLength,
}: {
  onNavigate: () => void;
  results: CatalogSearchResponse | null;
  status: SearchStatus;
  termLength: number;
}) {
  if (!shouldShowPanel(termLength, status, results)) {
    return null;
  }

  if (status === 'loading') {
    return <PanelMessage>Searching...</PanelMessage>;
  }

  if (status === 'error') {
    return <PanelMessage kind="error">Search failed.</PanelMessage>;
  }

  if (results === null || !hasSearchResults(results)) {
    return <PanelMessage>No matches.</PanelMessage>;
  }

  return (
    <PanelShell>
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
}: {
  children: ReactNode;
  kind?: 'error' | 'muted';
}) {
  return (
    <PanelShell>
      <p
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

function PanelShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-surface border-border absolute right-0 top-11 z-40 flex max-h-[70vh] w-[min(28rem,calc(100vw-2rem))] flex-col overflow-y-auto rounded-lg border p-2 shadow-lg">
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
  href,
  onNavigate,
  subtitle,
  title,
}: {
  href: string;
  onNavigate: () => void;
  subtitle: string;
  title: string;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="hover:bg-muted rounded-(--radius-sm) px-3 py-2"
    >
      <span className="text-foreground block truncate text-sm font-medium">{title}</span>
      <span className="text-muted-foreground block truncate text-xs">{subtitle}</span>
    </Link>
  );
}
