import { SpotifyApi } from '@spotify/web-api-ts-sdk';

const CLIENT_ID = 'cf947528ed45464e99b08b7ddb1937d3';
const REDIRECT_URI = 'https://playlist-stats-spotify.vercel.app';
const SCOPES = ['playlist-read-private', 'playlist-read-collaborative'];

export const spotify = SpotifyApi.withUserAuthorization(
  CLIENT_ID,
  REDIRECT_URI,
  SCOPES
);