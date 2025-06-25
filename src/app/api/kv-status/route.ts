import { kv } from '@/lib/artists';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Just try to get the KV store stats
    const stats = await kv.info();
    
    return NextResponse.json({
      success: true,
      status: 'KV store is accessible',
      stats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('KV status check failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to access KV store',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        suggestion: 'Check your KV store configuration in Vercel and ensure the KV store is properly linked to this project.'
      },
      { status: 500 }
    );
  }
}
