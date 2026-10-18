import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from './cx';

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: ReactNode;
  error?: ReactNode;
  labelAside?: ReactNode;
}

export function TextField({
  label,
  hint,
  error,
  labelAside,
  id,
  className,
  ...rest
}: TextFieldProps) {
  const generated = useId();
  const fieldId = id ?? generated;
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label htmlFor={fieldId} className="text-label font-medium text-fg">
          {label}
        </label>
        {labelAside}
      </div>
      <input
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cx(
          'h-[42px] rounded-lg border bg-surface px-3 text-input text-fg',
          'disabled:bg-sunken disabled:text-fg-muted',
          error ? 'border-error' : 'border-line-input',
          className,
        )}
        {...rest}
      />
      {error ? (
        <p id={`${fieldId}-error`} className="text-helper text-error">
          {error}
        </p>
      ) : hint ? (
        <p id={`${fieldId}-hint`} className="text-helper text-fg-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
