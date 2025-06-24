import { NextResponse } from 'next/server';
import { updateArtist } from '@/lib/artists';

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
      // In a real app, you would get this from the session
      reviewedBy: 'admin@example.com',
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
