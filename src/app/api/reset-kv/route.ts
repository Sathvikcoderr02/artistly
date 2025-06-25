import { kv } from '@/lib/artists';
import { NextResponse } from 'next/server';

// Helper function to test KV connection
async function testKVConnection() {
  try {
    const testKey = `kv-test-${Date.now()}`;
    const testValue = { test: 'connection', timestamp: new Date().toISOString() };
    
    // Test set operation
    await kv.set(testKey, testValue);
    
    // Test get operation
    const retrievedValue = await kv.get(testKey);
    
    // Test delete operation
    await kv.del(testKey);
    
    return {
      success: true,
      testKey,
      setValue: testValue,
      retrievedValue,
      match: JSON.stringify(testValue) === JSON.stringify(retrievedValue)
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorDetails: String(error)
    };
  }
}

export async function GET() {
  try {
    console.log('Testing KV connection...');
    
    // First, test the KV connection
    const connectionTest = await testKVConnection();
    
    if (!connectionTest.success) {
      throw new Error(`KV connection test failed: ${connectionTest.error}`);
    }
    
    console.log('KV connection test passed, resetting artists...');
    
    // Now reset the artists array
    await kv.set('artists', []);
    
    // Verify the reset
    const updatedArtists = await kv.get('artists');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Successfully reset artists KV store',
      timestamp: new Date().toISOString(),
      updatedValue: updatedArtists,
      connectionTest: {
        success: connectionTest.success,
        key: connectionTest.testKey,
        valueMatch: connectionTest.match
      }
    });
    
  } catch (error) {
    console.error('Error in reset-kv endpoint:', error);
    
    // Get KV environment variables (without sensitive values)
    const kvConfig = {
      hasRestApiUrl: !!process.env.KV_REST_API_URL,
      hasRestApiToken: !!process.env.KV_REST_API_TOKEN,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      vercelRegion: process.env.VERCEL_REGION
    };
    
    // Get more details about the error
    const errorDetails = {
      name: error instanceof Error ? error.name : 'UnknownError',
      message: error instanceof Error ? error.message : String(error),
      errorType: typeof error,
      kvConfig,
      timestamp: new Date().toISOString()
    };
    
    console.error('Error details:', JSON.stringify(errorDetails, null, 2));
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to reset KV store',
        details: errorDetails,
        suggestion: 'Check your KV store configuration and ensure the KV store is properly set up in your Vercel project.'
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
