# Semantic Search

> Build production-ready semantic search systems using vector databases,
embeddings, and retrieval-augmented generation (RAG). Covers vector DB
selection (Pinecone/Qdrant/Weaviate), embedding models (OpenAI/Voyage/Cohere),
chunking strategies, hybrid search, and reranking for high-quality retrieval.


**Category:** ai-ml | **Version:** 1.0.0

**Tags:** vector-search, embeddings, rag, pinecone, qdrant, weaviate, llama-index, langchain, hybrid-search, reranking

---

## Patterns

### Vector Database Setup with Upstash
Serverless vector search for edge and Vercel deployments
```
// lib/vector-store.ts
import { Index } from "@upstash/vector";
import OpenAI from "openai";

const vectorIndex = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

const openai = new OpenAI();

interface Document {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
}

// Generate embedding
async function embed(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    dimensions: 1536, // Upstash default
  });
  return response.data[0].embedding;
}

// Index documents
async function indexDocuments(documents: Document[]) {
  const vectors = await Promise.all(
    documents.map(async (doc) => ({
      id: doc.id,
      vector: await embed(doc.content),
      metadata: {
        ...doc.metadata,
        content: doc.content.slice(0, 1000), // Store for retrieval
      },
    }))
  );

  // Batch upsert (max 1000 per call)
  for (let i = 0; i < vectors.length; i += 1000) {
    await vectorIndex.upsert(vectors.slice(i, i + 1000));
  }

  return { indexed: vectors.length };
}

// Query with metadata filter
async function search(
  query: string,
  options?: {
    topK?: number;
    filter?: Record<string, unknown>;
    includeMetadata?: boolean;
  }
) {
  const { topK = 5, filter, includeMetadata = true } = options || {};

  const queryVector = await embed(query);

  const results = await vectorIndex.query({
    vector: queryVector,
    topK,
    filter,
    includeMetadata,
  });

  return results.map((r) => ({
    id: r.id,
    score: r.score,
    content: r.metadata?.content,
    metadata: r.metadata,
  }));
}

```

### Pinecone with Serverless
Enterprise-grade vector search with Pinecone serverless
```
// lib/pinecone-search.ts
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const openai = new OpenAI();
const index = pinecone.index("your-index-name");

interface UpsertRecord {
  id: string;
  text: string;
  metadata?: Record<string, string | number | boolean>;
}

// Embed text
async function embed(texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
  });
  return response.data.map((d) => d.embedding);
}

// Batch upsert with namespace
async function upsertDocuments(
  records: UpsertRecord[],
  namespace?: string
) {
  const batchSize = 100;
  const ns = index.namespace(namespace || "");

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const embeddings = await embed(batch.map((r) => r.text));

    await ns.upsert(
      batch.map((record, idx) => ({
        id: record.id,
        values: embeddings[idx],
        metadata: {
          ...record.metadata,
          text: record.text.slice(0, 40000), // Pinecone metadata limit
        },
      }))
    );
  }

  return { upserted: records.length };
}

// Query with filters
async function query(
  queryText: string,
  options?: {
    topK?: number;
    namespace?: string;
    filter?: Record<string, unknown>;
  }
) {
  const { topK = 10, namespace, filter } = options || {};

  const [queryEmbedding] = await embed([queryText]);
  const ns = index.namespace(namespace || "");

  const results = await ns.query({
    vector: queryEmbedding,
    topK,
    filter,
    includeMetadata: true,
  });

  return results.matches?.map((m) => ({
    id: m.id,
    score: m.score,
    text: m.metadata?.text,
    metadata: m.metadata,
  })) || [];
}

// Delete by filter
async function deleteByMetadata(
  filter: Record<string, unknown>,
  namespace?: string
) {
  const ns = index.namespace(namespace || "");
  await ns.deleteMany({ filter });
}

```

### Hybrid Search with Qdrant
Combined vector + keyword search with Qdrant
```
// lib/qdrant-hybrid.ts
import { QdrantClient } from "@qdrant/js-client-rest";
import OpenAI from "openai";

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL || "http://localhost:6333",
  apiKey: process.env.QDRANT_API_KEY,
});

const openai = new OpenAI();
const COLLECTION_NAME = "documents";

// Create collection with hybrid search
async function createCollection() {
  await qdrant.createCollection(COLLECTION_NAME, {
    vectors: {
      size: 1536,
      distance: "Cosine",
    },
    sparse_vectors: {
      text: {}, // For BM25-style keyword matching
    },
    optimizers_config: {
      default_segment_number: 2,
    },
  });

  // Create payload index for filtering
  await qdrant.createPayloadIndex(COLLECTION_NAME, {
    field_name: "category",
    field_schema: "keyword",
  });
}

// Generate sparse vector from text (simple BM25-like)
function sparseEncode(text: string): { indices: number[]; values: number[] } {
  const words = text.toLowerCase().split(/\W+/).filter(Boolean);
  const termFreq: Record<string, number> = {};

  for (const word of words) {
    termFreq[word] = (termFreq[word] || 0) + 1;
  }

  // Simple hashing for indices
  const indices: number[] = [];
  const values: number[] = [];

  for (const [term, freq] of Object.entries(termFreq)) {
    const hash = term.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 30000;
    indices.push(hash);
    values.push(Math.log(1 + freq)); // TF-IDF-like
  }

  return { indices, values };
}

// Upsert with both dense and sparse vectors
async function upsertHybrid(
  documents: Array<{ id: string; text: string; metadata?: Record<string, unknown> }>
) {
  const embeddings = await Promise.all(
    documents.map(async (doc) => {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: doc.text,
      });
      return response.data[0].embedding;
    })
  );

  const points = documents.map((doc, i) => ({
    id: doc.id,
    vector: embeddings[i],
    sparse_vectors: {
      text: sparseEncode(doc.text),
    },
    payload: {
      text: doc.text,
      ...doc.metadata,
    },
  }));

  await qdrant.upsert(COLLECTION_NAME, { points, wait: true });
}

// Hybrid search with RRF fusion
async function hybridSearch(
  query: string,
  options?: {
    topK?: number;
    filter?: Record<string, unknown>;
    denseWeight?: number; // 0-1, default 0.7
  }
) {
  const { topK = 10, filter, denseWeight = 0.7 } = options || {};

  // Get dense embedding
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  });
  const denseVector = response.data[0].embedding;
  const sparseVector = sparseEncode(query);

  // Hybrid query with prefetch
  const results = await qdrant.query(COLLECTION_NAME, {
    prefetch: [
      {
        query: denseVector,
        using: "default",
        limit: topK * 2,
      },
      {
        query: {
          indices: sparseVector.indices,
          values: sparseVector.values,
        },
        using: "text",
        limit: topK * 2,
      },
    ],
    query: { fusion: "rrf" }, // Reciprocal Rank Fusion
    limit: topK,
    filter: filter
      ? {
          must: Object.entries(filter).map(([key, value]) => ({
            key,
            match: { value },
          })),
        }
      : undefined,
    with_payload: true,
  });

  return results.map((r) => ({
    id: r.id,
    score: r.score,
    text: r.payload?.text,
    metadata: r.payload,
  }));
}

```

### Semantic Chunking
Smart document chunking that preserves context
```
// lib/chunking.ts
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

interface Chunk {
  content: string;
  metadata: {
    pageNumber?: number;
    section?: string;
    chunkIndex: number;
    startChar: number;
    endChar: number;
  };
}

// Basic recursive chunking with overlap
async function chunkDocument(
  text: string,
  options?: {
    chunkSize?: number;
    chunkOverlap?: number;
    separators?: string[];
  }
): Promise<Chunk[]> {
  const {
    chunkSize = 1000,
    chunkOverlap = 200,
    separators = ["\n\n", "\n", ". ", " ", ""],
  } = options || {};

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
    separators,
  });

  const docs = await splitter.createDocuments([text]);

  return docs.map((doc, i) => ({
    content: doc.pageContent,
    metadata: {
      chunkIndex: i,
      startChar: doc.metadata.loc?.start || 0,
      endChar: doc.metadata.loc?.end || doc.pageContent.length,
    },
  }));
}

// Semantic chunking with sentence boundaries
function semanticChunk(
  text: string,
  options?: {
    targetSize?: number;
    maxSize?: number;
    preserveHeaders?: boolean;
  }
): Chunk[] {
  const { targetSize = 800, maxSize = 1200, preserveHeaders = true } = options || {};

  // Split into sentences
  const sentences = text.match(/[^.!?]+[.!?]+\s*/g) || [text];
  const chunks: Chunk[] = [];

  let currentChunk = "";
  let currentSection = "";
  let chunkStart = 0;
  let charPos = 0;

  for (const sentence of sentences) {
    // Detect section headers
    if (preserveHeaders && /^#+\s+/.test(sentence.trim())) {
      // If we have content, save it
      if (currentChunk.trim()) {
        chunks.push({
          content: currentSection
            ? `## ${currentSection}\n\n${currentChunk.trim()}`
            : currentChunk.trim(),
          metadata: {
            section: currentSection,
            chunkIndex: chunks.length,
            startChar: chunkStart,
            endChar: charPos,
          },
        });
      }
      currentSection = sentence.replace(/^#+\s+/, "").trim();
      currentChunk = "";
      chunkStart = charPos;
    } else if (currentChunk.length + sentence.length > maxSize) {
      // Save current chunk
      if (currentChunk.trim()) {
        chunks.push({
          content: currentSection
            ? `## ${currentSection}\n\n${currentChunk.trim()}`
            : currentChunk.trim(),
          metadata: {
            section: currentSection,
            chunkIndex: chunks.length,
            startChar: chunkStart,
            endChar: charPos,
          },
        });
      }
      currentChunk = sentence;
      chunkStart = charPos;
    } else {
      currentChunk += sentence;
    }
    charPos += sentence.length;
  }

  // Save last chunk
  if (currentChunk.trim()) {
    chunks.push({
      content: currentSection
        ? `## ${currentSection}\n\n${currentChunk.trim()}`
        : currentChunk.trim(),
      metadata: {
        section: currentSection,
        chunkIndex: chunks.length,
        startChar: chunkStart,
        endChar: charPos,
      },
    });
  }

  return chunks;
}

// Estimate tokens (rough: 4 chars per token)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

```

### Reranking with Cohere
Second-stage reranking for precision
```
// lib/reranker.ts
import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY!,
});

interface RerankResult {
  id: string;
  text: string;
  originalScore: number;
  rerankScore: number;
  metadata?: Record<string, unknown>;
}

// Rerank search results
async function rerankResults(
  query: string,
  documents: Array<{ id: string; text: string; score: number; metadata?: Record<string, unknown> }>,
  options?: {
    topN?: number;
    model?: "rerank-english-v3.0" | "rerank-multilingual-v3.0" | "rerank-v3.5";
  }
): Promise<RerankResult[]> {
  const { topN = 5, model = "rerank-v3.5" } = options || {};

  if (documents.length === 0) return [];

  const response = await cohere.rerank({
    model,
    query,
    documents: documents.map((d) => d.text),
    topN,
    returnDocuments: false,
  });

  return response.results.map((result) => {
    const original = documents[result.index];
    return {
      id: original.id,
      text: original.text,
      originalScore: original.score,
      rerankScore: result.relevanceScore,
      metadata: original.metadata,
    };
  });
}

// Full retrieval pipeline with reranking
async function retrieveAndRerank(
  query: string,
  vectorSearch: (query: string, topK: number) => Promise<
    Array<{ id: string; text: string; score: number; metadata?: Record<string, unknown> }>
  >,
  options?: {
    retrieveK?: number; // How many to retrieve
    rerankK?: number;   // How many to keep after reranking
  }
): Promise<RerankResult[]> {
  const { retrieveK = 20, rerankK = 5 } = options || {};

  // Stage 1: Vector retrieval (cast wide net)
  const candidates = await vectorSearch(query, retrieveK);

  if (candidates.length === 0) return [];

  // Stage 2: Rerank for precision
  const reranked = await rerankResults(query, candidates, { topN: rerankK });

  return reranked;
}

```

### LlamaIndex RAG Pipeline
Complete RAG pipeline with LlamaIndex TypeScript
```
// lib/rag-pipeline.ts
import {
  Document,
  VectorStoreIndex,
  SimpleDirectoryReader,
  OpenAIEmbedding,
  Settings,
  serviceContextFromDefaults,
} from "llamaindex";
import { PineconeVectorStore } from "@llamaindex/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";

// Configure LlamaIndex settings
Settings.embedModel = new OpenAIEmbedding({
  model: "text-embedding-3-small",
});

// Initialize Pinecone client
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

// Create vector store
async function createVectorStore(indexName: string) {
  const pineconeIndex = pinecone.index(indexName);

  return new PineconeVectorStore({
    pineconeIndex,
  });
}

// Index documents
async function indexDocuments(
  documentsPath: string,
  indexName: string
) {
  // Load documents
  const reader = new SimpleDirectoryReader();
  const documents = await reader.loadData(documentsPath);

  // Create vector store
  const vectorStore = await createVectorStore(indexName);

  // Build index
  const index = await VectorStoreIndex.fromDocuments(documents, {
    vectorStore,
  });

  return index;
}

// Query with context
async function queryRAG(
  query: string,
  indexName: string,
  options?: {
    topK?: number;
    systemPrompt?: string;
  }
) {
  const { topK = 3, systemPrompt } = options || {};

  const vectorStore = await createVectorStore(indexName);

  const index = await VectorStoreIndex.fromVectorStore(vectorStore);

  const queryEngine = index.asQueryEngine({
    similarityTopK: topK,
  });

  const response = await queryEngine.query({
    query,
  });

  return {
    answer: response.response,
    sourceNodes: response.sourceNodes?.map((node) => ({
      text: node.node.text,
      score: node.score,
      metadata: node.node.metadata,
    })),
  };
}

// Chat with history
async function chatRAG(
  message: string,
  indexName: string,
  history: Array<{ role: "user" | "assistant"; content: string }>
) {
  const vectorStore = await createVectorStore(indexName);
  const index = await VectorStoreIndex.fromVectorStore(vectorStore);

  const chatEngine = index.asChatEngine({
    similarityTopK: 3,
  });

  // Add history
  for (const msg of history) {
    if (msg.role === "user") {
      chatEngine.chatHistory.addMessage({
        role: "user",
        content: msg.content,
      });
    } else {
      chatEngine.chatHistory.addMessage({
        role: "assistant",
        content: msg.content,
      });
    }
  }

  const response = await chatEngine.chat({ message });

  return {
    answer: response.response,
    sources: response.sourceNodes?.map((n) => n.node.text),
  };
}

```

### Voyage AI Embeddings
High-performance embeddings with Voyage AI
```
// lib/voyage-embeddings.ts
interface VoyageEmbedding {
  embedding: number[];
  usage: { total_tokens: number };
}

interface VoyageResponse {
  data: Array<{ embedding: number[] }>;
  usage: { total_tokens: number };
}

const VOYAGE_API_URL = "https://api.voyageai.com/v1/embeddings";

async function voyageEmbed(
  texts: string[],
  options?: {
    model?: "voyage-3" | "voyage-3-lite" | "voyage-large-2" | "voyage-code-2";
    inputType?: "query" | "document";
  }
): Promise<{ embeddings: number[][]; totalTokens: number }> {
  const {
    model = "voyage-3-lite", // Good balance of cost/quality
    inputType = "document",
  } = options || {};

  const response = await fetch(VOYAGE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({
      input: texts,
      model,
      input_type: inputType,
    }),
  });

  if (!response.ok) {
    throw new Error(`Voyage API error: ${response.statusText}`);
  }

  const data: VoyageResponse = await response.json();

  return {
    embeddings: data.data.map((d) => d.embedding),
    totalTokens: data.usage.total_tokens,
  };
}

// Batch embed with rate limiting
async function batchEmbed(
  texts: string[],
  options?: {
    model?: "voyage-3" | "voyage-3-lite";
    batchSize?: number;
    delayMs?: number;
  }
): Promise<number[][]> {
  const { model = "voyage-3-lite", batchSize = 128, delayMs = 100 } = options || {};

  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const { embeddings } = await voyageEmbed(batch, { model });
    allEmbeddings.push(...embeddings);

    // Rate limit
    if (i + batchSize < texts.length) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  return allEmbeddings;
}

```


## Anti-Patterns

### Single-Stage Retrieval
Using only vector search without reranking
**Why it's bad:** Vector search is recall-optimized, not precision-optimized.
First 5 results may not be the best 5. Reranking boosts
precision by up to 48% (Databricks research).

**Instead:** Add Cohere/Jina reranker as second stage for important queries

### Fixed-Size Chunking
Blindly splitting at 512 or 1000 characters
**Why it's bad:** Cuts sentences mid-thought, breaks context, separates related
information. Results in incoherent chunks that embed poorly.

**Instead:** Use semantic chunking with sentence boundaries and header preservation

### Pure Vector Search for Exact Matches
Expecting vector search to find exact identifiers
**Why it's bad:** Vector search captures semantic meaning, not exact strings.
Query for 'E-404' may return conceptually similar errors but
miss the exact error code in documents.

**Instead:** Use hybrid search (vector + BM25 keyword) for production systems

### Ignoring Embedding Model Choice
Defaulting to text-embedding-ada-002
**Why it's bad:** ada-002 is outdated. text-embedding-3-small is same price with
better performance. Voyage-3 outperforms OpenAI by 9.74% on
retrieval benchmarks.

**Instead:** Evaluate Voyage-3-lite ($0.02/1M) or text-embedding-3-small for your use case

### No Metadata Filtering
Searching entire vector space for every query
**Why it's bad:** Slower, less relevant. If user is asking about 'React hooks',
searching through Python and Go documentation wastes resources.

**Instead:** Add metadata (category, date, source) and filter before vector search

### Embedding in Request Path
Generating embeddings on every search request
**Why it's bad:** Adds 100-300ms latency per query. API rate limits become
bottleneck under load.

**Instead:** Pre-embed documents at index time, cache query embeddings


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] Changing embedding models breaks existing vectors

**Situation:** Upgrading from ada-002 to text-embedding-3-small or switching providers

**Why it happens:**
Different embedding models produce different vector spaces.
Vectors from ada-002 are incompatible with text-embedding-3-small.
Mixing models in the same index produces nonsensical results.

You cannot:
- Query with new model against old vectors
- Partially re-embed (some docs with old, some with new)
- Use cross-model similarity


**Solution:**
```
Track embedding model version in metadata:

```typescript
interface VectorRecord {
  id: string;
  vector: number[];
  metadata: {
    text: string;
    embeddingModel: "text-embedding-3-small" | "voyage-3-lite";
    embeddingVersion: string; // e.g., "2024-01-01"
    indexedAt: string;
  };
}

// Migration strategy
async function migrateToNewModel(
  oldModelRecords: VectorRecord[],
  newModel: string
) {
  console.log(`Migrating ${oldModelRecords.length} records to ${newModel}`);

  // 1. Create new namespace/collection
  const newNamespace = `${COLLECTION_NAME}_${newModel}`;

  // 2. Re-embed all documents
  for (const batch of chunk(oldModelRecords, 100)) {
    const texts = batch.map((r) => r.metadata.text);
    const newEmbeddings = await embed(texts, { model: newModel });

    await vectorIndex.upsert(
      newNamespace,
      batch.map((r, i) => ({
        id: r.id,
        vector: newEmbeddings[i],
        metadata: {
          ...r.metadata,
          embeddingModel: newModel,
          embeddingVersion: new Date().toISOString().split("T")[0],
        },
      }))
    );
  }

  // 3. Swap namespaces atomically
  // 4. Delete old namespace after validation
}
```

```

---

### [HIGH] LLMs ignore context in the middle of long prompts

**Situation:** Providing many retrieved chunks to LLM context

**Why it happens:**
Research shows LLMs attend strongly to beginning and end of context,
but struggle with information in the middle (the 'lost in the middle'
phenomenon). Stuffing 10+ chunks into context means chunks 4-8 may
be effectively ignored.

Retrieval order matters: most relevant should be first or last.


**Solution:**
```
Reorder chunks for LLM attention patterns:

```typescript
// Interleave important chunks at start and end
function reorderForAttention<T>(
  items: T[],
  scoreKey: keyof T
): T[] {
  if (items.length <= 3) return items;

  // Sort by relevance
  const sorted = [...items].sort(
    (a, b) => (b[scoreKey] as number) - (a[scoreKey] as number)
  );

  // Interleave: best at start, second-best at end, etc.
  const reordered: T[] = [];
  let left = 0;
  let right = sorted.length - 1;

  sorted.forEach((item, i) => {
    if (i % 2 === 0) {
      reordered[left++] = item;
    } else {
      reordered[right--] = item;
    }
  });

  return reordered;
}

// Or: Just use fewer, higher-quality chunks
const topChunks = results.slice(0, 3); // Better than 10 mediocre chunks
```

```

---

### [HIGH] Vector search misses exact keyword matches

**Situation:** User searches for specific ID, code, or term

**Why it happens:**
Vector embeddings capture semantic meaning, not exact strings.
Search for "ERROR-404" might return documents about "page not found"
but miss the exact error code.

Search for "useState" might return React documentation generally
but miss the specific hook documentation.


**Solution:**
```
Implement hybrid search:

```typescript
async function hybridSearch(query: string, options?: { vectorWeight?: number }) {
  const { vectorWeight = 0.7 } = options || {};
  const keywordWeight = 1 - vectorWeight;

  // Parallel retrieval
  const [vectorResults, keywordResults] = await Promise.all([
    vectorSearch(query, { topK: 20 }),
    keywordSearch(query, { topK: 20 }), // Elasticsearch, Typesense, etc.
  ]);

  // Reciprocal Rank Fusion
  const scores: Record<string, number> = {};

  vectorResults.forEach((r, i) => {
    const rank = i + 1;
    scores[r.id] = (scores[r.id] || 0) + vectorWeight * (1 / (60 + rank));
  });

  keywordResults.forEach((r, i) => {
    const rank = i + 1;
    scores[r.id] = (scores[r.id] || 0) + keywordWeight * (1 / (60 + rank));
  });

  // Sort by fused score
  const allDocs = [...vectorResults, ...keywordResults];
  const seen = new Set<string>();

  return Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .map(([id]) => {
      if (seen.has(id)) return null;
      seen.add(id);
      return allDocs.find((d) => d.id === id);
    })
    .filter(Boolean);
}
```

```

---

### [HIGH] Embedding costs spiral with naive re-indexing

**Situation:** Re-indexing documents on every update

**Why it happens:**
Embedding costs add up:
- OpenAI text-embedding-3-small: $0.02/1M tokens
- 1M documents × 500 tokens = 500M tokens = $10 per full reindex
- Daily reindex = $300/month just for embeddings

Naive updates that re-embed unchanged documents waste money.


**Solution:**
```
Content-addressable embedding with change detection:

```typescript
import { createHash } from "crypto";

interface IndexedDocument {
  id: string;
  contentHash: string;
  vector: number[];
  indexedAt: Date;
}

// Hash content to detect changes
function contentHash(text: string): string {
  return createHash("sha256").update(text).digest("hex").slice(0, 16);
}

// Only embed changed documents
async function incrementalIndex(
  documents: Array<{ id: string; content: string }>,
  existingIndex: Map<string, IndexedDocument>
) {
  const toEmbed: typeof documents = [];
  const unchanged: string[] = [];

  for (const doc of documents) {
    const hash = contentHash(doc.content);
    const existing = existingIndex.get(doc.id);

    if (existing && existing.contentHash === hash) {
      unchanged.push(doc.id);
    } else {
      toEmbed.push(doc);
    }
  }

  console.log(`Unchanged: ${unchanged.length}, To embed: ${toEmbed.length}`);

  if (toEmbed.length === 0) return { embedded: 0 };

  // Only embed changed docs
  const embeddings = await batchEmbed(toEmbed.map((d) => d.content));

  // Upsert only changed
  await vectorIndex.upsert(
    toEmbed.map((doc, i) => ({
      id: doc.id,
      vector: embeddings[i],
      metadata: {
        contentHash: contentHash(doc.content),
        indexedAt: new Date().toISOString(),
      },
    }))
  );

  return { embedded: toEmbed.length, skipped: unchanged.length };
}
```

```

---

### [MEDIUM] Fixed-size chunks split sentences and lose meaning

**Situation:** Chunking documents for indexing

**Why it happens:**
"The patient was diagnosed with" [CHUNK BREAK] "diabetes and prescribed..."

First chunk embeds to "medical diagnosis" vaguely.
Second chunk loses the subject entirely.
Neither chunk is useful for retrieval.

Tables, code blocks, and lists are especially vulnerable.


**Solution:**
```
Semantic-aware chunking:

```typescript
function semanticChunk(text: string): string[] {
  const chunks: string[] = [];
  let current = "";

  // Split by semantic boundaries
  const sections = text.split(/(?=^#{1,3}\s)/m); // Headers

  for (const section of sections) {
    // Split section into paragraphs
    const paragraphs = section.split(/\n\n+/);

    for (const para of paragraphs) {
      // Keep tables and code blocks intact
      if (para.match(/^\|.*\|$/m) || para.match(/^```/m)) {
        if (current) chunks.push(current.trim());
        chunks.push(para);
        current = "";
        continue;
      }

      // Check if adding paragraph exceeds limit
      if (current.length + para.length > 1000) {
        if (current) chunks.push(current.trim());
        current = para;
      } else {
        current += (current ? "\n\n" : "") + para;
      }
    }
  }

  if (current) chunks.push(current.trim());

  return chunks.filter((c) => c.length > 50); // Filter tiny chunks
}
```

```

---

### [MEDIUM] New index returns no results

**Situation:** Just set up vector database, queries return empty

**Why it happens:**
Common cold start issues:
- Documents not yet indexed (async indexing not complete)
- Wrong namespace/collection being queried
- Dimension mismatch between query and index
- Filter excludes all documents
- Index not yet built/optimized


**Solution:**
```
Graceful cold start handling:

```typescript
async function searchWithFallback(
  query: string,
  options?: { namespace?: string; filter?: Record<string, unknown> }
) {
  const { namespace, filter } = options || {};

  // Check index health first
  const stats = await vectorIndex.describeIndexStats();
  const nsStats = stats.namespaces?.[namespace || ""];

  if (!nsStats || nsStats.vectorCount === 0) {
    return {
      results: [],
      warning: "Index is empty. Documents may still be indexing.",
      indexStats: stats,
    };
  }

  // Try with filter
  let results = await vectorIndex.query({
    vector: await embed(query),
    topK: 10,
    filter,
    namespace,
  });

  // If empty, try without filter
  if (results.matches?.length === 0 && filter) {
    console.warn("No results with filter, trying without...");
    results = await vectorIndex.query({
      vector: await embed(query),
      topK: 10,
      namespace,
    });

    if (results.matches?.length) {
      return {
        results: results.matches,
        warning: "No results matched filter. Showing unfiltered results.",
      };
    }
  }

  return { results: results.matches || [] };
}
```

```

---

### [CRITICAL] Query vectors don't match index dimensions

**Situation:** Using different embedding models for indexing vs querying

**Why it happens:**
- text-embedding-3-small: 1536 dimensions
- text-embedding-3-large: 3072 dimensions
- voyage-3: 1024 dimensions

Index expects 1536, query provides 1024 = cryptic error or silent failure.
Some databases truncate silently, returning garbage results.


**Solution:**
```
Centralize embedding configuration:

```typescript
// lib/embedding-config.ts
const EMBEDDING_CONFIG = {
  model: "text-embedding-3-small",
  dimensions: 1536,
  provider: "openai",
} as const;

// Single embed function used everywhere
export async function embed(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_CONFIG.model,
    input: text,
    dimensions: EMBEDDING_CONFIG.dimensions,
  });
  return response.data[0].embedding;
}

// Validate on index creation
export function validateIndexConfig(indexDimensions: number) {
  if (indexDimensions !== EMBEDDING_CONFIG.dimensions) {
    throw new Error(
      `Index dimensions (${indexDimensions}) don't match embedding config (${EMBEDDING_CONFIG.dimensions}). ` +
      `Using model: ${EMBEDDING_CONFIG.model}`
    );
  }
}
```

```

---

### [MEDIUM] Embedding API rate limits cause cascade failures

**Situation:** Batch indexing or high query volume

**Why it happens:**
OpenAI: 3,000 RPM (requests per minute) on most tiers
Parallel indexing of 10,000 documents = 100 parallel calls
= Immediate rate limit = 429 errors = Failed indexing


**Solution:**
```
Rate-limited batch processing:

```typescript
import pLimit from "p-limit";

const embeddingLimit = pLimit(10); // Max 10 concurrent requests

async function batchEmbedWithLimits(
  texts: string[],
  options?: { batchSize?: number; delayMs?: number }
): Promise<number[][]> {
  const { batchSize = 100, delayMs = 100 } = options || {};
  const allEmbeddings: number[][] = [];

  // Split into batches
  const batches: string[][] = [];
  for (let i = 0; i < texts.length; i += batchSize) {
    batches.push(texts.slice(i, i + batchSize));
  }

  // Process with concurrency limit
  const results = await Promise.all(
    batches.map((batch, i) =>
      embeddingLimit(async () => {
        // Delay between batches
        if (i > 0) {
          await new Promise((r) => setTimeout(r, delayMs));
        }

        const response = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: batch,
        });

        return response.data.map((d) => d.embedding);
      })
    )
  );

  return results.flat();
}
```

```

---

### [MEDIUM] Cached embeddings return outdated search results

**Situation:** Caching query embeddings for performance

**Why it happens:**
If you cache query embeddings and documents update, the cached
embedding still returns old similarity scores. User gets stale
results even though index was updated.

Also: cache key collisions if not careful with query normalization.


**Solution:**
```
Time-bounded caching with invalidation:

```typescript
import { LRUCache } from "lru-cache";

const queryEmbeddingCache = new LRUCache<string, number[]>({
  max: 1000,
  ttl: 1000 * 60 * 5, // 5 minute TTL
});

// Track index version
let indexVersion = Date.now();

async function embedQuery(query: string): Promise<number[]> {
  // Normalize query for cache key
  const normalizedQuery = query.toLowerCase().trim().replace(/\s+/g, " ");
  const cacheKey = `${indexVersion}:${normalizedQuery}`;

  const cached = queryEmbeddingCache.get(cacheKey);
  if (cached) return cached;

  const embedding = await embed(normalizedQuery);
  queryEmbeddingCache.set(cacheKey, embedding);

  return embedding;
}

// Call when index updates
function invalidateQueryCache() {
  indexVersion = Date.now();
  // Old cache keys won't match
}
```

```

---

### [MEDIUM] Text embeddings miss image/table content

**Situation:** Indexing documents with images, diagrams, tables

**Why it happens:**
Text embeddings only embed... text. If a document's key information
is in a diagram or table that wasn't OCR'd properly, search will
fail to find it.

"Show me the system architecture" returns nothing because the
architecture is only in a diagram, not text.


**Solution:**
```
Multimodal indexing strategy:

```typescript
async function indexDocument(doc: { path: string; type: "pdf" | "image" | "text" }) {
  const chunks: Array<{ text: string; type: string }> = [];

  if (doc.type === "pdf") {
    // Extract text
    const textContent = await extractPdfText(doc.path);
    chunks.push({ text: textContent, type: "text" });

    // Extract and describe images
    const images = await extractPdfImages(doc.path);
    for (const image of images) {
      const description = await describeImage(image); // Vision API
      chunks.push({
        text: `[Image: ${description}]`,
        type: "image_description",
      });
    }

    // Extract and format tables
    const tables = await extractPdfTables(doc.path);
    for (const table of tables) {
      chunks.push({
        text: tableToText(table), // Convert to searchable text
        type: "table",
      });
    }
  }

  // Embed all chunks
  for (const chunk of chunks) {
    await indexChunk(chunk);
  }
}

// Describe image for embedding
async function describeImage(imageBase64: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: "image/png", data: imageBase64 } },
          { type: "text", text: "Describe this image in detail for search indexing. Include all text, labels, relationships shown." },
        ],
      },
    ],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}
```

```

---

## Collaboration

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/ai-ml/semantic-search/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
