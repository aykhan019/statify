export interface RawMpdTrack {
  pos: number;
  artist_name: string;
  artist_uri: string;
  track_name: string;
  track_uri: string;
  album_name: string;
  album_uri: string;
  duration_ms: number;
}

export interface RawMpdPlaylist {
  pid: number;
  name: string;
  collaborative: string | boolean;
  modified_at: number;
  num_followers: number;
  num_edits: number;
  duration_ms: number;
  tracks: RawMpdTrack[];
}

export interface RawMpdSlice {
  info?: {
    slice?: string;
    generated_on?: string;
    version?: string;
  };
  playlists: RawMpdPlaylist[];
}

export interface NormalizedArtist {
  spotifyUri: string;
  name: string;
  normalizedName: string;
}

export interface NormalizedAlbum {
  spotifyUri: string;
  name: string;
  primaryArtistSpotifyUri: string;
}

export interface NormalizedTrack {
  spotifyUri: string;
  name: string;
  albumSpotifyUri: string;
  durationMs: number;
}

export interface NormalizedTrackArtist {
  trackSpotifyUri: string;
  artistSpotifyUri: string;
  role: 'primary';
}

export interface NormalizedPlaylist {
  mpdPid: number;
  name: string;
  collaborative: boolean;
  modifiedAt: Date;
  numFollowers: number;
  numEdits: number;
  durationMs: bigint;
}

export interface NormalizedPlaylistTrack {
  mpdPid: number;
  trackSpotifyUri: string;
  pos: number;
}

export interface NormalizedSlice {
  artists: NormalizedArtist[];
  albums: NormalizedAlbum[];
  tracks: NormalizedTrack[];
  trackArtists: NormalizedTrackArtist[];
  playlists: NormalizedPlaylist[];
  playlistTracks: NormalizedPlaylistTrack[];
}

export interface IngestCounts {
  artists: number;
  albums: number;
  tracks: number;
  playlists: number;
}
