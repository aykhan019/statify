'use client';

import { ErrorState } from '@/components/states';

/**
 * Authed-subtree error boundary. Renders inside the app shell (the parent
 * layout persists), so the nav stays put while the failed segment shows the
 * error state. `reset` re-runs the segment's render and data fetch.
 */
export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-10">
      <ErrorState onRetry={reset} />
    </div>
  );
}
