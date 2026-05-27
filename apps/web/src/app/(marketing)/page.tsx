import type { Metadata } from 'next';
import { Hero } from '@/components/marketing/Hero';
import { StatsStrip } from '@/components/marketing/StatsStrip';
import { Features } from '@/components/marketing/Features';
import { Stack } from '@/components/marketing/Stack';
import { Demo } from '@/components/marketing/Demo';
import { About } from '@/components/marketing/About';
import { CTA } from '@/components/marketing/CTA';
import { Footer } from '@/components/marketing/Footer';

export const metadata: Metadata = {
  title: 'Statify — Music streaming analytics',
  description:
    'Statify turns a playlist-scale catalog and your own listening history into top artists, trend deltas, heatmaps, and discovery paths.',
};

/**
 * Marketing landing page (`/`).
 *
 * Composition only — every section is a self-contained component in
 * `@/components/marketing/`. Order matches the layout's nav anchors:
 *
 *   /#home      → Hero
 *   /#features  → Features
 *   /#stack     → Stack
 *   /#demo      → Demo
 *   /#about     → About
 *
 * `data-section-hue="indigo"` keeps focus rings + section accents
 * matching the rest of the app's auth/marketing identity.
 */
export default function HomePage() {
  return (
    <div data-section-hue="indigo" className="bg-surface-page text-fg-default">
      <Hero />
      <StatsStrip />
      <Features />
      <Stack />
      <Demo />
      <About />
      <CTA />
      <Footer />
    </div>
  );
}
