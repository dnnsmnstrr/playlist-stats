import React from 'react';
import { Music } from 'lucide-react';
import { spotify } from '../services/spotify';

export function Login() {
  const handleLogin = () => {
    spotify.authenticate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center">
        <Music className="w-16 h-16 mx-auto mb-4 text-green-500" />
        <h1 className="text-3xl font-bold mb-4">Playlist Analyzer</h1>
        <p className="text-gray-600 mb-6">
          Analyze your Spotify playlists for gender distribution, languages, and more
        </p>
        <button
          onClick={handleLogin}
          className="bg-green-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition-colors"
        >
          Login with Spotify
        </button>
      </div>
    </div>
  );
}