/**
 * Metadata Registry - Sui-Based Persistent Storage
 * Stores user metadata blob IDs on Sui blockchain
 * Provides automatic fallback and works on all platforms
 */

import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { config } from '@/config';

// Server-side cache (ephemeral, for performance)
const serverCache = new Map<string, string>();

export interface MetadataRegistryEntry {
  userAddr: string;
  metadataBlobId: string;
  lastUpdated: number;
}

/**
 * Metadata Registry Service
 * Manages user → metadata blob ID mappings on Sui
 */
export class MetadataRegistry {
  private client: SuiClient;
  private keypair: Ed25519Keypair;
  private packageId: string;
  private registryObjectId: string;

  constructor() {
    this.client = new SuiClient({ url: config.sui.rpcUrl });

    // Initialize keypair
    const privateKey = config.sui.privateKey;
    if (privateKey.startsWith('suiprivkey')) {
      this.keypair = Ed25519Keypair.fromSecretKey(privateKey);
    } else {
      const privateKeyBytes = privateKey.startsWith('0x')
        ? Buffer.from(privateKey.slice(2), 'hex')
        : Buffer.from(privateKey, 'base64');
      this.keypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
    }

    this.packageId = config.sui.chatRegistryPackageId;
    this.registryObjectId = config.sui.chatRegistryObjectId;
  }

  /**
   * Get metadata blob ID with automatic fallback chain
   * 1. Server cache (fastest)
   * 2. Sui blockchain (reliable)
   * 3. Return null (new user)
   */
  async getMetadataBlobId(userAddr: string): Promise<string | null> {
    // Layer 1: Check server cache (fastest)
    const cached = serverCache.get(userAddr);
    if (cached) {
      console.log(`[Cache Hit] Found metadata blob ID for ${userAddr.slice(0, 10)}...`);
      return cached;
    }

    // Layer 2: Query Sui blockchain (reliable, survives restarts)
    try {
      const blobId = await this.queryFromSui(userAddr);
      if (blobId) {
        console.log(`[Sui Hit] Found metadata blob ID for ${userAddr.slice(0, 10)}...`);
        // Cache for future requests
        serverCache.set(userAddr, blobId);
        return blobId;
      }
    } catch (error) {
      console.error('Error querying Sui for metadata blob ID:', error);
    }

    // Layer 3: Not found (new user)
    console.log(`[New User] No metadata blob ID for ${userAddr.slice(0, 10)}...`);
    return null;
  }

  /**
   * Store metadata blob ID on Sui blockchain
   */
  async setMetadataBlobId(userAddr: string, blobId: string): Promise<void> {
    try {
      // Store on Sui blockchain
      await this.storeOnSui(userAddr, blobId);

      // Update server cache
      serverCache.set(userAddr, blobId);

      console.log(`[Stored] Metadata blob ID for ${userAddr.slice(0, 10)}... → ${blobId.slice(0, 20)}...`);
    } catch (error) {
      console.error('Error storing metadata blob ID on Sui:', error);
      // Still cache locally even if Sui fails
      serverCache.set(userAddr, blobId);
    }
  }

  /**
   * Query metadata blob ID from Sui using events
   * More reliable than dynamic field queries
   * Handles both regular keys (chats) and suffixed keys (documents)
   */
  private async queryFromSui(userAddr: string): Promise<string | null> {
    try {
      // Check if this is a document key (has _docs suffix)
      const isDocKey = userAddr.endsWith('_docs');
      const actualAddr = isDocKey ? userAddr.slice(0, -5) : userAddr;
      const keyPrefix = isDocKey ? 'docs:' : 'chat:';

      // Query MetadataUpdated events for this user
      const events = await this.client.queryEvents({
        query: {
          MoveEventType: `${this.packageId}::metadata_registry::MetadataUpdated`,
        },
        limit: 1000,
        order: 'descending', // Most recent first
      });

      // Find most recent event for this user with matching prefix
      for (const event of events.data) {
        const eventData = event.parsedJson as any;
        if (eventData.user_address === actualAddr) {
          const blobId = eventData.metadata_blob_id;
          // Check if blob ID matches the expected type
          if (blobId.startsWith(keyPrefix)) {
            // Return blob ID without prefix
            return blobId.slice(keyPrefix.length);
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error querying Sui events:', error);
      return null;
    }
  }

  /**
   * Store metadata blob ID on Sui by emitting event
   * Handles both regular keys (chats) and suffixed keys (documents)
   */
  private async storeOnSui(userAddr: string, blobId: string): Promise<void> {
    const tx = new Transaction();

    // Check if this is a document key (has _docs suffix)
    const isDocKey = userAddr.endsWith('_docs');
    const actualAddr = isDocKey ? userAddr.slice(0, -5) : userAddr;
    const keyPrefix = isDocKey ? 'docs:' : 'chat:';

    // Add prefix to blob ID to differentiate between chats and documents
    const prefixedBlobId = keyPrefix + blobId;

    // Call function that emits MetadataUpdated event
    tx.moveCall({
      target: `${this.packageId}::metadata_registry::update_metadata`,
      arguments: [
        tx.pure.address(actualAddr), // Use actual address without suffix
        tx.pure.string(prefixedBlobId), // Use prefixed blob ID
      ],
    });

    try {
      await this.client.signAndExecuteTransaction({
        transaction: tx,
        signer: this.keypair,
      });
    } catch (error) {
      // If Move call fails, it might be because the module doesn't exist
      // For MVP, we can continue without Sui storage (cache-only mode)
      console.warn('Sui storage unavailable, using cache-only mode:', error);
    }
  }

  /**
   * Clear server cache (for testing/development)
   */
  clearCache(): void {
    serverCache.clear();
    console.log('[Cache Cleared]');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: serverCache.size,
      entries: Array.from(serverCache.keys()).map(k => k.slice(0, 10) + '...'),
    };
  }
}

// Export singleton
export const metadataRegistry = new MetadataRegistry();
