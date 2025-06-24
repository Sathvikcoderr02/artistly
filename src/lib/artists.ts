import { Artist, ApprovalStatus } from '@/types/artist';
import { kv } from '@vercel/kv';

type UpdateArtistData = {
  status: ApprovalStatus;
  rejectionReason?: string;
  reviewedAt?: string;
  reviewedBy?: string;
};

const ARTISTS_KEY = 'artists';

export async function getArtists(): Promise<Artist[]> {
  try {
    const artists = await kv.get<Artist[]>(ARTISTS_KEY);
    return artists || [];
  } catch (error) {
    console.error('Error fetching artists from KV:', error);
    return [];
  }
}

export async function addArtist(artist: Omit<Artist, 'id' | 'createdAt' | 'status' | 'reviewedAt' | 'reviewedBy'>): Promise<Artist> {
  const artists = await getArtists();
  const newArtist: Artist = {
    ...artist,
    id: Date.now().toString(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  
  artists.push(newArtist);
  await kv.set(ARTISTS_KEY, artists);
  return newArtist;
}

export async function updateArtist(id: string, updates: UpdateArtistData): Promise<Artist | null> {
  const artists = await getArtists();
  const index = artists.findIndex(a => a.id === id);
  
  if (index === -1) return null;
  
  const updatedArtist = {
    ...artists[index],
    ...updates,
    reviewedAt: updates.status !== 'pending' ? new Date().toISOString() : artists[index].reviewedAt,
  };
  
  artists[index] = updatedArtist;
  await kv.set(ARTISTS_KEY, artists);
  return updatedArtist;
}

export async function getArtistById(id: string): Promise<Artist | null> {
  const artists = await getArtists();
  return artists.find(artist => artist.id === id) || null;
}
