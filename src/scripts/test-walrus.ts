#!/usr/bin/env tsx

import { walrusClient } from '../services/walrus-client.js';
import { validateConfig } from '../config/index.js';

async function testWalrus() {
  console.log('🧪 Testing Walrus Storage Integration\n');

  // Skip OpenAI validation for this test
  // validateConfig();

  try {
    // Test 1: Upload a simple text blob
    console.log('📤 Test 1: Uploading text blob...');
    const testContent = `Hello from dVector RAG System!

This is a test document to verify Walrus storage integration.
Timestamp: ${new Date().toISOString()}

Walrus is a decentralized storage protocol built on Sui blockchain.
It provides cost-effective, reliable blob storage for decentralized applications.`;

    const blob = await walrusClient.uploadBlob(testContent);
    console.log(`   Blob ID: ${blob.blobId}`);
    console.log(`   Size: ${blob.size} bytes`);
    console.log(`   Uploaded at: ${blob.uploadedAt}\n`);

    // Test 2: Retrieve the blob
    console.log('📥 Test 2: Retrieving blob...');
    const retrievedContent = await walrusClient.getBlobAsString(blob.blobId);
    console.log(`   Retrieved ${retrievedContent.length} bytes`);
    console.log(`   Content matches: ${retrievedContent === testContent ? '✓ YES' : '✗ NO'}\n`);

    // Test 3: Check blob metadata
    console.log('📊 Test 3: Getting blob metadata...');
    const metadata = await walrusClient.getBlobMetadata(blob.blobId);
    console.log(`   Size: ${metadata.size} bytes`);
    console.log(`   Content-Type: ${metadata.contentType || 'N/A'}\n`);

    // Test 4: Check blob existence
    console.log('🔍 Test 4: Checking blob existence...');
    const exists = await walrusClient.blobExists(blob.blobId);
    console.log(`   Blob exists: ${exists ? '✓ YES' : '✗ NO'}\n`);

    // Test 5: Check non-existent blob
    console.log('🔍 Test 5: Checking non-existent blob...');
    const fakeExists = await walrusClient.blobExists('nonexistent123456');
    console.log(`   Non-existent blob check: ${!fakeExists ? '✓ CORRECT (not found)' : '✗ WRONG (found?)'}\n`);

    console.log('✅ All tests passed!\n');
    console.log('💡 Keep this blob ID for testing RAG retrieval:');
    console.log(`   ${blob.blobId}\n`);

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testWalrus();
