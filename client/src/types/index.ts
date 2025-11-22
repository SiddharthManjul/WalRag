export interface WalrusBlob {
  blobId: string;
  size: number;
  uploadedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface EncryptionMetadata {
  sealEncryptedObjectId: string;
  encryptionAlgorithm: 'aes' | 'hmac';
  threshold: number;
  keyServerIds: string[];
  accessPolicyId: string;
  encryptedAt: number;
}

export interface StoredDocument {
  id: string;
  blobId: string;
  filename: string;
  content: string;
  metadata: {
    uploadedAt: Date;
    fileType: string;
    size: number;
    owner?: string;
    isEncrypted?: boolean;
    isPrivate?: boolean;
    accessPolicy?: string;
    encryptionMetadata?: EncryptionMetadata;
  };
}

export interface EmbeddingResult {
  embedding: number[];
  text: string;
  metadata: Record<string, unknown>;
}

export interface RAGQuery {
  query: string;
  topK?: number;
  filter?: Record<string, unknown>;
}

export interface RAGResult {
  answer: string;
  sources: Array<{
    blobId: string;
    filename: string;
    content: string;
    score: number;
  }>;
  metadata: {
    processingTime: number;
    documentsRetrieved: number;
  };
}

export interface AccessControlPolicy {
  documentId: string;
  owner: string;
  allowedUsers: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  policyObjectId?: string; // Sui object ID for the policy
}

export interface ChatEncryptionMetadata {
  sealEncryptedObjectId: string;
  accessPolicyId: string;
  encryptedAt: number;
}

export interface ChatMetadata {
  chatId: string;
  title: string;
  created_at: number;
  last_activity: number;
  message_count: number;
  messages_blob_id: string;
  owner: string;
  isPrivate?: boolean;
  linkedDocumentId?: string;
  encryptionMetadata?: ChatEncryptionMetadata;
}
