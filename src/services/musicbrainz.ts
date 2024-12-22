import { IBrowseArtistsResult, MusicBrainzApi } from 'musicbrainz-api';

const mbApi = new MusicBrainzApi({
    appName: 'SpotifyPlaylistAnalyzer',
    appVersion: '0.1.0',
    appContactInfo: 'dennismuensterer@mail.com',
});

const artistCache: { [name: string]: any } = {};

export async function getArtistInfo(name: string) {
  if (artistCache[name]) {
    console.log('Returning cached artist info for:', name, artistCache[name]);
    return artistCache[name];
  }

  try {
    const response = await mbApi.restGet('/artist/', { query: name}) as IBrowseArtistsResult;
    const artist = response.artists[0] || null;
    artistCache[name] = artist;
    return artist;
  } catch (error) {
    console.error('Error fetching artist info:', error);
    return null;
  }
}
