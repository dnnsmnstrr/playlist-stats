import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { spotify } from './services/spotify'; // Adjust the import according to your project structure
import { getArtistInfo } from './services/musicbrainz';
import { PlaylistSelector } from './components/PlaylistSelector';
import { AnalysisResults } from './components/AnalysisResults';
import { Login } from './components/Login';
import type { SpotifyPlaylist, ArtistAnalysis, PlaylistTrack } from './types/spotify';
import { Playlist, TrackItem } from '@spotify/web-api-ts-sdk';

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
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await spotify.authenticate();
        setIsAuthenticated(true);
        const user = await spotify.currentUser.profile();
        if (user.id && location.pathname.length === 1 && !playlists.length) {
          setIsLoading(true);
          let userPlaylists: Playlist<TrackItem>[] = [];
          let offset = 0;
          let total = 0;
  
          do {
            const response = await spotify.playlists.getUsersPlaylists(userId || user.id, 50, offset);
            userPlaylists = userPlaylists.concat(response.items);
            total = response.total;
            offset += 50;
          } while (userPlaylists.length < total && offset < total);
          setPlaylists(userPlaylists);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
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
      const genderData: Record<string, number> = { male: 0, female: 0, group: 0, unknown: 0, 'non-binary': 0 };
      const languageData: Record<string, number> = {};
      const areaData: Record<string, number> = {};
      const ageData: Record<number, number> = {};

      // Process each track
      for (const { track } of tracks) {
        setProgress((prev) => prev + 1 / tracks.length);
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
              const country = artistInfo.country || artistInfo.area.name || artistInfo.beginArea.name;
              areaData[country] = (areaData[country] || 0) + 1;

              const countryToLanguageMap: Record<string, string> = {
                Germany: 'German',
                DE: 'German',
                // German cities
                Berlin: 'German',
                Hamburg: 'German',
                München: 'German',
                Mannheim: 'German',
                Magdeburg: 'German',
                Düsseldorf: 'German',
                Dresden: 'German',
                Chemnitz: 'German',
                Leipzig: 'German',
                Potsdam: 'German',
                Tübingen: 'German',
                Frankfurt: 'German',
                Köln: 'German',
                Bonn: 'German',
                Mainz: 'German',
                Kassel: 'German',
                Duisburg: 'German',
                Bochum: 'German',
                Fürth: 'German',
                // German states
                Hessen: 'German',
                Bayern: 'German',
                German: 'German',
                // Other german-speaking countries and cities
                Switzerland: 'German',
                Zürich: 'German',
                'St. Gallen': 'German',
                CH: 'German',
                Austria: 'German',
                Wien: 'German',
                AT: 'German',
                Salzburg: 'German',
                Linz: 'German',
                Graz: 'German',
                Innsbruck: 'German',
                // English countries and cities
                US: 'English',
                UK: 'English',
                GB: 'English',
                'United States': 'English',
                'United Kingdom': 'English',
                'New York': 'English',
                'Los Angeles': 'English',
                Nashville: 'English',
                Brooklyn: 'English',
                Atlanta: 'English',
                Seattle: 'English',
                Pittsburgh: 'English',
                Philadelphia: 'English',
                Florida: 'English',
                California: 'English',
                CA: 'English',
                NZ: 'English',
                'New Zealand': 'English',
                Wellington: 'English',
                Auckland: 'English',
                Canada: 'English',
                IE: 'English',
                IS: 'English',
                Iceland: 'English',
                England: 'English',
                London: 'English',
                Ireland: 'English',
                Dublin: 'English',
                Scotland: 'English',
                Edinburgh: 'English',
                AU: 'English',
                Australia: 'English',
                Sydney: 'English',
                Melbourne: 'English',
                Brisbane: 'English',
                Perth: 'English',
                // Other languages
                France: 'French',
                FR: 'French',
                Paris: 'French',
                BE: 'French',
                Belgium: 'French',
                Italy: 'Italian',
                IT: 'Italian',
                Rome: 'Italian',
                Venice: 'Italian',
                Spain: 'Spanish',
                ES: 'Spanish',
                Madrid: 'Spanish',
                Barcelona: 'Spanish',
                Mexico: 'Spanish',
                Lima: 'Spanish',
                MX: 'Spanish',
                PR: 'Spanish',
                'Puerto Rico': 'Spanish',
                'Netherlands': 'Dutch',
                NL: 'Dutch',
                Amsterdam: 'Dutch',
                DK: 'Danish',
                Denmark: 'Danish',
                Copenhagen: 'Danish',
                Sweden: 'Swedish',
                SE: 'Swedish',
                Stockholm: 'Swedish',
                Norway: 'Norwegian',
                NO: 'Norwegian',
                Oslo: 'Norwegian',
                Finland: 'Finnish',
                FI: 'Finnish',
                Helsinki: 'Finnish',
                Brazil: 'Portuguese',
                BR: 'Portuguese',
                PT: 'Portuguese',
                Portugal: 'Portuguese',
                IL: 'English',
                Israel: 'English',
                'Tel Aviv': 'English',
                Japan: 'Japanese',
                JP: 'Japanese',
                Tokyo: 'Japanese',
                China: 'Chinese',
                CN: 'Chinese',
                Beijing: 'Chinese',
                'Hong Kong': 'Chinese'
              };

              const language = countryToLanguageMap[country] || 'Unknown';
              if (language === 'Unknown') {
                console.log('Unknown language for country:', country, artistInfo);
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
      }

      // Calculate top 5 artists
      const topArtists = Object.entries(artistCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      setAnalysis({
        gender: genderData,
        languages: languageData,
        ages: ageData,
        areaData,
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
      <PlaylistSelector playlists={playlists} isLoading={isLoading} onSelect={(playlist) => {
        // window.location.pathname = `/${playlist.id}`
        navigate(`/${playlist.id}`)
        analyzePlaylist(playlist)
      }} />
        ) : (
          <div>
            <div className="flex items-start justify-between">
              <button
                onClick={() => {
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