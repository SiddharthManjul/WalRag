/**
 * API Route: Update Document BlobId
 * Updates document metadata with the RAG-generated blobId
 * This is needed because documents are uploaded to Walrus twice:
 * 1. Initial upload (for storage)
 * 2. RAG ingestion (creates vectors with different blobId)
 */

import { NextRequest, NextResponse } from 'next/server';
import { documentMetadataStore } from '@/services/document-metadata-store';

export async function POST(request: NextRequest) {
  try {
    const userAddress = request.headers.get('x-user-address');

    if (!userAddress) {
      return NextResponse.json(
        { error: 'User address required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { documentId, ragBlobId } = body;

    if (!documentId || !ragBlobId) {
      return NextResponse.json(
        { error: 'Missing required fields: documentId and ragBlobId' },
        { status: 400 }
      );
    }

    console.log(`🔄 Updating document ${documentId} with RAG blobId: ${ragBlobId}`);

    // First, verify the document exists
    const existingDoc = await documentMetadataStore.getDocumentMetadata(userAddress, documentId);

    if (!existingDoc) {
      console.error(`❌ Document ${documentId} not found in metadata for user ${userAddress}`);
      return NextResponse.json(
        { error: 'Document not found in metadata' },
        { status: 404 }
      );
    }

    console.log(`   Found document: ${existingDoc.filename}`);
    console.log(`   Old blobId: ${existingDoc.blobId}`);
    console.log(`   New blobId: ${ragBlobId}`);

    // Update the document metadata with the RAG blobId
    await documentMetadataStore.updateDocumentInIndex(userAddress, documentId, {
      blobId: ragBlobId,
    });

    // Verify the update
    const updatedDoc = await documentMetadataStore.getDocumentMetadata(userAddress, documentId);
    console.log(`✅ Document metadata updated successfully`);
    console.log(`   Verified new blobId: ${updatedDoc?.blobId}`);

    return NextResponse.json({
      success: true,
      message: 'BlobId updated successfully',
    });

  } catch (error) {
    console.error('❌ Failed to update blobId:', error);
    return NextResponse.json(
      {
        error: 'Failed to update blobId',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
