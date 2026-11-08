import React from 'react';
import { Clock, Radio, MapPin } from 'lucide-react';
import { RiskBadge } from '../risk/RiskBadge';
import { formatTimeAgo } from '../../lib/formatters';

export function AlertCard({ alert, className = '' }) {
  if (!alert) return null;

  return (
    <article
      aria-label={`Flood alert for ${alert.district_name}`}
      className={`bg-white border border-line rounded-card p-4 transition-colors hover:border-ink-500/30 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <RiskBadge level={alert.level} size="sm" showProbability={false} />
          <span className="flex items-center gap-1 text-xs font-bold text-ink-900">
            <MapPin size={13} className="text-accent" aria-hidden="true" />
            {alert.district_name}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-ink-500 font-mono">
          <Clock size={13} aria-hidden="true" />
          <time dateTime={alert.timestamp}>
            {alert.time || formatTimeAgo(alert.timestamp)}
          </time>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-ink-900 leading-relaxed font-normal">
        {alert.message}
      </p>

      {alert.source && (
        <div className="mt-3 pt-2.5 border-t border-line flex items-center justify-between text-[11px] text-ink-500">
          <span className="flex items-center gap-1">
            <Radio size={12} className="text-accent" aria-hidden="true" />
            {alert.source}
          </span>
          <span className="font-mono text-[10px] text-ink-500 uppercase">
            Official Bulletin
          </span>
        </div>
      )}
    </article>
  );
}
