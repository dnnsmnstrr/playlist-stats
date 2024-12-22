import { useState } from 'react';
import { ListMusic } from 'lucide-react';
import type { SpotifyPlaylist } from '../types/spotify';

interface PlaylistSelectorProps {
  playlists: SpotifyPlaylist[];
  onSelect: (playlist: SpotifyPlaylist) => void;
}

export function PlaylistSelector({ playlists, onSelect }: PlaylistSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlaylists = playlists.filter((playlist) =>
    playlist.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center p-4">
        <h2 className="text-xl font-semibold">Select a Playlist</h2>
        <input
          type="text"
          placeholder="Search playlists"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4 p-2 border rounded"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {filteredPlaylists.map((playlist) => (
          <button
            key={playlist.id}
            onClick={() => onSelect(playlist)}
            className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow flex items-center space-x-4"
          >
            {playlist.images[0] ? (
              <img
                src={playlist.images[0].url}
                alt={playlist.name}
                className="w-16 h-16 rounded"
              />
            ) : (
              <ListMusic className="w-16 h-16 text-gray-400" />
            )}
            <div className="text-left">
              <h3 className="font-semibold">{playlist.name}</h3>
              <p className="text-sm text-gray-500">
                {playlist.tracks.total} tracks
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}