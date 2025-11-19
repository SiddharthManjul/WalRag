/**
 * Simple Walrus upload endpoint (no RAG, no Sui registration)
 * Just uploads file to Walrus and returns blob ID
 * Used by transaction-based upload flow
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-helpers';
import { WalrusClient } from '@/services/walrus-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required. Please login first.' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Walrus only (no RAG processing)
    const walrusClient = new WalrusClient();
    const walrusResult = await walrusClient.uploadBlob(buffer);

    console.log(`[Walrus Upload] ${file.name} → ${walrusResult.blobId.slice(0, 20)}...`);

    return NextResponse.json({
      success: true,
      blobId: walrusResult.blobId,
      filename: file.name,
      fileType: file.type,
      size: file.size,
    });

  } catch (error) {
    console.error('Walrus upload error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Upload failed',
      },
      { status: 500 }
    );
  }
}
