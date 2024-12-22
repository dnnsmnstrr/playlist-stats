import { useState, useEffect } from 'react';
import { spotify } from './services/spotify';
import { getArtistInfo } from './services/musicbrainz';
import { Login } from './components/Login';
import { PlaylistSelector } from './components/PlaylistSelector';
import { AnalysisResults } from './components/AnalysisResults';
import type { SpotifyPlaylist, PlaylistTrack, ArtistAnalysis } from './types/spotify';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<SpotifyPlaylist | null>(null);
  const [analysis, setAnalysis] = useState<ArtistAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await spotify.authenticate();
        setIsAuthenticated(true);
        const user = await spotify.currentUser.profile();
        const userPlaylists = await spotify.playlists.getUsersPlaylists(userId || user.id, undefined);
        console.log(userPlaylists)
        setPlaylists(userPlaylists.items);
      } catch (error) {
        console.error('Authentication error:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [userId]);

  const analyzePlaylist = async (playlist: SpotifyPlaylist) => {
    setIsLoading(true);
    setSelectedPlaylist(playlist);
    
    try {
      const tracks: PlaylistTrack[] = [];
      let offset = 0;
      
      // Fetch all tracks from the playlist
      while (true) {
        const response = await spotify.playlists.getPlaylistItems(playlist.id, undefined, undefined, 50, offset);
        tracks.push(...response.items);
        
        if (response.items.length < 50) break;
        offset += 50;
      }

      const artistCounts: Record<string, number> = {};
      const releaseYears: Record<string, number> = {};
      const genderData: Record<string, number> = { male: 0, female: 0, group: 0, unknown: 0 };
      const languageData: Record<string, number> = {};

      // Process each track
      for (const { track } of tracks) {
        // Count artists
        for (const artist of track.artists) {
          artistCounts[artist.name] = (artistCounts[artist.name] || 0) + 1;
          
          // Fetch artist info from MusicBrainz
          const artistInfo = await getArtistInfo(artist.name);
          
          if (artistInfo) {
            // Gender analysis
            if (artistInfo.type === 'Group') {
              genderData.group++;
            } else if (artistInfo.gender) {
              genderData[artistInfo.gender.toLowerCase()]++;
            } else {
              genderData.unknown++;
            }
            
            // Language analysis
            if (artistInfo.area?.name) {
              const language = artistInfo.area.name;
              languageData[language] = (languageData[language] || 0) + 1;
            }
          }
        }

        // Release year analysis
        const year = new Date(track.album.release_date).getFullYear();
        releaseYears[year] = (releaseYears[year] || 0) + 1;
      }

      // Calculate top 5 artists
      const topArtists = Object.entries(artistCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      setAnalysis({
        gender: genderData,
        languages: languageData,
        releaseYears,
        topArtists,
      });
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-500 text-white p-4">
        <h1 className="text-2xl font-bold">Spotify Playlist Analyzer</h1>
      </header>

      <main className="container mx-auto py-8">
        {!selectedPlaylist ? (
          <PlaylistSelector playlists={playlists} onSelect={analyzePlaylist} />
        ) : (
          <div>
            <button
              onClick={() => setSelectedPlaylist(null)}
              className="mb-4 text-green-500 hover:text-green-600"
            >
              ← Back to playlists
            </button>
            
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Analyzing playlist...</p>
              </div>
            ) : (
              analysis && <AnalysisResults analysis={analysis} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;