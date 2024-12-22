import { IBrowseArtistsResult, MusicBrainzApi } from 'musicbrainz-api';

const mbApi = new MusicBrainzApi({
    appName: 'SpotifyPlaylistAnalyzer',
    appVersion: '0.1.0',
    appContactInfo: 'dennismuensterer@mail.com',
});

const MUSICBRAINZ_API = 'https://musicbrainz.org/ws/2';
const email = 'dennismuensterer@gmail.com';

const artistCache: { [name: string]: any } = {};

export async function getArtistInfo(name: string) {
  if (artistCache[name]) {
    console.log('Returning cached artist info for:', name, artistCache[name]);
    return artistCache[name];
  }

  try {
    const response = await mbApi.restGet('/artist/', { query: name}) as IBrowseArtistsResult;
    const artist = response.artists[0] || null;
    // const response = await fetch(
    //   `${MUSICBRAINZ_API}/artist/?query=${encodeURIComponent(name)}&fmt=json`,
    //   {
    //     headers: {
    //       'User-Agent': `SpotifyPlaylistAnalyzer/1.0.0 (${email})`,
    //     },
    //   }
    // );
    // const data = await response.json();
    // const artist = data.artists?.[0] || null;
    artistCache[name] = artist;
    return artist;
  } catch (error) {
    console.error('Error fetching artist info:', error);
    return null;
  }
}
