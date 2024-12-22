export interface SpotifyPlaylist {
  id: string;
  name: string;
  images: { url: string }[];
  tracks: {
    total: number;
  };
}

export interface PlaylistTrack {
  track: {
    id: string;
    name: string;
    artists: {
      id: string;
      name: string;
    }[];
    album: {
      release_date: string;
    };
  };
}

export interface ArtistAnalysis {
  gender: Record<string, number>;
  languages: Record<string, number>;
  releaseYears: Record<string, number>;
  topArtists: Array<{ name: string; count: number }>;
}