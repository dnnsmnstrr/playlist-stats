import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import type { ArtistAnalysis } from '../types/spotify';
import { PieSectorDataItem } from 'recharts/types/polar/Pie';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface AnalysisResultsProps {
  analysis: ArtistAnalysis;
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent }: PieSectorDataItem) => {
  if (!percent || percent < 0.05) {
    return null;
  }
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};
export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  console.log(analysis)
  const genderData = Object.entries(analysis.gender).map(([name, value]) => ({
    name,
    value,
  }));

  const languageData = Object.entries(analysis.languages).map(([name, value]) => ({
    name,
    value,
  }));

  const yearData = Object.entries(analysis.releaseYears)
    .map(([name, value]) => ({
      name,
      value,
    }))
    .sort((a, b) => Number(a.name) - Number(b.name));

  const ageData = Object.entries(analysis.ages).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="p-6 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Gender Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genderData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={renderCustomizedLabel}
                
                labelLine={false}
                isAnimationActive={false}
              >
                {genderData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Languages</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={languageData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={renderCustomizedLabel}
                labelLine={false}
                isAnimationActive={false}
              >
                {languageData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Release Years</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart width={600} height={300} data={yearData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Age Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart width={600} height={300} data={ageData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Top 5 Artists</h3>
        <ul className="space-y-2">
          {analysis.topArtists.map((artist, index) => (
            <li
              key={artist.name}
              className="flex justify-between items-center p-2 bg-gray-50 rounded"
            >
              <span className="font-medium">{artist.name}</span>
              <span className="text-gray-600">
                {artist.count} track{artist.count > 1 ? 's' : ''}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}