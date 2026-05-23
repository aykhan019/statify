export function formatDurationMs(ms: number): string {
  if (Number.isNaN(ms) || ms < 0) {
    return '0:00';
  }

  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function formatTrackArtists(
  artists: ReadonlyArray<{ name: string; role: 'primary' | 'featured' }>,
): string {
  const primary = artists
    .filter((artist) => artist.role === 'primary')
    .map((artist) => artist.name);
  const featured = artists
    .filter((artist) => artist.role === 'featured')
    .map((artist) => artist.name);

  if (primary.length === 0 && featured.length === 0) {
    return 'Unknown';
  }

  if (featured.length === 0) {
    return primary.join(', ');
  }

  return `${primary.join(', ')} feat. ${featured.join(', ')}`;
}
