'use client';

import { forwardRef, useId, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { useFieldContext } from './Field';
import { deriveFieldProps } from './_helpers';

export interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  invalid?: boolean;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  {
    checked,
    onCheckedChange,
    label,
    description,
    invalid,
    id,
    disabled = false,
    className,
    'aria-invalid': ariaInvalidProp,
    'aria-describedby': ariaDescribedByProp,
    'aria-label': ariaLabelProp,
    ...rest
  },
  ref,
) {
  const localId = useId();
  const ctx = useFieldContext();
  const fallbackId = id ?? ctx?.id ?? `switch-${localId}`;
  const descriptionId = description !== undefined ? `${fallbackId}-description` : undefined;
  const derived = deriveFieldProps({
    explicitId: fallbackId,
    explicitInvalid: invalid,
    explicitAriaInvalid: ariaInvalidProp,
    explicitDescribedBy: ariaDescribedByProp,
    context: ctx,
    ownDescriptionId: descriptionId,
  });
  const ariaLabel = ariaLabelProp ?? labelToString(label);

  return (
    <div className={cn('flex items-start gap-3', disabled && 'cursor-not-allowed', className)}>
      <button
        ref={ref}
        type="button"
        role="switch"
        id={derived.id}
        disabled={disabled}
        aria-checked={checked}
        aria-invalid={derived.ariaInvalid}
        aria-describedby={derived.describedBy}
        aria-label={ariaLabel}
        onClick={() => {
          if (!disabled) onCheckedChange(!checked);
        }}
        className={switchTrackClasses(checked, derived.invalid)}
        {...rest}
      >
        <span aria-hidden="true" className={switchThumbClasses(checked)} />
      </button>
      <SwitchLabel
        htmlFor={derived.id}
        descriptionId={descriptionId}
        label={label}
        description={description}
        disabled={disabled}
      />
    </div>
  );
});

function labelToString(label: ReactNode): string | undefined {
  return typeof label === 'string' ? label : undefined;
}

function switchTrackClasses(checked: boolean, invalid: boolean): string {
  return cn(
    'relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full border',
    'transition-colors duration-[var(--duration-fast)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page',
    'disabled:cursor-not-allowed disabled:opacity-60',
    checked ? 'bg-section-accent border-section-accent' : 'bg-surface-sunken border-border-strong',
    invalid && 'border-state-error-border',
  );
}

function switchThumbClasses(checked: boolean): string {
  return cn(
    'inline-block size-4 transform rounded-full bg-surface-work shadow-(--shadow-xs)',
    'transition-transform duration-[var(--duration-fast)]',
    checked ? 'translate-x-5' : 'translate-x-1',
  );
}

function SwitchLabel({
  htmlFor,
  descriptionId,
  label,
  description,
  disabled,
}: {
  htmlFor: string | undefined;
  descriptionId: string | undefined;
  label: ReactNode;
  description: ReactNode;
  disabled: boolean;
}) {
  if (label === undefined && description === undefined) return null;
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-0.5 leading-snug">
      {label !== undefined && (
        <span className={cn('text-sm font-medium', disabled ? 'text-fg-faint' : 'text-fg-default')}>
          {label}
        </span>
      )}
      {description !== undefined && (
        <span id={descriptionId} className="text-xs text-fg-muted">
          {description}
        </span>
      )}
    </label>
  );
}
