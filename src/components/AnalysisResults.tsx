import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { ArtistAnalysis } from '../types/spotify';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface AnalysisResultsProps {
  analysis: ArtistAnalysis;
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
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

  return (
    <div className="p-6 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Gender Distribution</h3>
          <PieChart width={300} height={300}>
            <Pie
              data={genderData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
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
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Languages</h3>
          <PieChart width={300} height={300}>
            <Pie
              data={languageData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
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
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Release Years</h3>
        <BarChart width={600} height={300} data={yearData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
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