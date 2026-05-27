import Link from 'next/link';
import { Container } from '@/components/layout';

const TEAM = [
  { name: 'Aykhan Ahmadzada', role: 'Project lead' },
  { name: 'Elshad Toklayev', role: 'Backend engineer' },
  { name: 'Eljan Mammadli', role: 'Data & analytics' },
  { name: 'Rahila Dashdiyeva', role: 'Frontend engineer' },
] as const;

const AVATAR_PALETTE: Array<[string, string]> = [
  ['var(--color-violet-500)', 'var(--color-teal-500)'],
  ['var(--color-indigo-500)', 'var(--color-violet-700)'],
  ['var(--color-teal-500)', 'var(--color-green-700)'],
  ['var(--color-magenta-500)', 'var(--color-violet-700)'],
];

export function About() {
  return (
    <section id="about" className="scroll-mt-[2rem] bg-surface-page py-32">
      <Container size="wide" gutter="page" className="grid items-center gap-20 lg:grid-cols-2">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-section-accent">
            Project scope
          </p>
          <h2 className="mt-4 text-5xl font-extrabold leading-[1.05] tracking-[-0.035em] text-fg-strong text-balance">
            Built around the
            <br />
            Million Playlist Dataset.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-fg-muted">
            Statify combines normalized playlist data, account sessions, listening history, playlist
            creation, admin operations, and SQL analytics into one demoable product - built for the
            COMP306 course at Koç University.
          </p>
          <Link
            href="https://github.com/aykhan019/statify"
            target="_blank"
            rel="noreferrer"
            className="mt-7 inline-flex items-center gap-2.5 rounded-(--radius-md) border border-border-default bg-surface-work px-5 py-3 text-sm font-semibold text-fg-strong motion-interactive hover:border-section-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus"
          >
            View on GitHub →
          </Link>
        </div>

        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-fg-muted">
            Team
          </p>
          <div className="mt-5 grid gap-3">
            {TEAM.map((member, i) => {
              const initials = member.name
                .split(' ')
                .map((word) => word[0])
                .join('')
                .slice(0, 2);
              const palette = AVATAR_PALETTE[i] ?? AVATAR_PALETTE[0]!;
              return (
                <div
                  key={member.name}
                  className="flex items-center gap-3.5 rounded-(--radius-lg) border border-border-default bg-surface-work px-4.5 py-3.5"
                >
                  <div
                    className="grid size-10 place-items-center rounded-(--radius-md) text-sm font-bold text-fg-on-block"
                    style={{
                      background: `linear-gradient(135deg, ${palette[0]}, ${palette[1]})`,
                    }}
                  >
                    {initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-fg-strong">{member.name}</div>
                    <div className="text-xs text-fg-muted">{member.role}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
