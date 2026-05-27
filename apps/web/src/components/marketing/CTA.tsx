import Link from 'next/link';
import { Container } from '@/components/layout';

/**
 * Closing CTA strip. Dark band with two glow blobs and centered copy +
 * primary/secondary CTAs. Lives between About and the marketing footer.
 */
export function CTA() {
  return (
    <section
      className="relative overflow-hidden py-28"
      style={{
        background: 'linear-gradient(135deg, oklch(0.16 0.04 270), oklch(0.22 0.1 300))',
      }}
    >
      <div
        className="absolute left-[10%] top-[10%] size-[26rem] rounded-full opacity-35 blur-3xl motion-reduce:hidden"
        style={{ background: 'var(--color-violet-500)' }}
      />
      <div
        className="absolute right-[10%] top-[30%] size-[20rem] rounded-full opacity-25 blur-3xl motion-reduce:hidden"
        style={{ background: 'var(--color-teal-500)' }}
      />

      <Container size="wide" gutter="page" className="relative text-center text-fg-on-block">
        <h2 className="text-6xl font-extrabold leading-[1.05] tracking-[-0.04em] text-balance">
          Start tracking your sound.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/75">
          Free during the demo period. Connect to start logging listening events and watch your
          stats build up in real time.
        </p>
        <div className="mt-9 flex justify-center gap-3.5">
          <Link
            href="/signup"
            className="rounded-(--radius-md) bg-white px-8 py-4 text-sm font-semibold text-[oklch(0.18_0.006_265)] motion-interactive hover:opacity-95"
          >
            Create your account →
          </Link>
          <Link
            href="/login"
            className="rounded-(--radius-md) border border-white/25 bg-transparent px-8 py-4 text-sm font-semibold text-fg-on-block motion-interactive hover:bg-white/[0.08]"
          >
            Log in
          </Link>
        </div>
      </Container>
    </section>
  );
}
