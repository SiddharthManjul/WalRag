import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-helpers';
import { documentMetadataStore } from '@/services/document-metadata-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required. Please login first.' },
        { status: 401 }
      );
    }

    // Get all documents for this user
    const documents = await documentMetadataStore.getAllDocuments(user.userAddr);

    return NextResponse.json({
      success: true,
      documents: documents.map(doc => ({
        documentId: doc.documentId,
        filename: doc.filename,
        fileType: doc.fileType,
        size: doc.size,
        pageCount: doc.pageCount,
        blobId: doc.blobId,
        uploadedAt: doc.uploadedAt,
        lastAccessed: doc.lastAccessed,
        chunkCount: doc.chunkCount,
      })),
      total: documents.length,
    });

  } catch (error: any) {
    console.error('Error listing documents:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list documents' },
      { status: 500 }
    );
  }
}
