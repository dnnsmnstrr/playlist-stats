import { MusicBrainzApi } from 'musicbrainz-api';

const mbApi = new MusicBrainzApi({
    appName: 'SpotifyPlaylistAnalyzer',
    appVersion: '0.1.0',
    appContactInfo: 'dennismuensterer@mail.com',
});

type ArtistInfo = {
  id: string
  name: string
  area: { name: string }
  gender?: 'male' | 'female' | 'non-binary' | 'unknown'
  country?: string
  disambiguation?: string
  'begin-area'?: { name: string, type: 'Country' | 'City' }
  'life-span'?: { begin: string, ended?: string }
  tags?: { count: number, name: string }[]
}
type ArtistCache = { [name: string]: ArtistInfo }
const artistCache: ArtistCache = {};

export async function saveCache() {
  console.log('Saving artist cache...');
  const simplifiedCache = Object.entries(artistCache).reduce<ArtistCache>((acc, [name, artist]) => {
    acc[name] = {
      id: artist?.id,
      name: artist?.name,
      gender: artist?.gender,
      disambiguation: artist?.disambiguation,
      country: artist?.country,
      area: artist?.area,
      'begin-area': artist?.['begin-area'],
      'life-span': artist?.['life-span'],
      tags: artist?.tags,
    };
    return acc;
  }, {});
  localStorage.setItem('artistCache', JSON.stringify(simplifiedCache));
}

export async function loadCache() {
  console.log('Loading artist cache...');
  const cache = localStorage.getItem('artistCache');
  if (cache) {
    Object.assign(artistCache, JSON.parse(cache));
  }
}

export async function getArtistInfo(name: string) {
  if (artistCache[name]) {
    console.log('Returning cached artist info for:', name, artistCache[name]);
    return artistCache[name];
  }

  try {
    const response = await mbApi.restGet('/artist/', { query: name}) as { artists: ArtistInfo[] };
    const artist = response.artists[0] || null;
    artistCache[name] = artist;
    return artist;
  } catch (error) {
    console.error('Error fetching artist info:', error);
    return null;
  }
}
