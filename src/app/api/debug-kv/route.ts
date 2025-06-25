import { kv } from '@/lib/artists';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test KV get
    const currentValue = await kv.get('artists');
    
    // Test KV set with a simple value
    await kv.set('test-key', { test: 'value' });
    const testGet = await kv.get('test-key');
    
    return NextResponse.json({
      success: true,
      currentArtists: currentValue,
      testKey: testGet,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Debug KV error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Debug KV error',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
