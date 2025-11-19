/**
 * API endpoint for confirming document upload after transaction execution
 * Stores document metadata in the metadata store
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-helpers';
import { documentMetadataStore } from '@/services/document-metadata-store';

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

    // Parse request body
    const body = await request.json();
    const {
      documentId,
      filename,
      fileType,
      fileSize,
      walrusBlobId,
      vectorsBlobId,
      pageCount,
      chunkCount,
      transactionDigest,
    } = body;

    if (!documentId || !filename || !fileSize || !walrusBlobId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Store document metadata
    await documentMetadataStore.addDocumentToIndex(user.userAddr, {
      documentId,
      filename,
      fileType: fileType || 'application/octet-stream',
      size: fileSize,
      pageCount,
      blobId: walrusBlobId,
      vectorsBlobId,
      uploadedAt: Date.now(),
      lastAccessed: Date.now(),
      chunkCount: chunkCount || 0,
      owner: user.userAddr,
    });

    console.log(`[Document Confirmed] ${filename} for user ${user.userAddr}`);
    console.log(`[Transaction] ${transactionDigest}`);

    return NextResponse.json({
      success: true,
      message: 'Document registered successfully on blockchain',
      documentId,
      transactionDigest,
    });
  } catch (error: any) {
    console.error('Failed to confirm document upload:', error);
    return NextResponse.json(
      {
        error: 'Failed to confirm document upload',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
