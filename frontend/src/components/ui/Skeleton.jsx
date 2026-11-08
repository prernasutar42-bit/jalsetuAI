import React from 'react';

export function Skeleton({ className = '', variant = 'rect' }) {
  const variants = {
    rect: 'rounded',
    circle: 'rounded-full',
    text: 'rounded h-4',
  };

  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-[#E9EEF4] ${variants[variant] || variants.rect} ${className}`}
    />
  );
}

export function DistrictCardSkeleton() {
  return (
    <div className="bg-white border border-line rounded-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="w-32 h-6" />
        <Skeleton className="w-24 h-7 rounded-btn" />
      </div>
      <Skeleton className="w-full h-16" />
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="bg-white border border-line rounded-card p-4 space-y-3">
      <Skeleton className="w-48 h-5 mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-2 border-b border-line last:border-0">
          <Skeleton className="w-36 h-4" />
          <Skeleton className="w-20 h-4" />
          <Skeleton className="w-28 h-6 rounded-btn" />
        </div>
      ))}
    </div>
  );
}
