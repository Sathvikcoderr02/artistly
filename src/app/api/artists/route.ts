import { NextResponse } from 'next/server';
import { getArtists, addArtist, updateArtist } from '@/lib/artists';

export const dynamic = 'force-dynamic'; // Ensure we get fresh data on each request

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
    const formData = await request.formData();
    
    // Handle file upload if exists
    const imageFile = formData.get('image') as File | null;
    let imageUrl = '';
    
    if (imageFile && imageFile.size > 0) {
      // In a real app, you would upload this to a storage service
      // For now, we'll just store the file name
      imageUrl = `/uploads/${Date.now()}-${imageFile.name}`;
    }

    // Parse fee from form data
    console.log('Raw form data:', Object.fromEntries(formData.entries()));
    
    let fee = 0;
    const feeValue = formData.get('fee');
    console.log('Raw fee value from form:', feeValue);
    
    if (feeValue) {
      // Convert to string and remove any non-numeric characters except decimal point
      const numericValue = String(feeValue).replace(/[^0-9.]/g, '');
      console.log('Numeric value after cleanup:', numericValue);
      
      // Convert to number
      fee = Math.max(0, Math.floor(Number(numericValue) || 0));
      console.log('Final fee number:', fee);
    }

    const artistData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      category: formData.get('category') as string,
      city: formData.get('city') as string,
      bio: formData.get('bio') as string || '',
      experience: formData.get('experience') as string || '',
      languages: (formData.get('languages') as string || '').split(',').map(lang => lang.trim()).filter(Boolean),
      fee: fee,
      imageUrl: imageUrl,
      image: imageUrl, // For backward compatibility
    };
    
    const newArtist = await addArtist(artistData);
    return NextResponse.json(newArtist, { status: 201 });
  } catch (error) {
    console.error('Error creating artist:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to create artist' 
      },
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
    console.error('Error updating artist status:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to update artist status' 
      },
      { status: 500 }
    );
  }
}
