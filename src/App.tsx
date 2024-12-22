import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { spotify } from './services/spotify'; // Adjust the import according to your project structure
import { getArtistInfo, loadCache, saveCache } from './services/musicbrainz';
import { PlaylistSelector } from './components/PlaylistSelector';
import { AnalysisResults } from './components/AnalysisResults';
import { Login } from './components/Login';
import type { SpotifyPlaylist, ArtistAnalysis, PlaylistTrack } from './types/spotify';
import { Playlist, TrackItem } from '@spotify/web-api-ts-sdk';
import { areaToLanguage } from './lib/config';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<SpotifyPlaylist | null>(null);
  const [analysis, setAnalysis] = useState<ArtistAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [userId, setUserId] = useState<string>('');
  const location = useLocation();
  const navigate = useNavigate();

  const loadPlaylists = async () => {
    setIsLoading(true);
    let userPlaylists: Playlist<TrackItem>[] = [];
    let offset = 0;
    let total = 0;

    do {
      const response = await spotify.playlists.getUsersPlaylists(userId, 50, offset);
      userPlaylists = userPlaylists.concat(response.items);
      total = response.total;
      offset += 50;
    } while (userPlaylists.length < total && offset < total);
    setPlaylists(userPlaylists);
    setIsLoading(false);
  }
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await spotify.authenticate();
        setIsAuthenticated(true);
        const user = await spotify.currentUser.profile();
        if (!userId) {
          setUserId(user.id);
          loadPlaylists();
        }
      } catch (error) {
        console.error('Authentication error:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (userId && location.pathname.length === 1 && !playlists.length) {
      loadPlaylists();
    };
  }, [userId]);

  const getSelectedPlaylist = async (id: string) => {
    const playlist = await spotify.playlists.getPlaylist(id);
    setSelectedPlaylist(playlist);
    analyzePlaylist(playlist);
  }

  useEffect(() => {
    console.log(location)
    if (location.pathname !== '/callback' && location.pathname !== '/' && !selectedPlaylist) {
      getSelectedPlaylist(location.pathname.split('/')[1])
    }
  }, [location])
  
  const analyzePlaylist = async (playlist: SpotifyPlaylist) => {
    const cachedAnalysis = localStorage.getItem(`playlist_${playlist.id}`);
    if (cachedAnalysis) {
      setAnalysis(JSON.parse(cachedAnalysis));
      return;
    }
    setIsLoading(true);
    setProgress(0);
    setSelectedPlaylist(playlist);
    await loadCache();
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
      const genderData: Record<string, number> = { male: 0, female: 0, group: 0, unknown: 0, 'non-binary': 0 };
      const languageData: Record<string, number> = {};
      const areaData: Record<string, number> = {};
      const ageData: Record<number, number> = {};


      // Process each track
      let count = 0;
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
              const country = artistInfo.country || artistInfo.area.name || (artistInfo['begin-area'] && artistInfo['begin-area'].name);
              areaData[country] = (areaData[country] || 0) + 1;

              const language = areaToLanguage[country] || 'Unknown';
              if (language === 'Unknown') {
                console.log('Unknown language for country:', country, artistInfo, track);
              }
              languageData[language] = (languageData[language] || 0) + 1;
            }

            // Age analysis
            if (artistInfo['life-span']?.begin) {
              const birthYear = new Date(artistInfo['life-span'].begin).getFullYear();
              const currentYear = new Date().getFullYear();
              const age = currentYear - birthYear;
              ageData[age] = (ageData[age] || 0) + 1;
            }
          }

        }
        
        // Release year analysis
        const year = new Date(track.album.release_date).getFullYear();
        releaseYears[year] = (releaseYears[year] || 0) + 1;
        
        // Update progress
        count++;
        setProgress(count / tracks.length);
      }

      // Calculate top 5 artists
      const topArtists = Object.entries(artistCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      
      const analysisResult = {
        gender: genderData,
        languages: languageData,
        ages: ageData,
        countries: areaData,
        releaseYears,
        topArtists,
      };

      setAnalysis(analysisResult);
      localStorage.setItem(`playlist_${playlist.id}`, JSON.stringify({
        ...playlist,
        ...analysisResult
      }));
      saveCache();
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
      <PlaylistSelector playlists={playlists} isLoading={isLoading} onSelect={(playlist) => {
        navigate(`/${playlist.id}`)
        analyzePlaylist(playlist)
      }} />
        ) : (
          <div>
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  history.pushState({}, '', '/');
                  setSelectedPlaylist(null)
                  setAnalysis(null);
                }}
                className="mb-4 mx-6 text-green-500 hover:text-green-600"
              >
                ← Back to playlists
              </button>
              <h2 className="text-2xl font-semibold mb-4">
                {selectedPlaylist.name}
                <span className="text-gray-600 mb-4 ml-2 font-medium text-sm">
                  {selectedPlaylist.tracks.total} tracks
                </span>
                <button
                  title='Re-analyze playlist'
                  onClick={() => {
                    localStorage.removeItem(`playlist_${selectedPlaylist.id}`);
                    analyzePlaylist(selectedPlaylist);
                  }}
                  className="text-white px-4 py-2 rounded-lg ml-4"
                >
                  🔃
                </button>
              </h2>
            </div>
            
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Analyzing playlist...</p>
                <p className="mt-4 text-gray-600">{Math.round(progress * 100)}%</p>
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