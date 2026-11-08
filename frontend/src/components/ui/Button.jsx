import React from 'react';

export function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center font-medium rounded-btn transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]';

  const variants = {
    primary:
      'bg-accent hover:bg-accent-hover text-white focus-visible:ring-accent border border-transparent shadow-none',
    secondary:
      'bg-canvas hover:bg-line text-ink-900 border border-line focus-visible:ring-ink-500',
    outline:
      'bg-white hover:bg-canvas text-ink-700 border border-line focus-visible:ring-accent',
    danger:
      'bg-risk-severe hover:bg-[#961717] text-white focus-visible:ring-risk-severe border border-transparent',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
