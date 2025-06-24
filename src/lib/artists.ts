import { Artist, ApprovalStatus } from '@/types/artist';
import { createClient, VercelKV } from '@vercel/kv';

// Define KV client interface for fallback
interface SimpleKV {
  get: <T = unknown>(key: string) => Promise<T | null>;
  set: <T = unknown>(key: string, value: T) => Promise<'OK'>;
}

// Initialize KV client with proper typing
let kv: VercelKV | SimpleKV;

// Initialize KV client with error handling
try {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    throw new Error('Missing KV configuration');
  }
  
  kv = createClient({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });
  console.log('Connected to Vercel KV store');
} catch (error) {
  console.warn('Failed to initialize KV client, using in-memory store:', error);
  
  // Fallback in-memory store for development
  const store = new Map<string, unknown>();
  kv = {
    async get<T = unknown>(key: string): Promise<T | null> {
      return (store.get(key) as T) || null;
    },
    async set(key: string, value: unknown): Promise<'OK'> {
      store.set(key, value);
      return 'OK';
    }
  };
}

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
    return Array.isArray(artists) ? artists : [];
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
    reviewedAt: undefined,
    reviewedBy: undefined,
    rejectionReason: undefined
  };
  
  const updatedArtists = [...artists, newArtist];
  await kv.set<Artist[]>(ARTISTS_KEY, updatedArtists);
  return newArtist;
}

export async function updateArtist(id: string, updates: UpdateArtistData): Promise<Artist | null> {
  const artists = await getArtists();
  const index = artists.findIndex(a => a.id === id);
  
  if (index === -1) return null;
  
  const updatedArtist: Artist = {
    ...artists[index],
    ...updates,
    reviewedAt: updates.status !== 'pending' ? new Date().toISOString() : artists[index].reviewedAt,
  };
  
  const updatedArtists = [...artists];
  updatedArtists[index] = updatedArtist;
  await kv.set<Artist[]>(ARTISTS_KEY, updatedArtists);
  return updatedArtist;
}

export async function getArtistById(id: string): Promise<Artist | null> {
  const artists = await getArtists();
  return artists.find(artist => artist.id === id) || null;
}
