/**
 * Simple in-memory vector store implementation
 * Workaround for LangChain 1.x export issues
 */

import { Embeddings } from '@langchain/core/embeddings';
import { Document } from '@langchain/core/documents';

interface MemoryVector {
  content: string;
  embedding: number[];
  metadata: Record<string, unknown>;
}

export class MemoryVectorStore {
  public memoryVectors: MemoryVector[] = [];
  private embeddings: Embeddings;

  constructor(embeddings: Embeddings) {
    this.embeddings = embeddings;
  }

  /**
   * Add documents to the vector store
   */
  async addDocuments(documents: Document[]): Promise<void> {
    // Generate embeddings for all documents
    const texts = documents.map(doc => doc.pageContent);
    const embeddings = await this.embeddings.embedDocuments(texts);

    // Store vectors with metadata
    for (let i = 0; i < documents.length; i++) {
      this.memoryVectors.push({
        content: documents[i].pageContent,
        embedding: embeddings[i],
        metadata: documents[i].metadata,
      });
    }
  }

  /**
   * Similarity search
   */
  async similaritySearchWithScore(
    query: string,
    k: number = 4,
    filter?: Record<string, unknown>
  ): Promise<[Document, number][]> {
    // Generate query embedding
    const queryEmbedding = await this.embeddings.embedQuery(query);

    // Calculate cosine similarity for all vectors
    const similarities = this.memoryVectors.map((vector, index) => ({
      index,
      score: this.cosineSimilarity(queryEmbedding, vector.embedding),
    }));

    // Sort by similarity (highest first)
    similarities.sort((a, b) => b.score - a.score);

    // Apply filter if provided
    let filtered = similarities;
    if (filter) {
      filtered = similarities.filter(item => {
        const vector = this.memoryVectors[item.index];
        return Object.entries(filter).every(
          ([key, value]) => vector.metadata[key] === value
        );
      });
    }

    // Take top k results
    const topK = filtered.slice(0, k);

    // Convert to documents with scores
    return topK.map(item => {
      const vector = this.memoryVectors[item.index];
      const doc = new Document({
        pageContent: vector.content,
        metadata: vector.metadata,
      });
      return [doc, item.score];
    });
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  /**
   * Create from texts (static factory method)
   */
  static async fromTexts(
    texts: string[],
    metadatas: Record<string, unknown>[] | Record<string, unknown>,
    embeddings: Embeddings
  ): Promise<MemoryVectorStore> {
    const store = new MemoryVectorStore(embeddings);
    const docs = texts.map((text, i) => {
      const metadata = Array.isArray(metadatas) ? metadatas[i] : metadatas;
      return new Document({ pageContent: text, metadata });
    });
    await store.addDocuments(docs);
    return store;
  }

  /**
   * Create from documents (static factory method)
   */
  static async fromDocuments(
    docs: Document[],
    embeddings: Embeddings
  ): Promise<MemoryVectorStore> {
    const store = new MemoryVectorStore(embeddings);
    await store.addDocuments(docs);
    return store;
  }
}
