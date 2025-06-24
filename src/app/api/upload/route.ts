import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  console.log('Upload request received');
  
  // Check content type
  const contentType = request.headers.get('content-type');
  if (!contentType?.includes('multipart/form-data')) {
    console.error('Invalid content type:', contentType);
    return NextResponse.json(
      { error: 'Invalid content type. Expected multipart/form-data' },
      { status: 400 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    console.log('Received file:', file ? {
      name: file.name,
      type: file.type,
      size: file.size
    } : 'No file');

    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: 'No file provided or file is empty' },
        { status: 400 }
      );
    }

    // Create a unique filename
    const fileName = `artists/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    
    console.log('Uploading file to Vercel Blob:', fileName);
    
    // Upload the file to Vercel Blob
    const blob = await put(fileName, file, {
      access: 'public',
    });

    console.log('File uploaded successfully:', blob.url);
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
