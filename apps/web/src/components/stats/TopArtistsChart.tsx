'use client';

import type { TopArtistEntry } from '@statify/shared';
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import {
  CHART_AXIS_FILL,
  CHART_BAR_FILL,
  CHART_GRID_STROKE,
  CHART_TOOLTIP_STYLE,
  ChartContainer,
} from './ChartContainer';

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
        <CartesianGrid horizontal={false} stroke={CHART_GRID_STROKE} />
        <XAxis
          type="number"
          allowDecimals={false}
          stroke={CHART_AXIS_FILL}
          tick={{ fill: CHART_AXIS_FILL, fontSize: 12 }}
        />
        <YAxis
          dataKey="artistName"
          type="category"
          width={140}
          stroke={CHART_AXIS_FILL}
          tick={{ fill: CHART_AXIS_FILL, fontSize: 12 }}
        />
        <Tooltip
          cursor={{ fill: 'var(--color-muted)' }}
          contentStyle={CHART_TOOLTIP_STYLE}
          formatter={(value, _name, item) => {
            const datum = item.payload as TopArtistDatum;
            return [`${value} plays`, `Rank ${datum.rank}`];
          }}
        />
        <Bar dataKey="listenCount" fill={CHART_BAR_FILL} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
