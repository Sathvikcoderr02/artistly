import { kv } from '@/lib/artists';
import { NextResponse } from 'next/server';

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Not allowed in production' },
      { status: 403 }
    );
  }

  try {
    await kv.set('artists', []);
    return NextResponse.json({ 
      success: true, 
      message: 'Successfully reset artists KV store',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error resetting KV store:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to reset KV store',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
