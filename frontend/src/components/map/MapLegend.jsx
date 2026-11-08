import React from 'react';
import { RISK_LEVELS } from '../../lib/riskUtils';
import { strings } from '../../lib/strings';

export function MapLegend({ className = '' }) {
  const levels = [
    { key: 'low', label: strings.map.legendLow, ...RISK_LEVELS.low },
    { key: 'moderate', label: strings.map.legendMod, ...RISK_LEVELS.moderate },
    { key: 'high', label: strings.map.legendHigh, ...RISK_LEVELS.high },
    { key: 'severe', label: strings.map.legendSev, ...RISK_LEVELS.severe },
  ];

  return (
    <div
      className={`bg-white/95 backdrop-blur-sm border border-line rounded-card p-3 shadow-float text-xs ${className}`}
    >
      <span className="font-semibold text-ink-900 block mb-2">
        {strings.map.legendTitle}
      </span>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 sm:flex sm:flex-col sm:gap-1.5">
        {levels.map((lvl) => (
          <div key={lvl.key} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full shrink-0 border border-black/20"
              style={{ backgroundColor: lvl.color }}
              aria-hidden="true"
            />
            <span className="text-ink-700 text-[11px] font-medium leading-none">
              {lvl.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
