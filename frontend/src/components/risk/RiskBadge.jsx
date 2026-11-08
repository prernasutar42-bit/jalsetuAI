import React from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle, ShieldAlert } from 'lucide-react';
import { RISK_LEVELS, getRiskLevelFromProbability } from '../../lib/riskUtils';
import { formatPercent } from '../../lib/formatters';

const ICONS = {
  low: ShieldCheck,
  moderate: AlertTriangle,
  high: AlertCircle,
  severe: ShieldAlert,
};

export function RiskBadge({
  level,
  probability,
  size = 'md', // 'sm' | 'md' | 'lg' | 'hero'
  showProbability = true,
  className = '',
}) {
  const currentLevelKey = level || (probability !== undefined ? getRiskLevelFromProbability(probability) : 'low');
  const meta = RISK_LEVELS[currentLevelKey] || RISK_LEVELS.low;
  const Icon = ICONS[currentLevelKey] || ShieldCheck;

  if (size === 'hero') {
    return (
      <div
        className={`p-5 rounded-card border transition-all ${className}`}
        style={{
          backgroundColor: meta.bgLight,
          borderColor: meta.borderColor,
          color: meta.textColor,
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: meta.color, color: '#FFFFFF' }}
            >
              <Icon size={24} strokeWidth={2.2} aria-hidden="true" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider block opacity-90">
                Flood Warning Level
              </span>
              <span className="text-2xl font-bold tracking-tight block">
                {meta.label} Risk
              </span>
            </div>
          </div>
          {showProbability && probability !== undefined && (
            <div className="text-right">
              <span className="text-xs font-semibold uppercase tracking-wider block opacity-90">
                AI Probability
              </span>
              <span className="font-mono text-3xl font-bold tracking-tight">
                {formatPercent(probability)}
              </span>
            </div>
          )}
        </div>
        <p className="mt-3 text-xs leading-relaxed font-medium pt-3 border-t border-black/10">
          {meta.description}
        </p>
      </div>
    );
  }

  const sizes = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
    lg: 'text-sm px-3.5 py-1.5 gap-2.5',
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 20,
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-btn border ${sizes[size] || sizes.md} ${className}`}
      style={{
        backgroundColor: meta.bgLight,
        borderColor: meta.borderColor,
        color: meta.textColor,
      }}
    >
      <Icon size={iconSizes[size] || 18} strokeWidth={2} aria-hidden="true" />
      <span>{meta.label} Risk</span>
      {showProbability && probability !== undefined && (
        <span className="font-mono ml-1 font-bold">
          ({formatPercent(probability)})
        </span>
      )}
    </span>
  );
}
