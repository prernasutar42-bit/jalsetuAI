import React from 'react';
import { strings } from '../../lib/strings';

export function FactorList({ factors = [] }) {
  if (!factors || factors.length === 0) {
    return (
      <p className="text-xs text-ink-500 py-3">No contributing factors available for this location.</p>
    );
  }

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'severe':
      case 'critical':
        return 'bg-risk-severe text-risk-severe';
      case 'high':
        return 'bg-risk-high text-risk-high';
      case 'moderate':
        return 'bg-risk-moderate text-risk-moderate';
      case 'low':
      default:
        return 'bg-risk-low text-risk-low';
    }
  };

  return (
    <div className="space-y-4">
      {factors.map((factor, index) => {
        const barColor = getImpactColor(factor.impact).split(' ')[0];
        const textColor = getImpactColor(factor.impact).split(' ')[1];
        const percent = factor.weightPercent || Math.max(20, 100 - index * 30);

        return (
          <div key={index} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-ink-900">{factor.feature}</span>
              <span className={`font-mono text-xs font-semibold uppercase ${textColor}`}>
                {factor.impact} impact ({percent}%)
              </span>
            </div>
            {/* Factor impact bar */}
            <div
              className="w-full bg-[#E9EEF4] h-2 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label={`${factor.feature} contribution bar`}
            >
              <div
                className={`h-full ${barColor} transition-all duration-300 rounded-full`}
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="text-xs text-ink-700 leading-relaxed pt-0.5">{factor.text}</p>
          </div>
        );
      })}
    </div>
  );
}
