#!/usr/bin/env tsx

import { ragService } from '../services/rag-service.js';
import { vectorStoreService } from '../services/vector-store.js';
import { validateConfig } from '../config/index.js';
import * as readline from 'readline/promises';

async function queryRAG() {
  console.log('🤔 dVector RAG Query Interface\n');

  validateConfig();

  try {
    // Initialize vector store
    console.log('Loading vector store...');
    await vectorStoreService.initialize();

    const docCount = await vectorStoreService.getDocumentCount();
    console.log(`✓ Vector store loaded (${docCount} vectors)\n`);

    if (docCount === 0) {
      console.error('❌ No documents in vector store!');
      console.log('\nFirst ingest some documents:');
      console.log('  npm run ingest');
      process.exit(1);
    }

    // Create readline interface for interactive queries
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('Enter your questions (or "exit" to quit)\n');

    while (true) {
      const query = await rl.question('❓ Question: ');

      if (query.toLowerCase() === 'exit' || query.toLowerCase() === 'quit') {
        console.log('\nGoodbye! 👋\n');
        rl.close();
        break;
      }

      if (!query.trim()) {
        continue;
      }

      try {
        const result = await ragService.query({ query });

        console.log('\n' + '─'.repeat(60));
        console.log('💡 Answer:\n');
        console.log(result.answer);
        console.log('\n' + '─'.repeat(60));
        console.log('📚 Sources:\n');
        result.sources.forEach((source, index) => {
          console.log(`${index + 1}. ${source.filename} (relevance: ${source.score.toFixed(3)})`);
          console.log(`   Blob ID: ${source.blobId}`);
          console.log(`   Preview: ${source.content.substring(0, 100)}...`);
          console.log('');
        });
        console.log('⏱️  Processing time:', result.metadata.processingTime, 'ms');
        console.log('─'.repeat(60) + '\n');

      } catch (error) {
        console.error('\n❌ Query failed:', error);
        console.log('');
      }
    }

  } catch (error) {
    console.error('\n❌ Failed to initialize:', error);
    process.exit(1);
  }
}

queryRAG();
