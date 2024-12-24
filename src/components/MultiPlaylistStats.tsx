import { useEffect, useState } from 'react';
import { AnalysisResults } from './AnalysisResults';
import type { ArtistAnalysis } from '../types/spotify';

export function MultiPlaylistStats() {
  const [analysis, setAnalysis] = useState<ArtistAnalysis | null>(null);
  const [playlistStats, setPlaylistStats] = useState<{ name: string, analysis: ArtistAnalysis }[]>([]);

  useEffect(() => {
    const aggregateAnalysis: ArtistAnalysis = {
      gender: {},
      languages: {},
      releaseYears: {},
      topArtists: [],
      ages: {},
      countries: {},
    };

    const keys = Object.keys(localStorage).filter(key => key.startsWith('playlist_'));
    const stats = keys.map(key => {
      const cachedAnalysis = JSON.parse(localStorage.getItem(key) || '{}') as ArtistAnalysis & { name: string };
      const playlistName = key.replace('playlist_', '');
      return { name: cachedAnalysis.name || playlistName, analysis: cachedAnalysis };
    });

    stats.forEach(({ analysis: cachedAnalysis }) => {
      Object.entries(cachedAnalysis.gender).forEach(([key, value]) => {
        aggregateAnalysis.gender[key] = (aggregateAnalysis.gender[key] || 0) + value;
      });
      Object.entries(cachedAnalysis.languages).forEach(([key, value]) => {
        aggregateAnalysis.languages[key] = (aggregateAnalysis.languages[key] || 0) + value;
      });
      Object.entries(cachedAnalysis.releaseYears).forEach(([key, value]) => {
        aggregateAnalysis.releaseYears[key] = (aggregateAnalysis.releaseYears[key] || 0) + value;
      });
      Object.entries(cachedAnalysis.ages).forEach(([key, value]) => {
        aggregateAnalysis.ages[key] = (aggregateAnalysis.ages[key] || 0) + value;
      });
      Object.entries(cachedAnalysis.countries).forEach(([key, value]) => {
        aggregateAnalysis.countries[key] = (aggregateAnalysis.countries[key] || 0) + value;
      });
    });

    setAnalysis(aggregateAnalysis);
    setPlaylistStats(stats);
  }, []);

  if (!analysis) {
    return <div>Loading...</div>;
  }

  const calculatePercentages = (data: Record<string, number>, key?: string) => {
    const total = Object.values(data).reduce((sum, value) => sum + value, 0);
    if (key) {
      return [{ key, percentage: ((data[key] / total) * 100).toFixed(2) }];
    }
    return Object.entries(data).map(([key, value]) => ({
      key,
      percentage: ((value / total) * 100).toFixed(2),
    }));
  };

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-2xl font-semibold mb-4">Aggregated Playlist Analysis</h2>
      <AnalysisResults analysis={analysis} />
      <h3 className="text-xl font-semibold mb-4">Playlist Percentages</h3>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Playlist</th>
            <th className="py-2 px-4 border-b">Male</th>
            <th className="py-2 px-4 border-b">Female</th>
            <th className="py-2 px-4 border-b">German</th>
            <th className="py-2 px-4 border-b">English</th>
            <th className="py-2 px-4 border-b">Latest Release Year</th>
            <th className="py-2 px-4 border-b">Average Age</th>
          </tr>
        </thead>
        <tbody>
          {playlistStats.map(({ name, analysis }) => (
            <tr key={name}>
              <td className="py-2 px-4 border-b">{name}</td>
              <td className="py-2 px-4 border-b">
                <div>{calculatePercentages(analysis.gender, 'male')[0].percentage}%</div>
              </td>
              <td className="py-2 px-4 border-b">
                <div>{calculatePercentages(analysis.gender, 'female')[0].percentage}%</div>
              </td>
              <td className="py-2 px-4 border-b">
                <div>{calculatePercentages(analysis.languages, 'German')[0].percentage}%</div>
              </td>
              <td className="py-2 px-4 border-b">
                <div>{calculatePercentages(analysis.languages, 'English')[0].percentage}%</div>
              </td>
              <td className="py-2 px-4 border-b">
                <div>{Object.keys(analysis.releaseYears)[Object.keys(analysis.releaseYears).length - 1]}</div>

              </td>
              <td className="py-2 px-4 border-b">
                <div>
                  {Math.round(Object.entries(analysis.ages).reduce((sum, [age, count]) => sum + Number(age) * count, 0) /
                    Object.values(analysis.ages).reduce((sum, count) => sum + count, 0))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}