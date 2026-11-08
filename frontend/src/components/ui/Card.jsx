import React from 'react';

export function Card({ children, className = '', as = 'div', ...props }) {
  const Component = as;
  return (
    <Component
      className={`bg-white border border-line rounded-card overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`px-4 py-3.5 border-b border-line flex items-center justify-between gap-3 ${className}`}>
      <div>
        <h2 className="text-sm font-semibold text-ink-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-ink-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
