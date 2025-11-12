#!/usr/bin/env tsx

import chalk from 'chalk';
import * as fs from 'fs/promises';
import * as path from 'path';

async function setup() {
  console.log(chalk.bold.blue('\n🚀 dVector Setup Wizard\n'));

  // Check if .env exists
  const envExists = await fs.access('.env').then(() => true).catch(() => false);

  if (!envExists) {
    console.log(chalk.yellow('📝 Creating .env file from template...'));
    await fs.copyFile('.env.example', '.env');
    console.log(chalk.green('✓ Created .env file\n'));
  } else {
    console.log(chalk.green('✓ .env file exists\n'));
  }

  // Create directories
  console.log(chalk.yellow('📁 Creating directories...'));
  await fs.mkdir('./documents', { recursive: true });
  await fs.mkdir('./data', { recursive: true });
  console.log(chalk.green('✓ Directories created\n'));

  // Create sample document
  const sampleDoc = `# Welcome to dVector!

This is a sample document to test the RAG system.

## What is dVector?

dVector is a decentralized RAG (Retrieval-Augmented Generation) system that uses:

- **Walrus**: Decentralized blob storage on Sui blockchain
- **Seal**: Access control and encryption for sensitive documents
- **FAISS**: Fast vector similarity search
- **Langchain**: RAG pipeline orchestration
- **OpenAI**: Embeddings and language models

## Key Features

1. **Cost-Effective Storage**: 80-100x cheaper than traditional cloud storage
2. **Decentralized**: No single point of failure
3. **Access Control**: Permission-based document access with Seal
4. **Fast Retrieval**: Sub-50ms document retrieval from Walrus
5. **Scalable**: Handle millions of documents

## How It Works

When you ask a question:
1. Your query is converted to an embedding vector
2. Similar document chunks are found in the vector store
3. Full documents are retrieved from Walrus storage
4. The LLM generates an answer using the retrieved context

## Getting Started

Try asking questions like:
- "What is dVector?"
- "What are the key features?"
- "How does it work?"

Happy querying! 🎉
`;

  const samplePath = './documents/welcome.md';
  const sampleExists = await fs.access(samplePath).then(() => true).catch(() => false);

  if (!sampleExists) {
    await fs.writeFile(samplePath, sampleDoc);
    console.log(chalk.green('✓ Created sample document: documents/welcome.md\n'));
  }

  // Print next steps
  console.log(chalk.bold.blue('📋 Setup Complete!\n'));
  console.log(chalk.bold('Next steps:\n'));
  console.log('1. Configure your environment:');
  console.log(chalk.cyan('   nano .env'));
  console.log('   (Add your OPENAI_API_KEY)\n');

  console.log('2. Test Walrus connection:');
  console.log(chalk.cyan('   npm run test\n'));

  console.log('3. Ingest sample document:');
  console.log(chalk.cyan('   npm run ingest\n'));

  console.log('4. Query the RAG system:');
  console.log(chalk.cyan('   npm run query\n'));

  console.log(chalk.bold.yellow('⚠️  Important:'));
  console.log('Make sure you have:');
  console.log('  - OpenAI API key (required)');
  console.log('  - Sui wallet set up (for Seal integration later)');
  console.log('  - Walrus CLI installed (optional, for direct testing)\n');

  console.log(chalk.bold.green('🎯 You\'re ready to start building!\n'));
}

setup().catch(console.error);
