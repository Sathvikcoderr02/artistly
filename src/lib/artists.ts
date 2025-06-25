import { Artist } from '@/types/artist';
import { createClient, VercelKV } from '@vercel/kv';

// Simple in-memory store implementation
class InMemoryKV {
  private store: Map<string, unknown>;

  constructor() {
    this.store = new Map();
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    try {
      return (this.store.get(key) as T) || null;
    } catch (error) {
      console.error('Error in in-memory get:', error);
      return null;
    }
  }

  async set<T = unknown>(key: string, value: T): Promise<'OK'> {
    try {
      this.store.set(key, value);
      return 'OK';
    } catch (error) {
      console.error('Error in in-memory set:', error);
      throw error;
    }
  }

  async del(key: string): Promise<number> {
    try {
      return this.store.delete(key) ? 1 : 0;
    } catch (error) {
      console.error('Error in in-memory del:', error);
      return 0;
    }
  }

  async ping(): Promise<string> {
    return 'PONG';
  }

  async info(): Promise<Record<string, unknown>> {
    return {
      store: 'in-memory',
      keys: Array.from(this.store.keys()),
      size: this.store.size,
      isFallback: true,
      warning: 'This is an in-memory store and will not persist between deployments'
    };
  }
}

// Initialize KV client
export let kv: VercelKV | InMemoryKV;

// Generate a unique ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// KV client initialization is now handled in the IIFE below

// Initialize KV with fallback
(async () => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    console.warn('Running in browser, using in-memory KV store');
    initInMemoryKV();
    return;
  }

  try {
    // Check if we have the required environment variables
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      throw new Error('Missing KV_REST_API_URL or KV_REST_API_TOKEN environment variables');
    }
    
    console.log('Initializing Vercel KV client...');
    const client = createClient({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });
    
    // Test the connection
    await client.ping();
    console.log('Successfully connected to Vercel KV store');
    kv = client;
    
  } catch (error) {
    console.warn('Failed to initialize Vercel KV client, using in-memory store:', error);
    initInMemoryKV();
  }
})();

// Initialize in-memory KV store as fallback
function initInMemoryKV() {
  console.warn('Using in-memory KV store as fallback');
  kv = new InMemoryKV();
}

// Type for updating an artist
type UpdateArtistData = Partial<Omit<Artist, 'id' | 'createdAt'>>;

const ARTISTS_KEY = 'artists';

export async function getArtists(): Promise<Artist[]> {
  try {
    console.log('🔵 [getArtists] Fetching artists from KV...');
    const result = await kv.get<unknown>(ARTISTS_KEY);
    
    // If no data exists, return empty array
    if (!result) {
      console.log('ℹ️ [getArtists] No artists found in KV, returning empty array');
      return [];
    }
    
    // Defensive: detect bad strings or wrong types
    if (typeof result === 'string') {
      console.warn('⚠️ [getArtists] KV value was a string, possibly corrupted:', result.slice(0, 50));
      // Attempt to parse it if it's a JSON string
      try {
        const parsed = JSON.parse(result);
        if (Array.isArray(parsed)) {
          console.log('✓ [getArtists] Successfully parsed corrupted string as JSON array');
          return parsed;
        }
      } catch (parseError) {
        console.error('❌ [getArtists] Failed to parse corrupted KV value:', parseError);
      }
      
      // If we can't parse it, reset the KV store
      console.warn('⚠️ [getArtists] Resetting corrupted KV store');
      await kv.set(ARTISTS_KEY, []);
      return [];
    }
    
    // If it's not an array, reset it
    if (!Array.isArray(result)) {
      console.warn('⚠️ [getArtists] KV returned a non-array. Resetting to empty array');
      await kv.set(ARTISTS_KEY, []);
      return [];
    }
    
    // Filter out any invalid entries
    const validArtists = result.filter((artist: unknown): artist is Artist => {
      if (!artist || typeof artist !== 'object') {
        console.warn('⚠️ [getArtists] Invalid artist entry (not an object):', artist);
        return false;
      }
      
      const hasRequiredFields = 'id' in artist && 'name' in artist;
      if (!hasRequiredFields) {
        console.warn('⚠️ [getArtists] Invalid artist entry (missing required fields):', artist);
        return false;
      }
      
      return true;
    });
    
    // If we filtered out any invalid entries, save the cleaned version
    if (validArtists.length !== result.length) {
      console.warn(`⚠️ [getArtists] Filtered out ${result.length - validArtists.length} invalid artists`);
      await kv.set(ARTISTS_KEY, validArtists);
    }
    
    console.log(`✅ [getArtists] Returning ${validArtists.length} valid artists`);
    return validArtists;
  } catch (error) {
    console.error('❌ [getArtists] Error fetching artists from KV:', error);
    // In case of error, return empty array to prevent breaking the application
    return [];
  }
}

// Helper function to ensure data is serializable
function ensureSerializable<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export async function addArtist(
  artistData: Omit<Artist, 'id' | 'createdAt' | 'status' | 'reviewedAt' | 'reviewedBy' | 'rejectionReason'>
): Promise<Artist> {
  try {
    console.log('🔵 [addArtist] Adding new artist:', artistData.name);
    
    // Validate required fields
    if (!artistData.name || !artistData.email) {
      throw new Error('Name and email are required');
    }
    
    // Ensure all data is serializable and sanitize input
    const serializedData = ensureSerializable({
      ...artistData,
      // Ensure arrays are properly initialized
      languages: Array.isArray(artistData.languages) 
        ? artistData.languages.filter(lang => typeof lang === 'string')
       : [],
      // Ensure fee is a number
      fee: Number(artistData.fee) || 0,
      // Ensure imageUrl is a string
      imageUrl: String(artistData.imageUrl || '')
    });
    
    // Create the new artist object with all required fields
    const newArtist: Artist = {
      ...serializedData,
      id: generateId(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      // Explicitly set optional fields to null for KV store
      reviewedAt: null,
      reviewedBy: null,
      rejectionReason: null,
      // Ensure we have all required fields with defaults
      category: serializedData.category || 'Other',
      city: serializedData.city || '',
      bio: serializedData.bio || '',
      experience: serializedData.experience || '',
      phone: serializedData.phone || '',
      imageUrl: serializedData.imageUrl || '',
      image: serializedData.imageUrl || null, // Backward compatibility
      profileImage: serializedData.imageUrl || null // New field
    };
    
    console.log('🔄 [addArtist] New artist data:', {
      id: newArtist.id,
      name: newArtist.name,
      email: newArtist.email,
      imageUrl: newArtist.imageUrl ? '✅' : '❌'
    });
    
    // Get existing artists
    const artists = await getArtists();
    
    // Check for duplicate email
    const emailExists = artists.some(a => a.email === newArtist.email && a.id !== newArtist.id);
    if (emailExists) {
      throw new Error('An artist with this email already exists');
    }
    
    const updatedArtists = [...artists, newArtist];
    
    try {
      console.log(`🔄 [addArtist] Saving ${updatedArtists.length} artists to KV store`);
      
      // Ensure we're only saving serializable data
      const serializedArtists = ensureSerializable(updatedArtists);
      
      // Save to KV store
      const result = await kv.set(ARTISTS_KEY, serializedArtists);
      
      if (result === 'OK') {
        console.log(`✅ [addArtist] Successfully added artist: ${newArtist.id}`);
        return newArtist;
      } else {
        console.error('❌ [addArtist] Unexpected KV set result:', result);
        throw new Error('Failed to save artist to KV store: Unexpected result');
      }
    } catch (kvError) {
      console.error('❌ [addArtist] KV store error:', kvError);
      
      // Log detailed error information
      if (kvError instanceof Error) {
        console.error('🔍 [addArtist] KV Error details:', {
          message: kvError.message,
          name: kvError.name,
          stack: kvError.stack?.split('\n').slice(0, 3).join('\n') + '...'
        });
      }
      
      // Try to get the current state of the KV store for debugging
      try {
        const currentValue = await kv.get(ARTISTS_KEY);
        console.log('🔍 [addArtist] Current KV store value type:', typeof currentValue);
        if (typeof currentValue === 'string') {
          console.log('🔍 [addArtist] KV store value (first 200 chars):', 
            currentValue.length > 200 ? currentValue.substring(0, 200) + '...' : currentValue);
        }
      } catch (e) {
        console.error('❌ [addArtist] Failed to get current KV store value:', e);
      }
      
      throw new Error(`KV store operation failed: ${kvError instanceof Error ? kvError.message : 'Unknown error'}`);
    }
  } catch (error) {
    console.error('❌ [addArtist] Error:', error);
    
    // Log additional error details
    if (error instanceof Error) {
      console.error('🔍 [addArtist] Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack?.split('\n').slice(0, 3).join('\n') + '...'
      });
    }
    
    throw new Error(`Failed to add artist: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function updateArtist(id: string, updates: UpdateArtistData): Promise<Artist | null> {
  try {
    console.log(`🔵 [updateArtist] Updating artist: ${id}`);
    
    if (!id) {
      throw new Error('Artist ID is required');
    }
    
    const artists = await getArtists();
    const index = artists.findIndex(a => a.id === id);
    
    if (index === -1) {
      console.warn(`⚠️ [updateArtist] Artist not found: ${id}`);
      return null;
    }
    
    // Sanitize and validate updates
    const sanitizedUpdates = ensureSerializable(updates);
    
    // Preserve the original creation date and ID
    const updatedArtist: Artist = {
      ...artists[index],
      ...sanitizedUpdates,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
      // Ensure required fields are not removed
      name: sanitizedUpdates.name || artists[index].name,
      email: sanitizedUpdates.email || artists[index].email,
      category: sanitizedUpdates.category || artists[index].category || 'Other',
      // Ensure arrays are properly initialized
      languages: Array.isArray(sanitizedUpdates.languages) 
        ? sanitizedUpdates.languages.filter(lang => typeof lang === 'string')
        : artists[index].languages || []
    };
    
    console.log(`🔄 [updateArtist] Updated artist data:`, {
      id: updatedArtist.id,
      name: updatedArtist.name,
      changes: Object.keys(sanitizedUpdates)
    });
    
    const updatedArtists = [...artists];
    updatedArtists[index] = updatedArtist;
    
    // Save the updated artists array
    const result = await kv.set(ARTISTS_KEY, updatedArtists);
    
    if (result !== 'OK') {
      throw new Error('Failed to save updated artist data');
    }
    
    console.log(`✅ [updateArtist] Successfully updated artist: ${id}`);
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
