import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { CurrentUserProvider } from '@/lib/auth/current-user-context';
import { getServerSession } from '@/lib/auth/session';
import { bricolage, jetbrainsMono } from '@/lib/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'Statify',
  description: 'Music streaming analytics built on the Spotify Million Playlist Dataset',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const currentUser = await getServerSession();

  return (
    <html lang="en" className={`${bricolage.variable} ${jetbrainsMono.variable}`}>
      <body>
        <CurrentUserProvider initialUser={currentUser}>{children}</CurrentUserProvider>
      </body>
    </html>
  );
}
