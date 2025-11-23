import { NextResponse } from 'next/server';
import { documentMetadataStore } from '@/services/document-metadata-store';
import { metadataRegistry } from '@/services/metadata-registry';
import * as fs from 'fs/promises';
import * as path from 'path';

const isVercel = process.env.VERCEL === '1';
const CACHE_DIR = isVercel
  ? path.join('/tmp', 'metadata-cache')
  : path.join(process.cwd(), 'data', 'metadata-cache');
const CACHE_FILE = path.join(CACHE_DIR, 'blob-ids.json');

interface Transaction {
  id: string;
  timestamp: number;
  type: 'upload' | 'chat';
  userAddress: string;
  blobId?: string;
  suiTxId?: string;
  metadata?: {
    filename?: string;
    chatTitle?: string;
  };
}

export async function GET() {
  try {
    // Load file cache to get all users
    let allUsers: string[] = [];
    const documentUsers = new Set<string>();
    const chatUsers = new Set<string>();

    try {
      const data = await fs.readFile(CACHE_FILE, 'utf-8');
      const cacheData = JSON.parse(data);
      allUsers = Object.keys(cacheData);
    } catch {
      console.log('No cache file found, using empty data');
    }

    // Aggregate document data
    let totalDocuments = 0;
    const allDocumentTransactions: Transaction[] = [];

    for (const user of allUsers) {
      // Skip chat-specific keys (those with _registry or _chat suffix)
      if (user.includes('_registry') || user.includes('_chat')) {
        continue;
      }

      // Check if this is a document user (has _docs suffix or is a plain address)
      const isDocUser = user.endsWith('_docs') || !user.includes('_');
      if (!isDocUser) continue;

      const actualUserAddr = user.replace('_docs', '');
      documentUsers.add(actualUserAddr);

      try {
        const userIndex = await documentMetadataStore.loadUserIndex(actualUserAddr);
        if (userIndex && userIndex.documents) {
          totalDocuments += userIndex.documents.length;

          // Convert to transactions
          for (const doc of userIndex.documents) {
            allDocumentTransactions.push({
              id: doc.documentId,
              timestamp: doc.uploadedAt,
              type: 'upload',
              userAddress: actualUserAddr,
              blobId: doc.blobId,
              suiTxId: undefined, // Not stored in current schema
              metadata: {
                filename: doc.filename,
              },
            });
          }
        }
      } catch (error) {
        console.error(`Error loading documents for ${actualUserAddr}:`, error);
      }
    }

    // Count chat users (just for stats, no transactions needed)
    let totalChats = 0;

    for (const user of allUsers) {
      // Check if this is a chat registry key
      if (!user.includes('_registry')) continue;

      const actualUserAddr = user.replace('_registry', '');
      chatUsers.add(actualUserAddr);

      try {
        // Get chat metadata blob ID to verify registry exists
        const chatMetadataBlobId = await metadataRegistry.getMetadataBlobId(user);
        if (chatMetadataBlobId) {
          // Count this as a registered chat user (registry created)
          totalChats++;
        }
      } catch {
        console.error(`Error checking chat registry for ${actualUserAddr}`);
      }
    }

    // Combine all users
    const allUniqueUsers = new Set([...documentUsers, ...chatUsers]);

    // Only include document transactions (no chat transactions)
    const allTransactions = allDocumentTransactions
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 100); // Limit to 100 most recent

    const stats = {
      totalDocuments,
      totalUsers: allUniqueUsers.size,
      totalTransactions: allDocumentTransactions.length, // Only count document transactions
      totalChats,
    };

    return NextResponse.json({
      success: true,
      stats,
      transactions: allTransactions,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard stats',
        stats: {
          totalDocuments: 0,
          totalUsers: 0,
          totalTransactions: 0,
          totalChats: 0,
        },
        transactions: [],
      },
      { status: 500 }
    );
  }
}
