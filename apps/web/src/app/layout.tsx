import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { CurrentUserProvider } from '@/lib/auth/current-user-context';
import { getServerSession } from '@/lib/auth/session';
import { bricolage, jetbrainsMono } from '@/lib/fonts';
import { normalizeThemeMode, THEME_COOKIE_NAME } from '@/lib/theme';
import './globals.css';

export const metadata: Metadata = {
  title: 'Statify',
  description: 'Music streaming analytics built on the Spotify Million Playlist Dataset',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const initialTheme = normalizeThemeMode(cookieStore.get(THEME_COOKIE_NAME)?.value);
  const currentUser = await getServerSession();

  return (
    <html
      lang="en"
      data-theme={initialTheme}
      className={`${bricolage.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider initialMode={initialTheme}>
          <CurrentUserProvider initialUser={currentUser}>{children}</CurrentUserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
