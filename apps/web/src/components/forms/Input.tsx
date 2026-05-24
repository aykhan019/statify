'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type InputHTMLAttributes, type ReactElement, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { useFieldContext } from './Field';
import { deriveFieldProps } from './_helpers';

const inputBase =
  'block w-full rounded-(--radius-sm) border bg-surface-work text-fg-default placeholder:text-fg-faint ' +
  'motion-form-control ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page ' +
  'disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-fg-faint disabled:opacity-70 disabled:placeholder:text-fg-faint ' +
  'aria-busy:cursor-progress aria-busy:opacity-70';

const input = cva(inputBase, {
  variants: {
    size: {
      sm: 'h-8 px-2.5 text-xs',
      md: 'h-10 px-3 text-sm',
      lg: 'h-12 px-4 text-base',
    },
    tone: {
      default: 'border-border-strong hover:border-fg-faint',
      invalid:
        'border-state-error-border bg-state-error-bg text-state-error-fg ' +
        'placeholder:text-state-error-fg/70 ' +
        'focus-visible:ring-[color:var(--color-state-error-border)] hover:border-state-error-fg',
    },
  },
  defaultVariants: {
    size: 'md',
    tone: 'default',
  },
});

type InputVariants = VariantProps<typeof input>;

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>, Omit<InputVariants, 'tone'> {
  /** Mark the field invalid; pairs with Field's `error` prop. */
  invalid?: boolean;
  /** Pending state for inflight submissions; sets aria-busy. */
  loading?: boolean;
  /** Lucide-rendered glyph painted inside the input on the leading edge. */
  startSlot?: ReactElement;
  /** Lucide-rendered glyph or text on the trailing edge. */
  endSlot?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    type = 'text',
    size,
    invalid,
    loading = false,
    startSlot,
    endSlot,
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
  const padding = slotPadding(size ?? 'md', startSlot, endSlot);

  const inputEl = (
    <input
      ref={ref}
      id={derived.id}
      type={type}
      aria-invalid={derived.ariaInvalid}
      aria-describedby={derived.describedBy}
      aria-busy={loading || undefined}
      className={cn(input({ size, tone }), padding, className)}
      {...rest}
    />
  );

  if (startSlot === undefined && endSlot === undefined) return inputEl;

  return (
    <div className="relative">
      {startSlot !== undefined && (
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-fg-muted">
          {startSlot}
        </span>
      )}
      {inputEl}
      {endSlot !== undefined && (
        <span className="absolute inset-y-0 right-3 flex items-center gap-1 text-fg-muted">
          {endSlot}
        </span>
      )}
    </div>
  );
});

function slotPadding(
  size: NonNullable<InputVariants['size']>,
  startSlot: ReactNode,
  endSlot: ReactNode,
): string {
  if (startSlot === undefined && endSlot === undefined) return '';
  return cn(
    startSlot !== undefined ? leadingPad(size) : '',
    endSlot !== undefined ? trailingPad(size) : '',
  );
}

function leadingPad(size: NonNullable<InputVariants['size']>): string {
  if (size === 'sm') return 'pl-8';
  if (size === 'lg') return 'pl-12';
  return 'pl-10';
}

function trailingPad(size: NonNullable<InputVariants['size']>): string {
  if (size === 'sm') return 'pr-8';
  if (size === 'lg') return 'pr-12';
  return 'pr-10';
}
