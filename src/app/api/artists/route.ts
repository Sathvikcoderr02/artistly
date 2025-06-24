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
      console.log('Received form data with fields:', [...formData.keys()]);
      
      // Handle file upload if exists
      let imageUrl = '';
      const imageFile = formData.get('image') as File | null;
      
      if (imageFile && imageFile.size > 0) {
        console.log('Processing image file:', imageFile.name, imageFile.size, 'bytes');
        // In a real app, you would upload this to a storage service
        // For now, we'll just store a placeholder
        imageUrl = `/uploads/${Date.now()}-${imageFile.name}`;
      } else {
        console.log('No image file found in form data');
      }
      
      // Get other form fields with proper type checking and fallbacks
      const getString = (key: string): string => {
        const value = formData.get(key);
        return value ? value.toString() : '';
      };

      const name = getString('name');
      const email = getString('email');
      const phone = getString('phone');
      const category = getString('category');
      const city = getString('city');
      const bio = getString('bio');
      const experience = getString('experience');
      
      // Parse languages
      const languagesStr = getString('languages');
      const languages = languagesStr 
        ? languagesStr.split(',').map(lang => lang.trim()).filter(Boolean)
        : [];
      
      // Parse fee
      let fee = 0;
      const feeValue = getString('fee');
      if (feeValue) {
        const numericValue = feeValue.replace(/[^0-9.]/g, '');
        fee = Math.max(0, Math.floor(Number(numericValue) * 100) || 0);
        console.log(`Parsed fee: ${feeValue} -> ${fee} paise`);
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
    console.error('Error in /api/artists POST:', error);
    
    // Log the full error with stack trace
    const errorObj = error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name,
      // @ts-ignore
      code: error.code,
      // @ts-ignore
      status: error.status
    } : error;
    
    console.error('Error details:', JSON.stringify(errorObj, null, 2));
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'string' 
        ? error 
        : 'Failed to create artist';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        // Only include stack trace in development
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.stack : JSON.stringify(error)) : 
          undefined
      },
      { 
        status: error instanceof Error && 'status' in error ? 
          // @ts-ignore
          error.status : 500 
      }
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
