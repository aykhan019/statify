import { SectionContent } from '@/components/section';
import { NotFoundState } from '@/components/states';

/**
 * Authed-subtree not-found boundary. Catches `notFound()` from detail routes
 * (track / artist / album / playlist) and unmatched authed URLs. Renders inside
 * the app shell.
 */
export default function AppNotFound() {
  return (
    <SectionContent>
      <NotFoundState />
    </SectionContent>
  );
}
