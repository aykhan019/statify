'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';
import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';
import { useFieldContext } from './Field';
import { deriveFieldProps } from './_helpers';

const selectBase =
  'block w-full appearance-none rounded-(--radius-sm) border bg-surface-work text-fg-default ' +
  'transition-[background-color,border-color,box-shadow] duration-[var(--duration-fast)] ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page ' +
  'disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-fg-faint disabled:opacity-70 ' +
  'aria-busy:cursor-progress aria-busy:opacity-70';

const select = cva(selectBase, {
  variants: {
    size: {
      sm: 'h-8 pl-2.5 pr-8 text-xs',
      md: 'h-10 pl-3 pr-10 text-sm',
      lg: 'h-12 pl-4 pr-12 text-base',
    },
    tone: {
      default: 'border-border-strong hover:border-fg-faint',
      invalid:
        'border-state-error-border bg-state-error-bg text-state-error-fg ' +
        'focus-visible:ring-[color:var(--color-state-error-border)] hover:border-state-error-fg',
    },
  },
  defaultVariants: {
    size: 'md',
    tone: 'default',
  },
});

type SelectVariants = VariantProps<typeof select>;

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'>, Omit<SelectVariants, 'tone'> {
  invalid?: boolean;
  loading?: boolean;
  /** Optional placeholder rendered as a disabled, empty-value first option. */
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    className,
    size,
    invalid,
    loading = false,
    placeholder,
    children,
    id,
    'aria-invalid': ariaInvalidProp,
    'aria-describedby': ariaDescribedByProp,
    ...rest
  },
  ref,
) {
  const derived = deriveFieldProps({
    explicitId: id,
    explicitInvalid: invalid,
    explicitAriaInvalid: ariaInvalidProp,
    explicitDescribedBy: ariaDescribedByProp,
    context: useFieldContext(),
  });
  const tone = derived.invalid ? 'invalid' : 'default';

  return (
    <div className="relative">
      <select
        ref={ref}
        id={derived.id}
        aria-invalid={derived.ariaInvalid}
        aria-describedby={derived.describedBy}
        aria-busy={loading || undefined}
        className={cn(select({ size, tone }), className)}
        {...rest}
      >
        {placeholder !== undefined && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        strokeWidth={2}
        className={cn(
          'pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted',
          size === 'sm' ? 'size-[var(--icon-xs)]' : 'size-[var(--icon-sm)]',
        )}
      />
    </div>
  );
});
