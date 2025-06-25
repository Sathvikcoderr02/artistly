import { kv } from '@/lib/artists';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if KV is initialized
    if (!kv) {
      return NextResponse.json({
        success: false,
        error: 'KV client not initialized',
        env: {
          KV_REST_API_URL: process.env.KV_REST_API_URL ? '✅ Set' : '❌ Missing',
          KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN ? '✅ Set' : '❌ Missing',
          NODE_ENV: process.env.NODE_ENV || 'development',
          VERCEL_ENV: process.env.VERCEL_ENV || 'development',
        },
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Test KV operations
    const testKey = `test-${Date.now()}`;
    const testValue = { test: 'value', timestamp: Date.now() };
    
    await kv.set(testKey, testValue);
    const retrievedValue = await kv.get(testKey);
    await kv.del(testKey);
    
    const currentArtists = await kv.get('artists');
    
    return NextResponse.json({
      success: true,
      env: {
        KV_REST_API_URL: process.env.KV_REST_API_URL ? '✅ Set' : '❌ Missing',
        KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN ? '✅ Set' : '❌ Missing',
        NODE_ENV: process.env.NODE_ENV || 'development',
        VERCEL_ENV: process.env.VERCEL_ENV || 'development',
      },
      kvTest: {
        set: '✅ Success',
        get: retrievedValue ? '✅ Success' : '❌ Failed',
        del: '✅ Success',
        testKey,
        testValue,
        retrievedValue,
      },
      currentArtists: currentArtists ? '✅ Data exists' : '❌ No data',
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
