import { NextResponse } from 'next/server';
import { getArtists, addArtist, updateArtist } from '@/lib/artists';

export const dynamic = 'force-dynamic'; // Ensure we get fresh data on each request

interface ArtistFormData {
  name: string;
  email: string;
  phone: string;
  category: string;
  city: string;
  bio: string;
  experience: string;
  languages: string[];
  fee: number;
  imageUrl: string;
  image?: string;
}

export async function GET() {
  try {
    const artists = await getArtists();
    return NextResponse.json(artists);
  } catch (error) {
    console.error('Error fetching artists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch artists' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type');
    let artistData: ArtistFormData;

    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      
      // Handle file upload if exists
      let imageUrl = '';
      const imageFile = formData.get('image') as File | null;
      
      if (imageFile && imageFile.size > 0) {
        // In a real app, you would upload this to a storage service
        // For now, we'll just store a placeholder
        imageUrl = `/uploads/${Date.now()}-${imageFile.name}`;
      }
      
      // Get other form fields
      const name = formData.get('name') as string;
      const email = formData.get('email') as string;
      const phone = formData.get('phone') as string;
      const category = formData.get('category') as string;
      const city = formData.get('city') as string;
      const bio = (formData.get('bio') as string) || '';
      const experience = (formData.get('experience') as string) || '';
      const languages = (formData.get('languages') as string || '')
        .split(',')
        .map(lang => lang.trim())
        .filter(Boolean);
      
      // Parse fee
      let fee = 0;
      const feeValue = formData.get('fee') as string;
      if (feeValue) {
        const numericValue = feeValue.replace(/[^0-9.]/g, '');
        fee = Math.max(0, Math.floor(Number(numericValue) * 100) || 0);
      }
      
      artistData = {
        name,
        email,
        phone,
        category,
        city,
        bio,
        experience,
        languages,
        fee,
        imageUrl,
        image: imageUrl, // For backward compatibility
      };
    } else if (contentType?.includes('application/json')) {
      const jsonData = await request.json() as Partial<ArtistFormData>;

      artistData = {
        name: jsonData.name || '',
        email: jsonData.email || '',
        phone: jsonData.phone || '',
        category: jsonData.category || '',
        city: jsonData.city || '',
        bio: jsonData.bio || '',
        experience: jsonData.experience || '',
        languages: Array.isArray(jsonData.languages) 
          ? jsonData.languages 
          : (jsonData.languages || '').split(',').map((lang: string) => lang.trim()).filter(Boolean),
        fee: Math.max(0, Math.floor(Number(jsonData.fee) * 100) || 0),
        imageUrl: jsonData.imageUrl || '',
        image: jsonData.image || jsonData.imageUrl || '',
      };
    } else {
      return NextResponse.json(
        { error: 'Unsupported content type' },
        { status: 400 }
      );
    }

    const newArtist = await addArtist(artistData);
    return NextResponse.json(newArtist, { status: 201 });
  } catch (error) {
    console.error('Error creating artist:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create artist' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status, rejectionReason } = await request.json();

    if (!id || !status || (status === 'rejected' && !rejectionReason)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const updatedArtist = await updateArtist(id, { 
      status,
      rejectionReason: status === 'rejected' ? rejectionReason : undefined,
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'admin@example.com', // In a real app, get this from the session
    });

    if (!updatedArtist) {
      return NextResponse.json(
        { error: 'Artist not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedArtist);
  } catch (error) {
    console.error('Error updating artist:', error);
    return NextResponse.json(
      { error: 'Failed to update artist' },
      { status: 500 }
    );
  }
}
