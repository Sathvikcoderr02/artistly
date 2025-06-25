import { kv } from '@/lib/artists';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Attempting to reset KV store...');
    
    // First, try to get the current value to verify KV access
    const currentArtists = await kv.get('artists');
    console.log('Current artists value:', currentArtists);
    
    // Try setting a test value
    const testKey = `kv-test-${Date.now()}`;
    await kv.set(testKey, { test: 'value', timestamp: new Date().toISOString() });
    console.log(`Test key ${testKey} set successfully`);
    
    // Now reset the artists array
    const result = await kv.set('artists', []);
    console.log('KV set result:', result);
    
    // Verify the reset
    const updatedArtists = await kv.get('artists');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Successfully reset artists KV store',
      timestamp: new Date().toISOString(),
      previousValue: currentArtists,
      updatedValue: updatedArtists,
      testKey: { key: testKey, value: await kv.get(testKey) }
    });
    
  } catch (error) {
    console.error('Error in reset-kv endpoint:', error);
    
    // Get more details about the error
    const errorDetails = {
      name: error instanceof Error ? error.name : 'UnknownError',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      errorType: typeof error,
      errorString: String(error)
    };
    
    console.error('Error details:', errorDetails);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to reset KV store',
        details: errorDetails,
        timestamp: new Date().toISOString()
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-KV-Error': 'true'
        }
      }
    );
  }
}
