import Link from 'next/link';
import type { UserPlaylistListItem } from '@statify/shared';
import { Card } from '@/components/ui/Card';

interface UserPlaylistCardProps {
  playlist: UserPlaylistListItem;
  href: string;
}

export function UserPlaylistCard({ playlist, href }: UserPlaylistCardProps) {
  return (
    <Card className="hover:bg-muted transition-colors">
      <Link href={href} className="flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="hover:text-accent truncate text-base font-medium">{playlist.name}</span>
          <p className="text-muted-foreground truncate text-sm">
            {playlist.trackCount.toLocaleString()} tracks
            {playlist.description !== null && playlist.description.length > 0
              ? ` · ${playlist.description}`
              : ''}
          </p>
        </div>
        <div className="text-muted-foreground flex shrink-0 gap-3 text-xs sm:text-sm">
          <span>{playlist.isPublic ? 'Public' : 'Private'}</span>
        </div>
      </Link>
    </Card>
  );
}
