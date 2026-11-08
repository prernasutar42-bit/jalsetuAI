import React from 'react';

export function Select({
  id,
  label,
  value,
  onChange,
  options = [],
  error = '',
  hint = '',
  disabled = false,
  required = false,
  className = '',
  ...props
}) {
  const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold uppercase tracking-wider text-ink-700 mb-1.5"
        >
          {label} {required && <span className="text-risk-severe" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
          className={`w-full min-h-[44px] px-3.5 py-2 pr-10 text-sm bg-white border rounded-input text-ink-900 transition-colors appearance-none focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent disabled:bg-canvas disabled:text-ink-500 ${
            error ? 'border-risk-severe focus:ring-risk-severe focus:border-risk-severe' : 'border-line'
          }`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-ink-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error ? (
        <p id={`${selectId}-error`} className="mt-1 text-xs text-risk-severe font-medium" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${selectId}-hint`} className="mt-1 text-xs text-ink-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
