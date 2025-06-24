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
    console.log('Fetching artists from KV...');
    const result = await kv.get<Artist[]>(ARTISTS_KEY);
    console.log('Raw KV response:', result);
    
    if (!result) {
      console.log('No artists found in KV, returning empty array');
      return [];
    }
    
    // Ensure we always return an array, even if KV returns a single object
    const artists = Array.isArray(result) ? result : [result];
    console.log(`Found ${artists.length} artists`);
    return artists.filter(artist => {
      // Filter out any invalid entries
      const isValid = artist && typeof artist === 'object' && 'id' in artist;
      if (!isValid) {
        console.warn('Found invalid artist entry:', artist);
      }
      return isValid;
    });
  } catch (error) {
    console.error('Error fetching artists from KV:', error);
    return [];
  }
}

export async function addArtist(artist: Omit<Artist, 'id' | 'createdAt' | 'status' | 'reviewedAt' | 'reviewedBy'>): Promise<Artist> {
  try {
    console.log('Adding new artist:', artist);
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
    console.log('Saving updated artists list:', updatedArtists.length);
    
    // Convert to plain object to avoid any serialization issues
    const serializedArtists = JSON.parse(JSON.stringify(updatedArtists));
    
    await kv.set(ARTISTS_KEY, serializedArtists);
    console.log('Successfully saved artist');
    return newArtist;
  } catch (error) {
    console.error('Error in addArtist:', error);
    throw new Error(`Failed to add artist: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function updateArtist(id: string, updates: UpdateArtistData): Promise<Artist | null> {
  try {
    console.log(`Updating artist ${id} with:`, updates);
    const artists = await getArtists();
    const index = artists.findIndex(a => a.id === id);
    
    if (index === -1) {
      console.error(`Artist with id ${id} not found`);
      return null;
    }
    
    const updatedArtist: Artist = {
      ...artists[index],
      ...updates,
      reviewedAt: updates.status !== 'pending' ? new Date().toISOString() : artists[index].reviewedAt,
    };
    
    const updatedArtists = [...artists];
    updatedArtists[index] = updatedArtist;
    
    // Convert to plain object to avoid any serialization issues
    const serializedArtists = JSON.parse(JSON.stringify(updatedArtists));
    
    await kv.set(ARTISTS_KEY, serializedArtists);
    console.log(`Successfully updated artist ${id}`);
    return updatedArtist;
  } catch (error) {
    console.error(`Error updating artist ${id}:`, error);
    throw new Error(`Failed to update artist: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getArtistById(id: string): Promise<Artist | null> {
  try {
    console.log(`Fetching artist with id: ${id}`);
    const artists = await getArtists();
    const artist = artists.find(artist => artist.id === id);
    
    if (!artist) {
      console.warn(`Artist with id ${id} not found`);
      return null;
    }
    
    console.log(`Found artist:`, artist.name);
    return artist;
  } catch (error) {
    console.error(`Error fetching artist ${id}:`, error);
    return null;
  }
}
