import { useEffect, useState } from 'react';
import { AnalysisResults } from './AnalysisResults';
import type { ArtistAnalysis } from '../types/spotify';

export function MultiPlaylistStats() {
  const [totalAnalysis, setAnalysis] = useState<ArtistAnalysis | null>(null);
  const [playlistStats, setPlaylistStats] = useState<{ name: string, id: String, analysis: ArtistAnalysis }[]>([]);

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
      return { name: cachedAnalysis.name || playlistName, analysis: cachedAnalysis, id: playlistName };
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

    // Sort stats by the latest release year
    stats.sort((a, b) => {
      const latestYearA = Math.max(...Object.keys(a.analysis.releaseYears).map(Number));
      const latestYearB = Math.max(...Object.keys(b.analysis.releaseYears).map(Number));
      return latestYearB - latestYearA;
    });

    setAnalysis(aggregateAnalysis);
    setPlaylistStats(stats);
  }, []);

  if (!totalAnalysis) {
    return <div>Loading...</div>;
  }

  const calculatePercentages = (data: Record<string, number>, key: string) => {
    const total = Object.values(data).reduce((sum, value) => sum + value, 0);
    const value = data[key] || 0;
    return ((value / total) * 100);
  };

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-2xl font-semibold mb-4">Aggregated Playlist Analysis</h2>
      <AnalysisResults analysis={totalAnalysis} />
      <h3 className="text-xl font-semibold mb-4">Playlist Percentages</h3>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Playlist</th>
            <th className="py-2 px-4 border-b">Male</th>
            <th className="py-2 px-4 border-b">Female</th>
            <th className="py-2 px-4 border-b">Male/Female</th>
            <th className="py-2 px-4 border-b">German</th>
            <th className="py-2 px-4 border-b">English</th>
            <th className="py-2 px-4 border-b">German/English</th>
            <th className="py-2 px-4 border-b">Latest Release Year</th>
            <th className="py-2 px-4 border-b">Average Age</th>
            <th className="py-2 px-4 border-b" />
          </tr>
        </thead>
        <tbody>
          {playlistStats.map(({ name, analysis, id }) => {
            const releaseYears = Object.keys(analysis.releaseYears);
            const latestReleaseYear = Math.max(...releaseYears.map(Number));
            const averageAge = Math.round(
              Object.entries(analysis.ages).reduce((sum, [age, count]) => sum + Number(age) * count, 0) /
              Object.values(analysis.ages).reduce((sum, count) => sum + count, 0)
            );
            const malePercentage = calculatePercentages(analysis.gender, 'male');
            const femalePercentage = calculatePercentages(analysis.gender, 'female');
            const germanPercentage = calculatePercentages(analysis.languages, 'German');
            const englishPercentage = calculatePercentages(analysis.languages, 'English');
            return (
              <tr key={name}>
                <td className="py-2 px-4 border-b">{name}</td>
                <td className="py-2 px-4 border-b">
                  <div>{malePercentage.toFixed(2)}%</div>
                </td>
                <td className="py-2 px-4 border-b">
                  <div>{femalePercentage.toFixed(2)}%</div>
                </td>
                <td className="py-2 px-4 border-b">
                  <div>{(malePercentage/femalePercentage).toFixed(2)}</div>
                </td>
                <td className="py-2 px-4 border-b">
                  <div>{germanPercentage.toFixed(2)}%</div>
                </td>
                <td className="py-2 px-4 border-b">
                  <div>{englishPercentage.toFixed(2)}%</div>
                </td>
                <td className="py-2 px-4 border-b">
                  <div>{(germanPercentage/englishPercentage).toFixed(2)}</div>
                </td>
                <td className="py-2 px-4 border-b">
                  <div>{latestReleaseYear}</div>
                </td>
                <td className="py-2 px-4 border-b">
                  <div>
                    {averageAge}
                  </div>
                </td>
                <td className="py-2 px-4 border-b">
                  <button className="text-red-500" onClick={
                    () => {
                        if (window.confirm(`Are you sure you want to delete the playlist "${name}"?`)) {
                          localStorage.removeItem(`playlist_${id}`);
                          window.location.reload();
                        }
                    }
                  }>X</button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  );
}