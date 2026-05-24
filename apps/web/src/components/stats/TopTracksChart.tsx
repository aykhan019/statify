'use client';

import type { TopTrackEntry } from '@statify/shared';
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import {
  CHART_AXIS_FILL,
  CHART_BAR_FILL,
  CHART_GRID_STROKE,
  CHART_TOOLTIP_STYLE,
  ChartContainer,
} from './ChartContainer';

interface TopTracksChartProps {
  entries: TopTrackEntry[];
}

interface TopTrackDatum {
  trackName: string;
  artistName: string;
  listenCount: number;
  totalMinutes: number;
  rank: number;
}

export function TopTracksChart({ entries }: TopTracksChartProps) {
  const data: TopTrackDatum[] = entries.map((entry) => ({
    trackName: entry.trackName,
    artistName: entry.primaryArtistName,
    listenCount: entry.listenCount,
    totalMinutes: entry.totalMinutes,
    rank: entry.rank,
  }));

  const chartHeight = Math.max(240, data.length * 36 + 60);

  return (
    <ChartContainer height={chartHeight} ariaLabel="Top tracks by play count">
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
        <CartesianGrid horizontal={false} stroke={CHART_GRID_STROKE} />
        <XAxis
          type="number"
          allowDecimals={false}
          stroke={CHART_AXIS_FILL}
          tick={{ fill: CHART_AXIS_FILL, fontSize: 12 }}
        />
        <YAxis
          dataKey="trackName"
          type="category"
          width={160}
          stroke={CHART_AXIS_FILL}
          tick={{ fill: CHART_AXIS_FILL, fontSize: 12 }}
        />
        <Tooltip
          cursor={{ fill: 'var(--color-section-row-hover)' }}
          contentStyle={CHART_TOOLTIP_STYLE}
          formatter={(value, _name, item) => {
            const datum = item.payload as TopTrackDatum;
            return [`${value} plays`, `${datum.artistName} (rank ${datum.rank})`];
          }}
        />
        <Bar dataKey="listenCount" fill={CHART_BAR_FILL} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
