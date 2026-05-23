'use client';

import type { TrendingArtistEntry } from '@statify/shared';
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import {
  CHART_AXIS_FILL,
  CHART_BAR_FILL,
  CHART_GRID_STROKE,
  CHART_TOOLTIP_STYLE,
  ChartContainer,
} from './ChartContainer';

interface TrendingArtistsChartProps {
  entries: TrendingArtistEntry[];
}

interface TrendingDatum {
  artistName: string;
  recentPlays: number;
  priorPlays: number;
  growth: number;
}

export function TrendingArtistsChart({ entries }: TrendingArtistsChartProps) {
  const data: TrendingDatum[] = entries.map((entry) => ({
    artistName: entry.artistName,
    recentPlays: entry.recentPlays,
    priorPlays: entry.priorPlays,
    growth: entry.growth,
  }));

  const chartHeight = Math.max(240, data.length * 40 + 60);

  return (
    <ChartContainer height={chartHeight} ariaLabel="Trending artists in the last 7 days">
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
            const datum = item.payload as TrendingDatum;
            const growthLabel =
              datum.priorPlays === 0
                ? 'new this week'
                : `${Math.round(datum.growth * 100)}% vs prior 7d`;
            return [`${value} plays`, growthLabel];
          }}
        />
        <Bar dataKey="recentPlays" fill={CHART_BAR_FILL} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
