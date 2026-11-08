import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

export function EmptyState({
  title = 'No records found',
  description = 'No telemetry or records match the current filter criteria.',
  actionLabel,
  onAction,
  icon: Icon = Inbox,
  className = '',
}) {
  return (
    <div
      className={`bg-white border border-line rounded-card p-8 text-center flex flex-col items-center justify-center ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-canvas border border-line flex items-center justify-center text-ink-500 mb-3">
        <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
      </div>
      <h3 className="text-sm font-semibold text-ink-900 mb-1">{title}</h3>
      <p className="text-xs text-ink-500 max-w-sm mb-4 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
