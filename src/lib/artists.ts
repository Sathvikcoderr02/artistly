import { Artist, ApprovalStatus } from '@/types/artist';
import { promises as fs } from 'fs';
import path from 'path';

type UpdateArtistData = {
  status: ApprovalStatus;
  rejectionReason?: string;
  reviewedAt?: string;
  reviewedBy?: string;
};

const dataFilePath = path.join(process.cwd(), 'data/artists.json');

// Ensure data directory exists
async function ensureDataFile() {
  try {
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    try {
      await fs.access(dataFilePath);
    } catch {
      // File doesn't exist, create it with empty array
      await fs.writeFile(dataFilePath, JSON.stringify([], null, 2));
    }
  } catch (error) {
    console.error('Error ensuring data file:', error);
    throw error;
  }
}

export async function getArtists(): Promise<Artist[]> {
  await ensureDataFile();
  const fileContents = await fs.readFile(dataFilePath, 'utf8');
  return JSON.parse(fileContents);
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
  await fs.writeFile(dataFilePath, JSON.stringify(artists, null, 2));
  return newArtist;
}

export async function updateArtist(id: string, updates: UpdateArtistData): Promise<Artist | null> {
  const artists = await getArtists();
  const index = artists.findIndex(a => a.id === id);
  
  if (index === -1) return null;
  
  const updatedArtist: Artist = {
    ...artists[index],
    ...updates,
  };
  
  artists[index] = updatedArtist;
  await fs.writeFile(dataFilePath, JSON.stringify(artists, null, 2));
  return updatedArtist;
}

export async function getArtistById(id: string): Promise<Artist | null> {
  const artists = await getArtists();
  return artists.find(artist => artist.id === id) || null;
}
