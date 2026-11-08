import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import { RISK_LEVELS, getRiskLevelFromProbability } from '../../lib/riskUtils';
import { formatPercent } from '../../lib/formatters';

export function ForecastChart({ forecast = [] }) {
  if (!forecast || forecast.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-xs text-ink-500">
        No forecast outlook data available.
      </div>
    );
  }

  // Format data for Recharts
  const chartData = forecast.map((f) => ({
    name: f.hours,
    timeLabel: f.timeLabel,
    probabilityPct: Math.round(f.probability * 100),
    level: f.level,
    rainfall_mm: f.expectedRainfall_mm,
    color: RISK_LEVELS[f.level]?.color || '#0E7C86',
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-line rounded-card p-2.5 shadow-float text-xs font-sans">
          <p className="font-semibold text-ink-900 mb-1">{data.timeLabel} Forecast</p>
          <div className="space-y-0.5">
            <p className="flex items-center justify-between gap-3 text-ink-700">
              <span>Risk Probability:</span>
              <span className="font-mono font-bold" style={{ color: data.color }}>
                {data.probabilityPct}% ({data.level})
              </span>
            </p>
            {data.rainfall_mm !== undefined && (
              <p className="flex items-center justify-between gap-3 text-ink-500">
                <span>Expected Rain:</span>
                <span className="font-mono font-semibold">{data.rainfall_mm} mm</span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-56 pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBF0F5" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#33425A', fontSize: 12, fontFamily: 'IBM Plex Sans' }}
            axisLine={{ stroke: '#DDE3EA' }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(val) => `${val}%`}
            tick={{ fill: '#6B7A90', fontSize: 11, fontFamily: 'IBM Plex Mono' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="probabilityPct"
            radius={[4, 4, 0, 0]}
            maxBarSize={48}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-4 text-xs text-ink-500 pt-1">
        <span>24h, 48h, and 72h forecasted flood probability</span>
      </div>
    </div>
  );
}
