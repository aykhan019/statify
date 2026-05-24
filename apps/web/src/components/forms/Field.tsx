'use client';

import {
  createContext,
  useContext,
  useId,
  useMemo,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils/cn';
import { FormError } from './FormError';
import { FormHint } from './FormHint';
import { Label } from './Label';

export interface FieldContextValue {
  id: string;
  hintId: string;
  errorId: string;
  invalid: boolean;
  hasHint: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

export function useFieldContext(): FieldContextValue | null {
  return useContext(FieldContext);
}

export interface FieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'id'> {
  id?: string;
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  optional?: boolean;
  /** Hide the label visually but keep it for screen readers. */
  hideLabel?: boolean;
  children: ReactNode;
}

export function Field({
  id,
  label,
  hint,
  error,
  required = false,
  optional = false,
  hideLabel = false,
  className,
  children,
  ...rest
}: FieldProps) {
  const reactId = useId();
  const fieldId = id ?? `field-${reactId}`;
  const hintId = `${fieldId}-hint`;
  const errorId = `${fieldId}-error`;
  const invalid = isPresent(error);
  const hasHint = isPresent(hint);

  const ctx = useMemo<FieldContextValue>(
    () => ({ id: fieldId, hintId, errorId, invalid, hasHint }),
    [fieldId, hintId, errorId, invalid, hasHint],
  );

  return (
    <FieldContext.Provider value={ctx}>
      <div className={cn('flex flex-col gap-1.5', className)} {...rest}>
        {isPresent(label) && (
          <Label
            htmlFor={fieldId}
            required={required}
            optional={optional}
            className={hideLabel ? 'sr-only' : undefined}
          >
            {label}
          </Label>
        )}
        {children}
        <FieldFeedback errorId={errorId} hintId={hintId} error={error} hint={hint} />
      </div>
    </FieldContext.Provider>
  );
}

function isPresent(value: ReactNode): boolean {
  return value !== undefined && value !== null && value !== false;
}

function FieldFeedback({
  errorId,
  hintId,
  error,
  hint,
}: {
  errorId: string;
  hintId: string;
  error: ReactNode;
  hint: ReactNode;
}) {
  if (isPresent(error)) return <FormError id={errorId}>{error}</FormError>;
  if (isPresent(hint)) return <FormHint id={hintId}>{hint}</FormHint>;
  return null;
}
