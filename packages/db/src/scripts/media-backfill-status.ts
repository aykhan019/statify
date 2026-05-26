import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function percent(part: number, total: number): string {
  if (total === 0) return '0.00%';
  return `${((part / total) * 100).toFixed(2)}%`;
}

async function main() {
  const [
    totalAlbums,
    albumsWithImage,
    albumsMissingImage,
    albumsMissingSpotifyUri,
    totalArtists,
    artistsWithImage,
    artistsMissingImage,
    artistsMissingSpotifyUri,
  ] = await Promise.all([
    prisma.album.count(),
    prisma.album.count({ where: { imageUrl: { not: null } } }),
    prisma.album.count({ where: { imageUrl: null } }),
    prisma.album.count({ where: { spotifyUri: '' } }),

    prisma.artist.count(),
    prisma.artist.count({ where: { imageUrl: { not: null } } }),
    prisma.artist.count({ where: { imageUrl: null } }),
    prisma.artist.count({ where: { spotifyUri: '' } }),
  ]);

  console.log('\n=== Media Backfill Status ===\n');

  console.log('Albums');
  console.log(
    `  Filled:  ${albumsWithImage}/${totalAlbums} (${percent(albumsWithImage, totalAlbums)})`,
  );
  console.log(`  Missing: ${albumsMissingImage}`);
  console.log(`  Empty Spotify URI: ${albumsMissingSpotifyUri}`);

  console.log('\nArtists');
  console.log(
    `  Filled:  ${artistsWithImage}/${totalArtists} (${percent(artistsWithImage, totalArtists)})`,
  );
  console.log(`  Missing: ${artistsMissingImage}`);
  console.log(`  Empty Spotify URI: ${artistsMissingSpotifyUri}`);

  console.log('\nOverall');
  const total = totalAlbums + totalArtists;
  const filled = albumsWithImage + artistsWithImage;
  const missing = albumsMissingImage + artistsMissingImage;

  console.log(`  Filled:  ${filled}/${total} (${percent(filled, total)})`);
  console.log(`  Missing: ${missing}`);

  if (missing === 0) {
    console.log('\n✅ Database media images are completely filled.');
  } else {
    console.log('\n⚠️ Some rows still have imageUrl = null.');
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
