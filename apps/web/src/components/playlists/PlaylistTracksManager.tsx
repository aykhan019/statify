'use client';

import type { CatalogSearchTrackResult, UserPlaylistTrackEntry } from '@statify/shared';
import { useEffect, useRef, useState, type DragEvent } from 'react';
import { ArrowDown, ArrowUp, GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Cover } from '@/components/ui/Cover';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { ApiClientError } from '@/lib/api-client';
import { fetchCatalogSearch } from '@/lib/catalog/api';
import {
  addPlaylistTrack,
  removePlaylistTrack,
  reorderPlaylistTracks,
} from '@/lib/user-playlists/api';
import { cn } from '@/lib/utils/cn';

interface PlaylistTracksManagerProps {
  playlistId: number;
  initialTracks: UserPlaylistTrackEntry[];
}

export function PlaylistTracksManager({ playlistId, initialTracks }: PlaylistTracksManagerProps) {
  const [tracks, setTracks] = useState<UserPlaylistTrackEntry[]>(initialTracks);
  const [error, setError] = useState<string | null>(null);
  const [pendingTrackId, setPendingTrackId] = useState<number | null>(null);
  const [committingOrder, setCommittingOrder] = useState(false);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const preDragSnapshot = useRef<UserPlaylistTrackEntry[] | null>(null);

  const handleDragStart = (trackId: number) => (event: DragEvent<HTMLLIElement>) => {
    preDragSnapshot.current = tracks;
    setDraggedId(trackId);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(trackId));
  };

  const handleDragOver = (targetIndex: number) => (event: DragEvent<HTMLLIElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    if (draggedId === null) {
      return;
    }
    const sourceIndex = tracks.findIndex((entry) => entry.track.id === draggedId);
    if (sourceIndex === -1 || sourceIndex === targetIndex) {
      return;
    }
    const next = tracks.slice();
    const [moved] = next.splice(sourceIndex, 1);
    if (moved === undefined) {
      return;
    }
    next.splice(targetIndex, 0, moved);
    setTracks(next.map((entry, idx) => ({ ...entry, pos: idx })));
  };

  const handleDragEnd = async () => {
    setDraggedId(null);
    const snapshot = preDragSnapshot.current;
    preDragSnapshot.current = null;
    if (snapshot === null) {
      return;
    }
    const before = snapshot.map((entry) => entry.track.id).join(',');
    const after = tracks.map((entry) => entry.track.id).join(',');
    if (before === after) {
      return;
    }

    setCommittingOrder(true);
    setError(null);
    try {
      await reorderPlaylistTracks(
        playlistId,
        tracks.map((entry) => entry.track.id),
      );
    } catch (caught) {
      setTracks(snapshot);
      setError(toErrorMessage(caught, 'Could not save the new order.'));
    } finally {
      setCommittingOrder(false);
    }
  };

  const moveBy = async (trackId: number, delta: -1 | 1) => {
    const sourceIndex = tracks.findIndex((entry) => entry.track.id === trackId);
    const targetIndex = sourceIndex + delta;
    if (sourceIndex === -1 || targetIndex < 0 || targetIndex >= tracks.length) {
      return;
    }

    const snapshot = tracks;
    const next = tracks.slice();
    const [moved] = next.splice(sourceIndex, 1);
    if (moved === undefined) {
      return;
    }
    next.splice(targetIndex, 0, moved);
    const repositioned = next.map((entry, idx) => ({ ...entry, pos: idx }));
    setTracks(repositioned);
    setCommittingOrder(true);
    setError(null);
    try {
      await reorderPlaylistTracks(
        playlistId,
        repositioned.map((entry) => entry.track.id),
      );
    } catch (caught) {
      setTracks(snapshot);
      setError(toErrorMessage(caught, 'Could not save the new order.'));
    } finally {
      setCommittingOrder(false);
    }
  };

  const remove = async (trackId: number) => {
    const snapshot = tracks;
    setTracks(
      tracks
        .filter((entry) => entry.track.id !== trackId)
        .map((entry, idx) => ({ ...entry, pos: idx })),
    );
    setPendingTrackId(trackId);
    setError(null);
    try {
      await removePlaylistTrack(playlistId, trackId);
    } catch (caught) {
      setTracks(snapshot);
      setError(toErrorMessage(caught, 'Could not remove the track.'));
    } finally {
      setPendingTrackId(null);
    }
  };

  const add = async (result: CatalogSearchTrackResult) => {
    const trackId = result.id;
    if (tracks.some((entry) => entry.track.id === trackId)) {
      setError(`"${result.name}" is already in this playlist.`);
      return;
    }
    setPendingTrackId(trackId);
    setError(null);
    try {
      await addPlaylistTrack(playlistId, trackId);
      const optimisticEntry: UserPlaylistTrackEntry = {
        pos: tracks.length,
        addedAt: new Date().toISOString(),
        track: {
          album: {
            id: 0,
            imageUrl: null,
            name: result.albumName,
            primaryArtist: { id: 0, imageUrl: null, name: '', spotifyUri: '' },
            spotifyUri: '',
          },
          artists: [],
          durationMs: 0,
          id: trackId,
          imageUrl: result.imageUrl,
          name: result.name,
          previewUrl: null,
          spotifyUri: '',
        },
      };
      setTracks([...tracks, optimisticEntry]);
    } catch (caught) {
      setError(toErrorMessage(caught, 'Could not add the track.'));
    } finally {
      setPendingTrackId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <AddTrackSection
        existingTrackIds={tracks.map((entry) => entry.track.id)}
        onAdd={add}
        pendingTrackId={pendingTrackId}
      />

      {error !== null && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}

      {tracks.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No tracks yet. Search for one above to add it.
        </p>
      ) : (
        <ul
          className={cn('flex flex-col gap-1', committingOrder && 'pointer-events-none opacity-70')}
        >
          {tracks.map((entry, index) => (
            <li
              key={entry.track.id}
              draggable
              onDragStart={handleDragStart(entry.track.id)}
              onDragOver={handleDragOver(index)}
              onDragEnd={handleDragEnd}
              onDrop={handleDragEnd}
              className={cn(
                'flex items-center gap-3 rounded-(--radius-md) border border-border-default bg-surface-raised p-3 transition-colors hover:bg-section-row-hover',
                draggedId === entry.track.id && 'opacity-50',
              )}
            >
              <Icon as={GripVertical} size="sm" className="cursor-grab text-fg-faint" />
              <span className="w-8 shrink-0 text-right font-mono text-xs text-fg-muted tabular-nums">
                {index + 1}
              </span>
              <Cover
                src={entry.track.imageUrl ?? entry.track.album.imageUrl}
                name={entry.track.name}
                entity="track"
                size="xs"
                context="list-dense"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-fg-strong">{entry.track.name}</p>
                <p className="truncate text-xs text-fg-muted">
                  {entry.track.artists.map((artist) => artist.name).join(', ')}
                  {entry.track.album.name.length > 0 ? ` · ${entry.track.album.name}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => void moveBy(entry.track.id, -1)}
                  disabled={index === 0 || committingOrder}
                  aria-label={`Move ${entry.track.name} up`}
                >
                  <Icon as={ArrowUp} size="sm" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => void moveBy(entry.track.id, 1)}
                  disabled={index === tracks.length - 1 || committingOrder}
                  aria-label={`Move ${entry.track.name} down`}
                >
                  <Icon as={ArrowDown} size="sm" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => void remove(entry.track.id)}
                  disabled={pendingTrackId === entry.track.id}
                  aria-label={`Remove ${entry.track.name}`}
                >
                  <Icon as={Trash2} size="sm" />
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface AddTrackSectionProps {
  existingTrackIds: number[];
  onAdd: (result: CatalogSearchTrackResult) => Promise<void>;
  pendingTrackId: number | null;
}

function AddTrackSection({ existingTrackIds, onAdd, pendingTrackId }: AddTrackSectionProps) {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<CatalogSearchTrackResult[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const trimmed = term.trim();
  const existing = new Set(existingTrackIds);

  useEffect(() => {
    if (trimmed.length < 2) {
      setStatus('idle');
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setStatus('loading');
      fetchCatalogSearch({ q: trimmed, limit: 6 }, { signal: controller.signal })
        .then((response) => {
          setResults(response.tracks);
          setStatus('ready');
        })
        .catch((caught: unknown) => {
          if (caught instanceof DOMException && caught.name === 'AbortError') {
            return;
          }
          setStatus('error');
        });
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed]);

  return (
    <div className="flex flex-col gap-2">
      <Input
        type="search"
        placeholder="Search the catalog to add a track"
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        aria-label="Search the catalog to add a track"
      />
      {status === 'loading' && <p className="text-xs text-fg-muted">Searching...</p>}
      {status === 'error' && <p className="text-destructive text-xs">Search failed.</p>}
      {status === 'ready' && results.length === 0 && (
        <p className="text-xs text-fg-muted">No matches.</p>
      )}
      {results.length > 0 && (
        <ul className="flex max-h-72 flex-col gap-1 overflow-y-auto rounded-(--radius-md) border border-border-default p-1">
          {results.map((result) => {
            const isExisting = existing.has(result.id);
            return (
              <li
                key={result.id}
                className="flex items-center gap-3 rounded-(--radius-sm) px-3 py-2 hover:bg-section-row-hover"
              >
                <Cover
                  src={result.imageUrl}
                  name={result.name}
                  entity="track"
                  size="xs"
                  context="list-dense"
                  inSection={false}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-fg-strong">{result.name}</p>
                  <p className="truncate text-xs text-fg-muted">
                    {result.primaryArtistName} · {result.albumName}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={isExisting ? 'secondary' : 'primary'}
                  disabled={isExisting || pendingTrackId === result.id}
                  onClick={() => void onAdd(result)}
                >
                  {isExisting ? 'Added' : pendingTrackId === result.id ? 'Adding…' : 'Add'}
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function toErrorMessage(caught: unknown, fallback: string): string {
  if (caught instanceof ApiClientError) {
    return caught.message;
  }
  return fallback;
}
