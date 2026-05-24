'use client';

import type { TopArtistEntry } from '@statify/shared';
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  chartAxisColor,
  chartAxisTick,
  chartBarRadius,
  chartGridColor,
  chartTooltipCursor,
  chartTooltipStyle,
  getChartSeriesColor,
} from '@/components/charts';

interface TopArtistsChartProps {
  entries: TopArtistEntry[];
}

interface TopArtistDatum {
  artistName: string;
  listenCount: number;
  totalMinutes: number;
  rank: number;
}

export function TopArtistsChart({ entries }: TopArtistsChartProps) {
  const data: TopArtistDatum[] = entries.map((entry) => ({
    artistName: entry.artistName,
    listenCount: entry.listenCount,
    totalMinutes: entry.totalMinutes,
    rank: entry.rank,
  }));

  const chartHeight = Math.max(240, data.length * 36 + 60);

  return (
    <ChartContainer height={chartHeight} ariaLabel="Top artists by play count">
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
        <CartesianGrid horizontal={false} stroke={chartGridColor} />
        <XAxis type="number" allowDecimals={false} stroke={chartAxisColor} tick={chartAxisTick} />
        <YAxis
          dataKey="artistName"
          type="category"
          width={140}
          stroke={chartAxisColor}
          tick={chartAxisTick}
        />
        <Tooltip
          cursor={chartTooltipCursor}
          contentStyle={chartTooltipStyle}
          formatter={(value, _name, item) => {
            const datum = item.payload as TopArtistDatum;
            return [`${value} plays`, `Rank ${datum.rank}`];
          }}
        />
        <Bar dataKey="listenCount" fill={getChartSeriesColor(0)} radius={chartBarRadius} />
      </BarChart>
    </ChartContainer>
  );
}
