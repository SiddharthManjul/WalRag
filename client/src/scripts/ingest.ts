#!/usr/bin/env node
/**
 * Multi-format document ingestion script
 *
 * Supported formats: .txt, .md, .pdf, .docx, .doc, .json, .csv, .html, .htm, .xml
 *
 * Usage:
 *   npm run ingest                    - Auto-ingest all supported files from documents/ folder
 *   npm run ingest path/to/file.pdf   - Ingest a specific file (any supported format)
 */

import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
loadEnv({ path: resolve(process.cwd(), '.env.local') });

import { vectorStoreService } from '../services/vector-store';
import { ragService } from '../services/rag-service';
import { documentLoader } from '../services/document-loader';
import * as fs from 'fs/promises';
import * as path from 'path';

const DOCUMENTS_FOLDER = './documents';

/**
 * Ingest a single file
 */
async function ingestFile(filepath: string): Promise<void> {
  console.log(`\n📄 Processing file: ${filepath}`);

  // Check if file is supported
  const filename = path.basename(filepath);
  if (!documentLoader.isSupported(filename)) {
    const supported = documentLoader.getSupportedExtensions().join(', ');
    throw new Error(`Unsupported file type. Supported formats: ${supported}`);
  }

  // Load document using appropriate loader
  const { content, metadata } = await documentLoader.loadDocument(filepath);

  console.log(`   Ingesting...`);

  const result = await ragService.ingestDocument(content, {
    filename: metadata.filename,
    fileType: metadata.fileType,
  });

  console.log(`   ✅ Ingested successfully!`);
  console.log(`      Blob ID: ${result.blobId}`);
  console.log(`      File Type: ${metadata.fileType}`);
  console.log(`      Size: ${result.metadata.size} bytes`);
  if (metadata.pageCount) {
    console.log(`      Pages: ${metadata.pageCount}`);
  }
}

/**
 * Auto-ingest all files from documents/ folder
 */
async function autoIngestFromDocuments(): Promise<void> {
  console.log(`\n🔍 Scanning documents folder: ${DOCUMENTS_FOLDER}`);

  // Check if documents folder exists
  try {
    await fs.access(DOCUMENTS_FOLDER);
  } catch {
    console.error(`❌ Documents folder not found: ${DOCUMENTS_FOLDER}`);
    console.error('   Please create a "documents/" folder and add files to ingest.');
    process.exit(1);
  }

  // Read all files from documents folder
  const entries = await fs.readdir(DOCUMENTS_FOLDER, { withFileTypes: true });
  const allFiles = entries
    .filter(entry => entry.isFile() && !entry.name.startsWith('.'))
    .map(entry => entry.name);

  // Filter by supported file types
  const files = allFiles
    .filter(filename => documentLoader.isSupported(filename))
    .map(filename => path.join(DOCUMENTS_FOLDER, filename));

  const unsupportedFiles = allFiles.filter(filename => !documentLoader.isSupported(filename));

  if (unsupportedFiles.length > 0) {
    console.log('   ⚠️  Skipping unsupported files:');
    unsupportedFiles.forEach(file => console.log(`      - ${file}`));
    console.log(`   Supported formats: ${documentLoader.getSupportedExtensions().join(', ')}`);
  }

  if (files.length === 0) {
    console.log('   ⚠️  No supported files found in documents folder');
    console.log(`   Supported formats: ${documentLoader.getSupportedExtensions().join(', ')}`);
    process.exit(0);
  }

  console.log(`\n   Found ${files.length} supported file(s) to ingest:`);
  files.forEach(file => {
    const ext = path.extname(file);
    console.log(`      - ${path.basename(file)} (${ext})`);
  });

  // Initialize vector store once
  if (!vectorStoreService.isInitialized()) {
    console.log('\n🔧 Initializing vector store...');
    await vectorStoreService.initialize();
  }

  // Ingest each file
  console.log('\n📥 Starting batch ingestion...');
  let successCount = 0;
  let errorCount = 0;

  for (const filepath of files) {
    try {
      await ingestFile(filepath);
      successCount++;
    } catch (error) {
      console.error(`   ❌ Failed to ingest ${path.basename(filepath)}:`,
        error instanceof Error ? error.message : 'Unknown error');
      errorCount++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Batch Ingestion Complete');
  console.log('='.repeat(60));
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);

  const stats = vectorStoreService.getStats();
  console.log(`   📦 Total vectors in store: ${stats.totalVectors}`);
  console.log('');
}

/**
 * Main function
 */
async function main() {
  const filepath = process.argv[2];

  try {
    if (!filepath) {
      // No file specified - auto-ingest from documents folder
      await autoIngestFromDocuments();
    } else {
      // Single file mode
      if (!vectorStoreService.isInitialized()) {
        console.log('Initializing vector store...');
        await vectorStoreService.initialize();
      }

      await ingestFile(filepath);

      const stats = vectorStoreService.getStats();
      console.log(`\n📊 Total vectors in store: ${stats.totalVectors}\n`);
    }
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

main();
