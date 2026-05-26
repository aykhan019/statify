'use client';

import type { TopTrackEntry } from '@statify/shared';
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
import { formatTrackName } from '@/components/catalog';

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
    trackName: formatTrackName(entry.trackName),
    artistName: entry.primaryArtistName,
    listenCount: entry.listenCount,
    totalMinutes: entry.totalMinutes,
    rank: entry.rank,
  }));

  const chartHeight = Math.max(240, data.length * 36 + 60);

  return (
    <ChartContainer height={chartHeight} ariaLabel="Top tracks by play count">
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
        <CartesianGrid horizontal={false} stroke={chartGridColor} />
        <XAxis type="number" allowDecimals={false} stroke={chartAxisColor} tick={chartAxisTick} />
        <YAxis
          dataKey="trackName"
          type="category"
          width={160}
          stroke={chartAxisColor}
          tick={chartAxisTick}
        />
        <Tooltip
          cursor={chartTooltipCursor}
          contentStyle={chartTooltipStyle}
          formatter={(value, _name, item) => {
            const datum = item.payload as TopTrackDatum;
            return [`${value} plays`, `${datum.artistName} (rank ${datum.rank})`];
          }}
        />
        <Bar dataKey="listenCount" fill={getChartSeriesColor(0)} radius={chartBarRadius} />
      </BarChart>
    </ChartContainer>
  );
}
