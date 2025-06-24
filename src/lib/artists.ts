import { Artist, ApprovalStatus } from '@/types/artist';
import { createClient, VercelKV } from '@vercel/kv';

// Define KV client interface for fallback
interface SimpleKV {
  get: <T = unknown>(key: string) => Promise<T | null>;
  set: <T = unknown>(key: string, value: T) => Promise<'OK'>;
}

// Initialize KV client with proper typing
let kv: VercelKV | SimpleKV;

// Generate a unique ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

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

// Helper function to ensure data is serializable
function ensureSerializable<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export async function addArtist(artistData: Omit<Artist, 'id' | 'createdAt' | 'status' | 'reviewedAt' | 'reviewedBy' | 'rejectionReason'>): Promise<Artist> {
  try {
    console.log('Adding new artist:', artistData.name);
    
    // Ensure all data is serializable
    const serializedData = ensureSerializable(artistData);
    
    const newArtist: Artist = {
      ...serializedData,
      id: generateId(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      // Explicitly set undefined values to null for KV store
      reviewedAt: null,
      reviewedBy: null,
      rejectionReason: null,
    };
    
    console.log('New artist data:', JSON.stringify(newArtist, null, 2));
    
    const artists = await getArtists();
    const updatedArtists = [...artists, newArtist];
    
    try {
      console.log('Saving artists to KV store. Total artists:', updatedArtists.length);
      
      // Ensure we're only saving serializable data
      const serializedArtists = ensureSerializable(updatedArtists);
      
      // Save to KV store
      const result = await kv.set(ARTISTS_KEY, serializedArtists);
      console.log('KV set result:', result);
      
      if (result === 'OK') {
        console.log('Successfully added artist:', newArtist.id);
        return newArtist;
      } else {
        console.error('Unexpected KV set result:', result);
        throw new Error('Failed to save artist to KV store: Unexpected result');
      }
    } catch (kvError) {
      console.error('KV store error:', kvError);
      
      // Log the error details for debugging
      if (kvError instanceof Error) {
        console.error('KV Error details:', {
          message: kvError.message,
          stack: kvError.stack,
          name: kvError.name
        });
      }
      
      // Try to get the current state of the KV store for debugging
      try {
        const currentValue = await kv.get(ARTISTS_KEY);
        console.log('Current KV store value type:', typeof currentValue);
        console.log('Current KV store value length:', 
          typeof currentValue === 'string' ? currentValue.length : 'N/A');
      } catch (e) {
        console.error('Failed to get current KV store value:', e);
      }
      
      throw new Error(`KV store operation failed: ${kvError instanceof Error ? kvError.message : 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error in addArtist:', error);
    
    // Log additional error details
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
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
