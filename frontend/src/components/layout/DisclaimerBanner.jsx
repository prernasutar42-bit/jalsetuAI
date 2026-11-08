import React from 'react';
import { Info } from 'lucide-react';
import { strings } from '../../lib/strings';

export function DisclaimerBanner({ className = '' }) {
  return (
    <div
      role="note"
      className={`bg-[#EBF5F6] border-y sm:border sm:rounded-btn border-accent/20 px-3.5 py-2 text-xs text-ink-700 flex items-center gap-2 ${className}`}
    >
      <Info size={15} className="text-accent shrink-0" aria-hidden="true" />
      <span className="leading-tight font-medium">{strings.disclaimer}</span>
    </div>
  );
}
