import { NextResponse } from 'next/server';
import { getArtists, addArtist, updateArtist } from '@/lib/artists';
import { put } from '@vercel/blob';

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
  imageUrl: string;  // For backward compatibility
  profileImage: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
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
        try {
          // Upload to Vercel Blob
          const blob = await put(
            `artists/${Date.now()}-${imageFile.name}`,
            imageFile,
            { access: 'public' }
          );
          imageUrl = blob.url;
          console.log('File uploaded to Vercel Blob:', imageUrl);
        } catch (error) {
          console.error('Error uploading to Vercel Blob:', error);
          throw new Error('Failed to upload profile image');
        }
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
      
      // Create artist data with proper types
      artistData = {
        name,
        category,
        city,
        fee: Number(getString('fee')),
        bio,
        experience,
        languages,
        email,
        phone,
        imageUrl: imageUrl,  // For backward compatibility
        profileImage: imageUrl,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reviewedAt: undefined,
        reviewedBy: undefined,
        rejectionReason: undefined
      };
    } else {
      // Parse JSON body
      const data = await request.json();
      
      // Log received data for debugging
      console.log('Received artist data:', data);
      
      // Validate required fields
      const requiredFields = [
        'name', 'category', 'city', 'fee', 'bio', 
        'experience', 'languages', 'email', 'phone'
      ];
      
      const missingFields = requiredFields.filter(field => !data[field]);
      
      if (missingFields.length > 0) {
        return NextResponse.json(
          { 
            error: 'Missing required fields',
            missingFields
          },
          { status: 400 }
        );
      }
      
      // Create artist data with proper types
      artistData = {
        name: data.name,
        category: data.category,
        city: data.city,
        fee: Number(data.fee),
        bio: data.bio,
        experience: data.experience,
        languages: Array.isArray(data.languages) 
          ? data.languages 
          : [data.languages].filter(Boolean),
        email: data.email,
        phone: data.phone,
        imageUrl: data.profileImage || '',  // For backward compatibility
        profileImage: data.profileImage || '',
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reviewedAt: undefined,
        reviewedBy: undefined,
        rejectionReason: undefined
      };
    }
    
    console.log('Creating artist with data:', artistData);
    const newArtist = await addArtist(artistData);
    console.log('Successfully created artist:', newArtist.id);
    
    return NextResponse.json(newArtist, { status: 201 });
  } catch (error) {
    console.error('Error in /api/artists POST:', error);
    
    // Log the full error with stack trace for debugging
    const errorObj = error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...(typeof error === 'object' && 'code' in error ? { code: String(error.code) } : {}),
      ...(typeof error === 'object' && 'status' in error ? { status: Number(error.status) } : {})
    } : error;
    
    // Safely stringify error object, handling circular references
    const getCircularReplacer = () => {
      const seen = new WeakSet();
      return (key: string, value: unknown) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular]';
          }
          seen.add(value);
        }
        return value;
      };
    };
    
    try {
      console.error('Error details:', JSON.stringify(errorObj, getCircularReplacer(), 2));
    } catch (stringifyError) {
      console.error('Failed to stringify error object:', stringifyError);
    }
    
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
        status: (error && typeof error === 'object' && 'status' in error && 
          typeof (error as { status: unknown }).status === 'number')
          ? (error as { status: number }).status 
          : 500 
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
