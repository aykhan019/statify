'use client';

import { Check } from 'lucide-react';
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { useFieldContext } from './Field';
import { deriveFieldProps } from './_helpers';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  description?: ReactNode;
  invalid?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    className,
    label,
    description,
    invalid,
    id,
    disabled = false,
    'aria-invalid': ariaInvalidProp,
    'aria-describedby': ariaDescribedByProp,
    ...rest
  },
  ref,
) {
  const localId = useId();
  const ctx = useFieldContext();
  const fallbackId = id ?? ctx?.id ?? `checkbox-${localId}`;
  const descriptionId = description !== undefined ? `${fallbackId}-description` : undefined;
  const derived = deriveFieldProps({
    explicitId: fallbackId,
    explicitInvalid: invalid,
    explicitAriaInvalid: ariaInvalidProp,
    explicitDescribedBy: ariaDescribedByProp,
    context: ctx,
    ownDescriptionId: descriptionId,
  });

  return (
    <label
      htmlFor={derived.id}
      className={cn(
        'group flex items-start gap-2.5 text-sm text-fg-default',
        disabled && 'cursor-not-allowed text-fg-faint',
        className,
      )}
    >
      <span className="relative mt-0.5 inline-flex size-4 shrink-0 items-center justify-center">
        <input
          ref={ref}
          id={derived.id}
          type="checkbox"
          disabled={disabled}
          aria-invalid={derived.ariaInvalid}
          aria-describedby={derived.describedBy}
          className={checkboxBoxClasses(derived.invalid)}
          {...rest}
        />
        <Check
          aria-hidden="true"
          strokeWidth={3}
          className="pointer-events-none size-3 text-section-accent-fg opacity-0 peer-checked:opacity-100"
        />
      </span>
      <CheckboxText label={label} description={description} descriptionId={descriptionId} />
    </label>
  );
});

function checkboxBoxClasses(invalid: boolean): string {
  return cn(
    'peer absolute inset-0 size-full cursor-pointer appearance-none rounded-(--radius-xs) border bg-surface-work',
    'motion-form-control',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page',
    'disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:opacity-70',
    'checked:bg-section-accent checked:border-section-accent',
    invalid
      ? 'border-state-error-border hover:border-state-error-fg'
      : 'border-border-strong hover:border-fg-faint',
  );
}

function CheckboxText({
  label,
  description,
  descriptionId,
}: {
  label: ReactNode;
  description: ReactNode;
  descriptionId: string | undefined;
}) {
  if (label === undefined && description === undefined) return null;
  return (
    <span className="flex flex-col gap-0.5 leading-snug">
      {label !== undefined && <span className="text-sm font-medium text-fg-default">{label}</span>}
      {description !== undefined && (
        <span id={descriptionId} className="text-xs text-fg-muted">
          {description}
        </span>
      )}
    </span>
  );
}
