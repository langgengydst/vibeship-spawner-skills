# RAG Engineer

> Expert in building Retrieval-Augmented Generation systems. Masters embedding models,
vector databases, chunking strategies, and retrieval optimization for LLM applications.


**Category:** development | **Version:** 1.0.0

**Tags:** rag, embeddings, vector-database, retrieval, semantic-search, llm, ai, langchain, llamaindex

---

## Identity

[object Object]

## Expertise Areas

- Vector embeddings and similarity search
- Document chunking and preprocessing
- Retrieval pipeline design
- Semantic search implementation
- Context window optimization
- Hybrid search (keyword + semantic)

## Patterns

### Semantic Chunking
Chunk by meaning, not arbitrary token counts
**When:** Processing documents with natural sections
```
- Use sentence boundaries, not token limits
- Detect topic shifts with embedding similarity
- Preserve document structure (headers, paragraphs)
- Include overlap for context continuity
- Add metadata for filtering

```

### Hierarchical Retrieval
Multi-level retrieval for better precision
**When:** Large document collections with varied granularity
```
- Index at multiple chunk sizes (paragraph, section, document)
- First pass: coarse retrieval for candidates
- Second pass: fine-grained retrieval for precision
- Use parent-child relationships for context

```

### Hybrid Search
Combine semantic and keyword search
**When:** Queries may be keyword-heavy or semantic
```
- BM25/TF-IDF for keyword matching
- Vector similarity for semantic matching
- Reciprocal Rank Fusion for combining scores
- Weight tuning based on query type

```

### Query Expansion
Expand queries to improve recall
**When:** User queries are short or ambiguous
```
- Use LLM to generate query variations
- Add synonyms and related terms
- Hypothetical Document Embedding (HyDE)
- Multi-query retrieval with deduplication

```

### Contextual Compression
Compress retrieved context to fit window
**When:** Retrieved chunks exceed context limits
```
- Extract relevant sentences only
- Use LLM to summarize chunks
- Remove redundant information
- Prioritize by relevance score

```

### Metadata Filtering
Pre-filter by metadata before semantic search
**When:** Documents have structured metadata
```
- Filter by date, source, category first
- Reduce search space before vector similarity
- Combine metadata filters with semantic scores
- Index metadata for fast filtering

```


## Anti-Patterns

### Fixed Chunk Size
Using fixed token counts regardless of content

### Embedding Everything
Embedding raw documents without preprocessing

### Ignoring Evaluation
Not measuring retrieval quality separately

### One Embedding Model
Using same embedding for all content types

### Naive Top-K
Just taking top K results without reranking

### Context Stuffing
Cramming maximum context into prompt


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [HIGH] Fixed-size chunking breaks sentences and context

**Situation:** Using fixed token/character limits for chunking

**Why it happens:**
Fixed-size chunks split mid-sentence, mid-paragraph, or mid-idea.
The resulting embeddings represent incomplete thoughts, leading to
poor retrieval quality. Users search for concepts but get fragments.


**Solution:**
```
Use semantic chunking that respects document structure:
- Split on sentence/paragraph boundaries
- Use embedding similarity to detect topic shifts
- Include overlap for context continuity
- Preserve headers and document structure as metadata

```

**Symptoms:**
- Retrieved chunks feel incomplete or cut off
- Answer quality varies wildly
- High recall but low precision

---

### [MEDIUM] Pure semantic search without metadata pre-filtering

**Situation:** Only using vector similarity, ignoring metadata

**Why it happens:**
Semantic search finds semantically similar content, but not necessarily
relevant content. Without metadata filtering, you return old docs when
user wants recent, wrong categories, or inapplicable content.


**Solution:**
```
Implement hybrid filtering:
- Pre-filter by metadata (date, source, category) before vector search
- Post-filter results by relevance criteria
- Include metadata in the retrieval API
- Allow users to specify filters

```

**Symptoms:**
- Returns outdated information
- Mixes content from wrong sources
- Users can't scope their searches

---

### [MEDIUM] Using same embedding model for different content types

**Situation:** One embedding model for code, docs, and structured data

**Why it happens:**
Embedding models are trained on specific content types. Using a text
embedding model for code, or a general model for domain-specific
content, produces poor similarity matches.


**Solution:**
```
Evaluate embeddings per content type:
- Use code-specific embeddings for code (e.g., CodeBERT)
- Consider domain-specific or fine-tuned embeddings
- Benchmark retrieval quality before choosing
- Separate indices for different content types if needed

```

**Symptoms:**
- Code search returns irrelevant results
- Domain terms not matched properly
- Similar concepts not clustered

---

### [MEDIUM] Using first-stage retrieval results directly

**Situation:** Taking top-K from vector search without reranking

**Why it happens:**
First-stage retrieval (vector search) optimizes for recall, not precision.
The top results by embedding similarity may not be the most relevant
for the specific query. Cross-encoder reranking dramatically improves
precision for the final results.


**Solution:**
```
Add reranking step:
- Retrieve larger candidate set (e.g., top 20-50)
- Rerank with cross-encoder (query-document pairs)
- Return reranked top-K (e.g., top 5)
- Cache reranker for performance

```

**Symptoms:**
- Clearly relevant docs not in top results
- Results order seems arbitrary
- Adding more results helps quality

---

### [MEDIUM] Cramming maximum context into LLM prompt

**Situation:** Using all retrieved context regardless of relevance

**Why it happens:**
More context isn't always better. Irrelevant context confuses the LLM,
increases latency and cost, and can cause the model to ignore the
most relevant information. Models have attention limits.


**Solution:**
```
Use relevance thresholds:
- Set minimum similarity score cutoff
- Limit context to truly relevant chunks
- Summarize or compress if needed
- Order context by relevance

```

**Symptoms:**
- Answers drift with more context
- LLM ignores key information
- High token costs

---

### [HIGH] Not measuring retrieval quality separately from generation

**Situation:** Only evaluating end-to-end RAG quality

**Why it happens:**
If answers are wrong, you can't tell if retrieval failed or generation
failed. This makes debugging impossible and leads to wrong fixes
(tuning prompts when retrieval is the problem).


**Solution:**
```
Separate retrieval evaluation:
- Create retrieval test set with relevant docs labeled
- Measure MRR, NDCG, Recall@K for retrieval
- Evaluate generation only on correct retrievals
- Track metrics over time

```

**Symptoms:**
- Can't diagnose poor RAG performance
- Prompt changes don't help
- Random quality variations

---

### [MEDIUM] Not updating embeddings when source documents change

**Situation:** Embeddings generated once, never refreshed

**Why it happens:**
Documents change but embeddings don't. Users retrieve outdated content
or, worse, content that no longer exists. This erodes trust in the
system.


**Solution:**
```
Implement embedding refresh:
- Track document versions/hashes
- Re-embed on document change
- Handle deleted documents
- Consider TTL for embeddings

```

**Symptoms:**
- Returns outdated information
- References deleted content
- Inconsistent with source

---

### [MEDIUM] Same retrieval strategy for all query types

**Situation:** Using pure semantic search for keyword-heavy queries

**Why it happens:**
Some queries are keyword-oriented (looking for specific terms) while
others are semantic (looking for concepts). Pure semantic search fails
on exact matches; pure keyword search fails on paraphrases.


**Solution:**
```
Implement hybrid search:
- BM25/TF-IDF for keyword matching
- Vector similarity for semantic matching
- Reciprocal Rank Fusion to combine
- Tune weights based on query patterns

```

**Symptoms:**
- Exact term searches miss results
- Concept searches too literal
- Users frustrated with both

---

## Collaboration

### Works Well With

- ai-agents-architect
- prompt-engineer
- database-architect
- backend

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/development/rag-engineer/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
