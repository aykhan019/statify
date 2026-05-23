type ClassValue =
  | string
  | number
  | null
  | false
  | undefined
  | Record<string, unknown>
  | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  for (const input of inputs) {
    const rendered = renderClassValue(input);
    if (rendered.length > 0) {
      out.push(rendered);
    }
  }
  return out.join(' ');
}

function renderClassValue(input: ClassValue): string {
  if (input === null || input === undefined || input === false || input === '') {
    return '';
  }
  if (typeof input === 'string') {
    return input;
  }
  if (typeof input === 'number') {
    return String(input);
  }
  if (Array.isArray(input)) {
    return cn(...input);
  }
  return renderClassRecord(input);
}

function renderClassRecord(record: Record<string, unknown>): string {
  const out: string[] = [];
  for (const [key, value] of Object.entries(record)) {
    if (value) {
      out.push(key);
    }
  }
  return out.join(' ');
}
