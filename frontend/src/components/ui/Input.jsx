import React from 'react';

export function Input({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  error = '',
  hint = '',
  disabled = false,
  required = false,
  className = '',
  rightElement = null,
  ...props
}) {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-ink-700 mb-1.5"
        >
          {label} {required && <span className="text-risk-severe" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={`w-full min-h-[44px] px-3.5 py-2 text-sm bg-white border rounded-input text-ink-900 placeholder:text-ink-500 transition-colors focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent disabled:bg-canvas disabled:text-ink-500 ${
            error ? 'border-risk-severe focus:ring-risk-severe focus:border-risk-severe' : 'border-line'
          } ${rightElement ? 'pr-11' : ''}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-2 flex items-center justify-center min-w-[36px] min-h-[36px]">
            {rightElement}
          </div>
        )}
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="mt-1 text-xs text-risk-severe font-medium" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1 text-xs text-ink-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
