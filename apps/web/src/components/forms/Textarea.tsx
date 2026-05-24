'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';
import { useFieldContext } from './Field';
import { deriveFieldProps } from './_helpers';

const textareaBase =
  'block w-full rounded-(--radius-sm) border bg-surface-work text-fg-default placeholder:text-fg-faint ' +
  'transition-[background-color,border-color,box-shadow] duration-[var(--duration-fast)] ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page ' +
  'disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-fg-faint disabled:opacity-70 ' +
  'aria-busy:cursor-progress aria-busy:opacity-70 ' +
  'resize-y';

const textarea = cva(textareaBase, {
  variants: {
    tone: {
      default: 'border-border-strong hover:border-fg-faint',
      invalid:
        'border-state-error-border bg-state-error-bg text-state-error-fg ' +
        'placeholder:text-state-error-fg/70 ' +
        'focus-visible:ring-[color:var(--color-state-error-border)] hover:border-state-error-fg',
    },
    paddingSize: {
      sm: 'p-2 text-xs',
      md: 'p-3 text-sm',
      lg: 'p-4 text-base',
    },
  },
  defaultVariants: {
    tone: 'default',
    paddingSize: 'md',
  },
});

type TextareaVariants = VariantProps<typeof textarea>;

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>, Omit<TextareaVariants, 'tone'> {
  invalid?: boolean;
  loading?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    className,
    paddingSize,
    invalid,
    loading = false,
    rows = 4,
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
    <textarea
      ref={ref}
      id={derived.id}
      rows={rows}
      aria-invalid={derived.ariaInvalid}
      aria-describedby={derived.describedBy}
      aria-busy={loading || undefined}
      className={cn(textarea({ tone, paddingSize }), className)}
      {...rest}
    />
  );
});
