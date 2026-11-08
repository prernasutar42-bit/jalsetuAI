import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';
import { strings } from '../../lib/strings';

export function ErrorState({
  title = strings.common.errorTitle,
  message = strings.common.errorDesc,
  onRetry,
  className = '',
}) {
  return (
    <div
      role="alert"
      className={`bg-white border border-risk-severe/30 rounded-card p-6 text-center flex flex-col items-center justify-center ${className}`}
    >
      <div className="w-11 h-11 rounded-full bg-[#FFEBEE] text-risk-severe flex items-center justify-center mb-3">
        <AlertCircle size={22} strokeWidth={2} aria-hidden="true" />
      </div>
      <h3 className="text-sm font-semibold text-ink-900 mb-1">{title}</h3>
      <p className="text-xs text-ink-700 max-w-md mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
          <RotateCcw size={16} aria-hidden="true" />
          <span>{strings.common.retry}</span>
        </Button>
      )}
    </div>
  );
}
