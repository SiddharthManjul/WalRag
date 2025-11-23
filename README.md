# Storarc

**A Decentralized RAG System Built on Walrus and Sui**

Storarc is a next-generation Retrieval-Augmented Generation (RAG) platform that combines the power of AI with decentralized storage and blockchain technology to create a secure, permanent, and censorship-resistant knowledge base.

---

## 📖 Table of Contents

- [What is Storarc?](#what-is-storarc)
- [Why Storarc? The Problem with Traditional RAG](#why-storarc-the-problem-with-traditional-rag)
- [How It's Built](#how-its-built)
- [How It Works](#how-it-works)
- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

---

## 🎯 What is Storarc?

Storarc is a **decentralized Retrieval-Augmented Generation (RAG) system** that stores documents on Walrus (decentralized storage), indexes metadata on the Sui blockchain, and provides AI-powered semantic search and chat capabilities.

Unlike traditional RAG systems that rely on centralized cloud storage (S3, GCS) and proprietary databases, Storarc ensures:

- **Permanent Storage**: Documents stored on Walrus are immutable and permanent
- **Decentralized Ownership**: You control your data through blockchain-based access control
- **Censorship Resistance**: No single entity can remove or modify your documents
- **Verifiable Provenance**: All document metadata and access history is recorded on-chain
- **Privacy & Encryption**: Optional SEAL encryption for sensitive documents

### Key Use Cases

- **Research & Academia**: Build permanent, citable knowledge bases
- **Enterprise Knowledge Management**: Decentralized internal wikis and documentation
- **Legal & Compliance**: Immutable document storage with audit trails
- **Decentralized AI**: Train and query AI models on community-owned data
- **Personal Knowledge Vaults**: Own your second brain

---

## 🚨 Why Storarc? The Problem with Traditional RAG

### Traditional RAG Systems Have Critical Flaws

| Problem | Traditional RAG | Storarc Solution |
|---------|----------------|------------------|
| **Data Permanence** | Files can be deleted, modified, or corrupted | Immutable storage on Walrus ensures permanence |
| **Centralized Control** | Cloud providers control access and availability | Blockchain-based ownership and access control |
| **Vendor Lock-in** | Tied to specific cloud providers (AWS, Azure, GCP) | Open protocol built on decentralized infrastructure |
| **Censorship Risk** | Providers can remove content arbitrarily | Censorship-resistant by design |
| **Privacy Concerns** | Your data analyzed by cloud providers | Client-side encryption with SEAL protocol |
| **Cost Unpredictability** | Recurring cloud storage costs that scale indefinitely | One-time storage payment on Walrus with predictable renewal |
| **Single Point of Failure** | Outages affect entire system | Distributed storage across Walrus nodes |
| **No Ownership Proof** | You trust the provider to maintain your data | Cryptographic proof of ownership on Sui blockchain |

### Why This Matters

1. **AI Training Data Should Be Permanent**: Knowledge should outlive platforms
2. **Users Should Own Their Data**: Not rent access to it
3. **Transparency is Essential**: Provenance and history should be verifiable
4. **Privacy is a Right**: Encryption should be default, not optional
5. **Decentralization Prevents Abuse**: No single entity should control information

---

## 🏗️ How It's Built

Storarc combines cutting-edge decentralized technologies with proven AI models:

### Tech Stack

#### Frontend & Backend
- **Next.js 15**: Modern React framework with App Router
- **TypeScript**: Type-safe development
- **TailwindCSS**: Responsive UI styling

#### AI & Embeddings
- **OpenAI GPT-4**: Language model for chat and generation
- **OpenAI Embeddings (text-embedding-3-small)**: Vector embeddings for semantic search
- **LangChain**: AI orchestration and RAG pipeline

#### Decentralized Infrastructure
- **Walrus**: Decentralized blob storage (Mysten Labs)
- **Sui Blockchain**: Metadata registry and access control
- **SEAL Protocol**: Decentralized encryption and key management

#### Vector Database
- **Faiss**: High-performance vector similarity search (local cache)
- **Custom Vector Store**: Hybrid on-chain/off-chain architecture

#### Wallet Integration
- **Sui Wallet Adapter**: Web3 authentication
- **@mysten/dapp-kit**: Sui blockchain interaction

---

## ⚙️ How It Works

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                        │
│  (Next.js Frontend + Sui Wallet Authentication)             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    STORARC BACKEND                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Document     │  │ Vector       │  │ Chat         │      │
│  │ Upload       │  │ Search       │  │ Service      │      │
│  │ Service      │  │ Service      │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   WALRUS    │  │ SUI         │  │  OPENAI     │
│  (Storage)  │  │ (Registry)  │  │  (AI/LLM)   │
└─────────────┘  └─────────────┘  └─────────────┘
```

### Data Flow

#### 1. Document Upload Flow

```
User uploads file
    ↓
File processed & chunked
    ↓
Chunks → OpenAI → Embeddings
    ↓
Raw file → Walrus Storage → Blob ID
    ↓
Embeddings + Metadata → Local Vector Store (Faiss)
    ↓
Registry entry → Sui Blockchain (Document ID, Blob ID, Hash)
    ↓
Success ✓
```

#### 2. Query Flow

```
User asks question
    ↓
Query → OpenAI → Query Embedding
    ↓
Vector Store → Similarity Search → Top K relevant chunks
    ↓
Chunks + User Query → OpenAI GPT-4 → Generated Answer
    ↓
Answer + Sources returned to user
```

#### 3. Chat Persistence Flow

```
User creates chat
    ↓
Chat messages stored in memory
    ↓
Messages serialized → JSON
    ↓
JSON uploaded to Walrus → Blob ID
    ↓
Chat metadata → Sui Registry (Title, Blob ID, Timestamp)
    ↓
On reload: Fetch metadata → Download from Walrus → Restore chat
```

### Key Innovations

#### Hybrid Storage Architecture

**Problem**: Full on-chain storage is expensive; full off-chain storage lacks verifiability.

**Solution**:
- **Heavy Data (documents, vectors) → Walrus**: Cost-effective decentralized storage
- **Light Metadata (hashes, pointers, access control) → Sui**: Blockchain verification
- **Hot Cache (frequently accessed vectors) → Local Faiss**: Performance optimization

#### Lazy Renewal Policy

Documents on Walrus have epochs (time periods). Storarc implements smart renewal:

- **Important Chats**: Auto-renew for 365 epochs (~1 year)
- **Active Chats**: Auto-renew for 30 epochs if accessed in last 30 days
- **Inactive Chats**: Allow expiration to save costs

#### Decentralized Access Control

Using SEAL protocol:
- Documents encrypted client-side before upload
- Access policies stored on-chain
- Keys managed by distributed key servers
- Users approve access via wallet signatures

---

## 🚀 Features

### Core Features

✅ **Decentralized Document Storage**
- Upload documents to Walrus with permanent storage
- Support for multiple file formats (PDF, DOCX, TXT, MD, JSON, CSV, HTML, XML)
- Automatic chunking for large documents

✅ **AI-Powered Semantic Search**
- Vector embeddings with OpenAI
- Similarity search across all documents
- Context-aware retrieval

✅ **Intelligent Chat Interface**
- GPT-4 powered conversations
- Chat history persistence on Walrus
- Source attribution for answers

✅ **Blockchain Registry**
- Document metadata on Sui blockchain
- Verifiable ownership and provenance
- On-chain access control policies

✅ **Wallet-Based Authentication**
- Sui wallet integration
- User-specific document registries
- Gasless transactions (where supported)

✅ **Privacy & Encryption**
- SEAL protocol integration
- Client-side encryption
- Decentralized key management

### Advanced Features

- **Auto-Renewal System**: Smart document retention policies
- **Hybrid Caching**: Balance performance and decentralization
- **Multi-Format Support**: Handle diverse document types
- **Source Tracking**: Every answer includes source references
- **Event Sync**: Real-time blockchain event monitoring

---

## 📦 Installation

### Prerequisites

- **Node.js**: v18+
- **npm**: v9+
- **Sui Wallet**: Browser extension ([Install here](https://sui.io/))
- **OpenAI API Key**: ([Get one here](https://platform.openai.com/api-keys))

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/SiddharthManjul/Storarc.git
cd Storarc/client

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local

# 4. Edit .env.local with your configuration
nano .env.local
```

---

## ⚙️ Configuration

Create a `.env.local` file in the `client/` directory:

```env
# ============================================
# OPENAI CONFIGURATION
# ============================================
OPENAI_API_KEY="sk-..."

# ============================================
# SUI BLOCKCHAIN CONFIGURATION
# ============================================
SUI_NETWORK=testnet
SUI_PRIVATE_KEY="suiprivkey..."  # For backend operations

# ============================================
# WALRUS DECENTRALIZED STORAGE
# ============================================
WALRUS_API_URL="https://walrus-testnet-api.mystenlabs.com"
WALRUS_PUBLISHER_URL="https://publisher.walrus-testnet.walrus.space"
WALRUS_AGGREGATOR_URL="https://aggregator.walrus-testnet.walrus.space"

# ============================================
# SUI SMART CONTRACTS
# ============================================
# Vector Registry (Document Storage)
VECTOR_REGISTRY_PACKAGE_ID="0x..."
VECTOR_REGISTRY_OBJECT_ID="0x..."

# Document Registry
DOCUMENT_REGISTRY_PACKAGE_ID="0x..."

# Metadata Registry
METADATA_REGISTRY_PACKAGE_ID="0x..."

# Chat Registry
CHAT_REGISTRY_PACKAGE_ID="0x..."

# ============================================
# VECTOR DATABASE
# ============================================
VECTOR_DB_PATH="./data/vector-store"

# ============================================
# NEXT.JS
# ============================================
NEXT_PUBLIC_SUI_NETWORK=testnet
```

### Getting Your Contract IDs

1. Deploy Sui contracts from the `contracts/` directory
2. Copy package IDs and registry object IDs
3. Paste into `.env.local`

See [Sui Documentation](https://docs.sui.io/) for deployment guides.

---

## 🎯 Usage

### Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Web Interface

1. **Connect Wallet**: Click "Connect Wallet" and approve Sui wallet connection
2. **Upload Documents**: Navigate to `/upload` and upload files
3. **Chat**: Go to `/chat` to ask questions about your documents
4. **Manage Documents**: View and manage documents at `/documents`

### CLI Tools

#### Interactive CLI

```bash
npm run cli
```

Features:
- View system status
- Query documents
- Ingest documents
- Sync from blockchain

#### Auto-Ingest Documents

Place documents in `documents/` folder and run:

```bash
npm run ingest
```

Supported formats: `.txt`, `.md`, `.pdf`, `.docx`, `.json`, `.csv`, `.html`, `.xml`

#### Quick Query

```bash
npm run query "What is Storarc?"
```

#### Sync Cache

```bash
npm run sync
```

---

## 🏛️ Architecture

### Directory Structure

```
client/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API Routes
│   │   │   ├── chat/          # Chat endpoints
│   │   │   ├── documents/     # Document management
│   │   │   ├── query/         # Search queries
│   │   │   ├── upload/        # File uploads
│   │   │   └── status/        # System status
│   │   ├── chat/              # Chat page
│   │   ├── documents/         # Documents page
│   │   ├── upload/            # Upload page
│   │   └── page.tsx           # Home page
│   │
│   ├── components/            # React components
│   │   ├── ui/               # UI primitives
│   │   └── ...               # Feature components
│   │
│   ├── config/               # Configuration
│   │   └── index.ts          # App config
│   │
│   ├── lib/                  # Utility libraries
│   │   ├── auth-helpers.ts   # Authentication
│   │   ├── chat-api-helpers.ts
│   │   └── encryption-helper.ts
│   │
│   ├── services/             # Core business logic
│   │   ├── vector-store.ts          # Faiss vector DB
│   │   ├── rag-service.ts           # RAG pipeline
│   │   ├── walrus-client.ts         # Walrus storage
│   │   ├── sui-vector-registry.ts   # Sui blockchain
│   │   ├── chat-service.ts          # Chat management
│   │   ├── document-upload-service.ts
│   │   ├── seal-service.ts          # Encryption
│   │   └── ...
│   │
│   ├── scripts/              # CLI scripts
│   │   ├── cli.ts
│   │   ├── ingest.ts
│   │   ├── query.ts
│   │   └── sync.ts
│   │
│   └── types/                # TypeScript types
│
├── documents/                # Place documents here for ingest
├── data/                     # Local vector cache
├── public/                   # Static assets
└── package.json
```

### Service Layer

#### Vector Store Service (`vector-store.ts`)
- Manages Faiss vector index
- Handles embedding storage and retrieval
- Performs similarity search

#### RAG Service (`rag-service.ts`)
- Orchestrates document chunking
- Calls OpenAI for embeddings and completion
- Combines retrieval + generation

#### Walrus Client (`walrus-client.ts`)
- Uploads blobs to Walrus
- Retrieves blobs by ID
- Manages blob epochs and renewal

#### Sui Vector Registry (`sui-vector-registry.ts`)
- Registers documents on-chain
- Queries blockchain for metadata
- Syncs local cache with on-chain state

#### Chat Service (`chat-service.ts`)
- Creates and manages chat sessions
- Persists messages to Walrus
- Implements lazy renewal policies

---

## 📡 API Documentation

### Document Upload

**POST** `/api/upload/register`

Register a document transaction (user signs with wallet).

```json
{
  "userAddr": "0x...",
  "file": { "name": "doc.txt", "size": 1024, "type": "text/plain" },
  "walrusBlobId": "blob_abc123"
}
```

**Response**:
```json
{
  "transaction": "...",
  "documentId": "...",
  "fileHash": "..."
}
```

---

### Query Documents

**POST** `/api/query`

Semantic search across documents.

```json
{
  "query": "What is Storarc?",
  "topK": 4
}
```

**Response**:
```json
{
  "answer": "Storarc is a decentralized RAG system...",
  "sources": [
    {
      "filename": "intro.txt",
      "blobId": "blob_123",
      "relevance": 0.95,
      "preview": "Storarc combines..."
    }
  ]
}
```

---

### Chat Management

**POST** `/api/chat/create`

Create a new chat session.

```json
{
  "chatId": "chat_123",
  "title": "Understanding Storarc",
  "message": {
    "role": "user",
    "content": "What is Storarc?"
  }
}
```

**POST** `/api/chat/message`

Add message to existing chat.

```json
{
  "chatId": "chat_123",
  "message": {
    "role": "assistant",
    "content": "Storarc is...",
    "sources": [...]
  }
}
```

**GET** `/api/chat/list`

List all user chats.

**POST** `/api/chat/load`

Load chat by ID.

```json
{
  "chatId": "chat_123"
}
```

**POST** `/api/chat/delete`

Delete a chat.

```json
{
  "chatId": "chat_123"
}
```

---

### System Status

**GET** `/api/status`

Get system health and statistics.

**Response**:
```json
{
  "registry": {
    "totalDocuments": 42,
    "version": 5,
    "owner": "0x..."
  },
  "localCache": {
    "totalVectors": 1337,
    "version": 5,
    "isStale": false
  },
  "status": "ok"
}
```

---

## 🔧 Development

### Build for Production

```bash
npm run build
npm run start
```

### Linting

```bash
npm run lint
```

### Type Checking

```bash
npx tsc --noEmit
```

### Testing

```bash
npm test
```

---

## 🐛 Troubleshooting

### Common Issues

#### ❌ "Failed to connect wallet"

**Solution**:
1. Install [Sui Wallet Extension](https://chrome.google.com/webstore/detail/sui-wallet)
2. Create/import wallet
3. Switch to Testnet in wallet settings
4. Refresh page

#### ❌ "Insufficient funds for transaction"

**Solution**:
1. Get testnet SUI from [faucet](https://discord.com/channels/916379725201563759/971488439931392130)
2. Run: `!faucet <YOUR_ADDRESS>` in Discord

#### ❌ "Walrus upload failed"

**Causes**:
- Testnet downtime
- File too large (>10MB on testnet)
- Network issues

**Solution**:
- Retry in a few minutes
- Check [Walrus status](https://walrus-testnet.mystenlabs.com)
- Reduce file size

#### ❌ "Registry not found"

**Solution**:
1. Create a registry via the UI (first-time setup)
2. Sign the transaction with your wallet
3. Wait for blockchain confirmation

#### ❌ "OpenAI API rate limit"

**Solution**:
- Use a paid OpenAI API key
- Implement request throttling
- Consider using a different embedding model

#### ❌ "Build errors on Vercel"

**Solution**:
- Check `.npmrc` has `legacy-peer-deps=true`
- Verify all environment variables are set in Vercel dashboard
- Review build logs for specific errors

---

## 🔐 Security Considerations

### Best Practices

1. **Never commit `.env.local`**: Contains sensitive API keys
2. **Use SEAL encryption for sensitive docs**: Enable client-side encryption
3. **Verify wallet addresses**: Always check recipient before granting access
4. **Monitor on-chain activity**: Review transactions in Sui Explorer
5. **Backup private keys**: Store wallet recovery phrases securely

### Privacy Notes

- **Document content** is stored on Walrus (public by default)
- **Metadata** is public on Sui blockchain
- **Encrypted documents** require SEAL protocol (optional)
- **Wallet signatures** are required for all state-changing operations

---

## 🌍 Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Environment Variables on Vercel

**CRITICAL**: You must add ALL required environment variables to your Vercel project settings. Missing variables will cause 500 errors.

**Required Variables (Must be set):**
```
OPENAI_API_KEY=sk-...
VECTOR_REGISTRY_PACKAGE_ID=0x...
VECTOR_REGISTRY_OBJECT_ID=0x...
WALRUS_PUBLISHER_URL=https://publisher.walrus-testnet.walrus.space
WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space
```

**Recommended Variables:**
```
SUI_NETWORK=testnet
SUI_PRIVATE_KEY=suiprivkey...
SUI_RPC_URL=https://fullnode.testnet.sui.io:443
CHAT_REGISTRY_PACKAGE_ID=0x...
DOCUMENT_REGISTRY_PACKAGE_ID=0x...
ACCESS_CONTROL_PACKAGE_ID=0x...
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_SUI_RPC_URL=https://fullnode.testnet.sui.io:443
```

**How to set variables in Vercel:**
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable with its value
4. Set scope to "Production", "Preview", and "Development"
5. Redeploy your application

---

## 📚 Learn More

### Documentation

- [Walrus Documentation](https://docs.walrus.site/)
- [Sui Documentation](https://docs.sui.io/)
- [LangChain Docs](https://js.langchain.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)

### Community

- [Sui Discord](https://discord.gg/sui)
- [Walrus Community](https://discord.gg/walrus)

---

## 🎓 Example Workflow

```bash
# 1. Add research papers
cp paper1.pdf documents/
cp paper2.pdf documents/

# 2. Ingest all documents
npm run ingest

# Expected output:
# 📤 Uploading paper1.pdf...
# ✅ Uploaded to Walrus: blob_abc123
# 🧮 Creating embeddings...
# ✅ Registered on Sui blockchain
#
# ✅ Successful: 2
# ❌ Failed: 0
# 📦 Total vectors: 1,337

# 3. Query your knowledge base
npm run query "What are the key findings?"

# Expected output:
# 📝 Answer: The key findings include...
# 📚 Sources: paper1.pdf, paper2.pdf

# 4. Start chat interface
npm run dev
# Open http://localhost:3000/chat
```

---

## 🚧 Roadmap

- [x] Vector storage and retrieval
- [x] Walrus integration
- [x] Sui blockchain registry
- [x] CLI tools
- [x] Web interface
- [x] Chat persistence
- [x] Document management UI
- [x] Wallet authentication
- [x] SEAL encryption
- [x] Multi-user collaboration
- [x] Access control
- [ ] Mobile app
- [ ] Plugin system
- [ ] Mainnet deployment

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

Built with:
- [Mysten Labs](https://mystenlabs.com/) - Walrus & Sui
- [OpenAI](https://openai.com/) - GPT-4 & Embeddings
- [Vercel](https://vercel.com/) - Hosting & Deployment
- [LangChain](https://langchain.com/) - AI Orchestration

---

**Version**: 1.0.0
**Status**: Beta (Testnet)
**Maintainer**: [@SiddharthManjul](https://github.com/SiddharthManjul)

---

**⚡ Storarc - Own Your Knowledge, Forever**
