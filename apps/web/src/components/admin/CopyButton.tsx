'use client';

import { Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/Icon';

interface CopyButtonProps {
  value: string;
  label?: string;
}

export function CopyButton({ value, label = 'Copy URL' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Copied' : label}
      title={copied ? 'Copied' : label}
      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-(--radius-sm) text-fg-muted motion-colors hover:bg-surface-sunken hover:text-fg-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus"
    >
      <Icon as={copied ? Check : Copy} size="xs" />
    </button>
  );
}
