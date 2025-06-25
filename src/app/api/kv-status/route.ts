import { kv } from '@/lib/artists';
import { NextResponse } from 'next/server';

export async function GET() {
  const testKey = `kv-test-${Date.now()}`;
  const testValue = { test: 'connection', timestamp: new Date().toISOString() };
  
  try {
    // Test set operation
    await kv.set(testKey, testValue);
    
    // Test get operation
    const retrievedValue = await kv.get(testKey);
    
    // Test delete operation
    await kv.del(testKey);
    
    const isKVWorking = JSON.stringify(testValue) === JSON.stringify(retrievedValue);
    
    return NextResponse.json({
      success: true,
      status: isKVWorking ? 'KV store is working correctly' : 'KV store returned unexpected value',
      test: {
        key: testKey,
        setValue: testValue,
        retrievedValue,
        valuesMatch: isKVWorking,
        timestamp: new Date().toISOString()
      },
      suggestion: isKVWorking ? null : 'KV store is accessible but returned unexpected data. Check your KV store configuration.'
    });
    
  } catch (error) {
    console.error('KV status check failed:', error);
    
    // Try to get environment info (without sensitive data)
    const envInfo = {
      hasKvUrl: !!process.env.KV_REST_API_URL,
      hasKvToken: !!process.env.KV_REST_API_TOKEN,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      vercelRegion: process.env.VERCEL_REGION
    };
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to access KV store',
        message: error instanceof Error ? error.message : 'Unknown error',
        env: envInfo,
        timestamp: new Date().toISOString(),
        suggestion: [
          '1. Check your Vercel project settings',
          '2. Verify KV store is linked to your project',
          '3. Check environment variables in Vercel',
          '4. Ensure KV store is properly provisioned'
        ]
      },
      { status: 500 }
    );
  }
}
