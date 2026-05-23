import Link from 'next/link';
import { CreatePlaylistForm } from '@/components/playlists/CreatePlaylistForm';
import { Card, CardContent } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';

export const metadata = {
  title: 'New playlist | Statify',
};

export default function NewPlaylistPage() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <PageHeader
        title="New playlist"
        description="Give your playlist a name. You can add tracks afterwards."
      />
      <Card>
        <CardContent className="py-6">
          <CreatePlaylistForm />
        </CardContent>
      </Card>
      <Link href="/me/playlists" className="text-muted-foreground hover:text-foreground text-sm">
        ← Back to my playlists
      </Link>
    </div>
  );
}
