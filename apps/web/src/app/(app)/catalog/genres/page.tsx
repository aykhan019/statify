import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';

export const metadata = {
  title: 'Genres | Statify',
};

export default function GenresPage() {
  return (
    <section className="flex flex-col gap-6">
      <PageHeader headingLevel={2} title="Genres" description="Coming soon." />
      <Card>
        <CardHeader>
          <CardTitle>Genres are not derived yet</CardTitle>
          <CardDescription>
            The Million Playlist Dataset does not carry genre data. Statify derives genres lazily
            from the iTunes Search API as previews are fetched. Once enough tracks have been
            enriched, this page will surface a browsable list of genres.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Tracked under M2 in <code>CHECKLIST.md</code>. Unblocked once genre derivation lands.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
