import type { FieldContextValue } from './Field';

export interface DerivedFieldProps {
  id: string | undefined;
  invalid: boolean;
  describedBy: string | undefined;
  ariaInvalid: boolean | undefined;
}

export type AriaInvalidValue = boolean | 'true' | 'false' | 'grammar' | 'spelling' | undefined;

/**
 * Reduces the boilerplate of pulling id, invalid, aria-describedby, and
 * aria-invalid off either explicit props or the nearest Field context.
 */
export function deriveFieldProps(args: {
  explicitId: string | undefined;
  explicitInvalid: boolean | undefined;
  explicitAriaInvalid: AriaInvalidValue;
  explicitDescribedBy: string | undefined;
  context: FieldContextValue | null;
  ownDescriptionId?: string;
}): DerivedFieldProps {
  const id = args.explicitId ?? args.context?.id;
  const invalid = pickInvalid(args.explicitInvalid, args.context);
  const describedBy = composeDescribedBy(
    args.explicitDescribedBy,
    args.ownDescriptionId,
    args.context,
    invalid,
  );
  const ariaInvalid = resolveAriaInvalid(args.explicitAriaInvalid, invalid);
  return { id, invalid, describedBy, ariaInvalid };
}

function pickInvalid(explicit: boolean | undefined, context: FieldContextValue | null): boolean {
  if (typeof explicit === 'boolean') return explicit;
  return context?.invalid ?? false;
}

function composeDescribedBy(
  explicit: string | undefined,
  own: string | undefined,
  context: FieldContextValue | null,
  invalid: boolean,
): string | undefined {
  const ids: string[] = [];
  if (typeof explicit === 'string' && explicit.length > 0) ids.push(explicit);
  if (typeof own === 'string') ids.push(own);
  pushContextHelpId(ids, context, invalid);
  return ids.length === 0 ? undefined : ids.join(' ');
}

function pushContextHelpId(
  ids: string[],
  context: FieldContextValue | null,
  invalid: boolean,
): void {
  if (context === null) return;
  if (invalid) {
    ids.push(context.errorId);
    return;
  }
  if (context.hasHint) ids.push(context.hintId);
}

function resolveAriaInvalid(explicit: AriaInvalidValue, invalid: boolean): boolean | undefined {
  if (explicit === undefined) return invalid ? true : undefined;
  if (typeof explicit === 'boolean') return explicit;
  return explicit !== 'false';
}
