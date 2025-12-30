# Document AI

> Comprehensive patterns for AI-powered document understanding including
PDF parsing, OCR, invoice/receipt extraction, table extraction,
multimodal RAG with vision models, and structured data output.


**Category:** ai-ml | **Version:** 1.0.0

---

## Patterns

### PDF Parsing with Claude Vision
Extract structured data from PDFs using Claude's vision
**When:** User needs to extract data from PDF documents
```
import Anthropic from "@anthropic-ai/sdk";
import { pdf } from "pdf-to-img";
import * as fs from "fs";

const anthropic = new Anthropic();

interface ExtractionResult {
  pages: PageContent[];
  metadata: DocumentMetadata;
}

interface PageContent {
  pageNumber: number;
  text: string;
  tables: Table[];
  images: ImageDescription[];
}

// Convert PDF pages to base64 images
async function pdfToImages(pdfPath: string): Promise<string[]> {
  const images: string[] = [];

  const document = await pdf(pdfPath, { scale: 2 }); // Higher scale for OCR

  for await (const image of document) {
    const base64 = image.toString("base64");
    images.push(base64);
  }

  return images;
}

// Extract structured data from a single page
async function extractPageContent(
  imageBase64: string,
  pageNumber: number,
  schema?: string
): Promise<PageContent> {
  const systemPrompt = schema
    ? `Extract information according to this JSON schema: ${schema}`
    : "Extract all text, tables, and describe any images/charts.";

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/png",
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: `${systemPrompt}

            For tables, output as structured JSON arrays.
            For images/charts, describe what they show.
            Preserve the document's logical structure.`,
          },
        ],
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type");
  }

  return {
    pageNumber,
    text: content.text,
    tables: extractTablesFromText(content.text),
    images: extractImageDescriptions(content.text),
  };
}

// Process entire PDF
async function extractFromPDF(
  pdfPath: string,
  options?: {
    maxPages?: number;
    schema?: string;
    concurrency?: number;
  }
): Promise<ExtractionResult> {
  const { maxPages = 100, schema, concurrency = 3 } = options || {};

  // Validate file size (Claude limit: 32MB)
  const stats = fs.statSync(pdfPath);
  if (stats.size > 32 * 1024 * 1024) {
    throw new Error("PDF exceeds 32MB limit. Split into smaller files.");
  }

  // Convert to images
  const images = await pdfToImages(pdfPath);

  if (images.length > maxPages) {
    throw new Error(`PDF has ${images.length} pages, max is ${maxPages}`);
  }

  // Process pages with controlled concurrency
  const pages: PageContent[] = [];

  for (let i = 0; i < images.length; i += concurrency) {
    const batch = images.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((img, idx) =>
        extractPageContent(img, i + idx + 1, schema)
      )
    );
    pages.push(...batchResults);
  }

  return {
    pages,
    metadata: {
      totalPages: images.length,
      processedAt: new Date().toISOString(),
    },
  };
}

```

### Invoice Extraction with Schema Validation
Extract structured invoice data with Zod schema enforcement
**When:** User needs to process invoices or receipts
```
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const anthropic = new Anthropic();

// Define strict schema for invoice data
const InvoiceSchema = z.object({
  invoiceNumber: z.string().describe("Invoice ID or number"),
  invoiceDate: z.string().describe("Date in YYYY-MM-DD format"),
  dueDate: z.string().optional().describe("Payment due date"),
  vendor: z.object({
    name: z.string(),
    address: z.string().optional(),
    taxId: z.string().optional(),
  }),
  customer: z.object({
    name: z.string(),
    address: z.string().optional(),
  }),
  lineItems: z.array(
    z.object({
      description: z.string(),
      quantity: z.number(),
      unitPrice: z.number(),
      amount: z.number(),
    })
  ),
  subtotal: z.number(),
  taxAmount: z.number().optional(),
  total: z.number(),
  currency: z.string().default("USD"),
});

type Invoice = z.infer<typeof InvoiceSchema>;

async function extractInvoice(imageBase64: string): Promise<Invoice> {
  const jsonSchema = zodToJsonSchema(InvoiceSchema);

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/png",
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: `Extract invoice data from this image.

            Return ONLY valid JSON matching this schema:
            ${JSON.stringify(jsonSchema, null, 2)}

            Rules:
            - All amounts should be numbers, not strings
            - Dates must be in YYYY-MM-DD format
            - If a field is unclear, use your best interpretation
            - Do not include any text outside the JSON object`,
          },
        ],
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type");
  }

  // Parse and validate with Zod
  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON found in response");
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return InvoiceSchema.parse(parsed);
}

// Batch process multiple invoices
async function processInvoiceBatch(
  imagePaths: string[],
  onProgress?: (completed: number, total: number) => void
): Promise<{ results: Invoice[]; errors: Error[] }> {
  const results: Invoice[] = [];
  const errors: Error[] = [];

  for (let i = 0; i < imagePaths.length; i++) {
    try {
      const imageBuffer = fs.readFileSync(imagePaths[i]);
      const base64 = imageBuffer.toString("base64");
      const invoice = await extractInvoice(base64);
      results.push(invoice);
    } catch (error) {
      errors.push(error as Error);
    }

    onProgress?.(i + 1, imagePaths.length);
  }

  return { results, errors };
}

```

### Table Extraction from Documents
Extract tables as structured data from PDFs/images
**When:** User needs to extract tabular data from documents
```
import OpenAI from "openai";

const openai = new OpenAI();

interface ExtractedTable {
  headers: string[];
  rows: string[][];
  title?: string;
  pageNumber?: number;
}

async function extractTables(
  imageBase64: string,
  options?: {
    format?: "json" | "csv" | "markdown";
    pageNumber?: number;
  }
): Promise<ExtractedTable[]> {
  const { format = "json", pageNumber } = options || {};

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:image/png;base64,${imageBase64}`,
              detail: "high",
            },
          },
          {
            type: "text",
            text: `Extract ALL tables from this document image.

            For each table:
            1. Identify the table title/caption if present
            2. Extract all headers
            3. Extract all data rows
            4. Preserve the exact cell values

            Return as JSON array:
            [
              {
                "title": "Optional table title",
                "headers": ["Column1", "Column2", ...],
                "rows": [
                  ["value1", "value2", ...],
                  ...
                ]
              }
            ]

            If no tables found, return empty array [].
            Return ONLY the JSON, no other text.`,
          },
        ],
      },
    ],
    max_tokens: 4096,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  if (!content) return [];

  const parsed = JSON.parse(content);
  const tables = Array.isArray(parsed) ? parsed : parsed.tables || [];

  return tables.map((t: any) => ({
    ...t,
    pageNumber,
  }));
}

// Convert extracted table to different formats
function tableToCSV(table: ExtractedTable): string {
  const escape = (cell: string) =>
    cell.includes(",") ? `"${cell}"` : cell;

  const headerRow = table.headers.map(escape).join(",");
  const dataRows = table.rows.map((row) =>
    row.map(escape).join(",")
  );

  return [headerRow, ...dataRows].join("\n");
}

function tableToMarkdown(table: ExtractedTable): string {
  const headerRow = `| ${table.headers.join(" | ")} |`;
  const separator = `| ${table.headers.map(() => "---").join(" | ")} |`;
  const dataRows = table.rows.map(
    (row) => `| ${row.join(" | ")} |`
  );

  let md = "";
  if (table.title) md += `### ${table.title}\n\n`;
  md += [headerRow, separator, ...dataRows].join("\n");

  return md;
}

```

### Multimodal RAG for Document Q&A
Build Q&A over documents with vision-enhanced RAG
**When:** User needs to query large document collections
```
import OpenAI from "openai";
import { Index } from "@upstash/vector";

const openai = new OpenAI();
const vectorIndex = new Index();

interface DocumentChunk {
  id: string;
  pageNumber: number;
  content: string;
  imageBase64?: string; // Store for visual queries
  embedding?: number[];
}

// Index a document for RAG
async function indexDocument(
  documentId: string,
  pages: { text: string; imageBase64: string }[]
) {
  const chunks: DocumentChunk[] = [];

  for (let i = 0; i < pages.length; i++) {
    const { text, imageBase64 } = pages[i];

    // Create text embedding
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

    const chunk: DocumentChunk = {
      id: `${documentId}-page-${i + 1}`,
      pageNumber: i + 1,
      content: text,
      imageBase64,
      embedding: embeddingResponse.data[0].embedding,
    };

    chunks.push(chunk);

    // Store in vector DB
    await vectorIndex.upsert({
      id: chunk.id,
      vector: chunk.embedding!,
      metadata: {
        documentId,
        pageNumber: chunk.pageNumber,
        content: chunk.content,
        hasImage: !!imageBase64,
      },
    });
  }

  return chunks;
}

// Query documents with multimodal understanding
async function queryDocuments(
  query: string,
  options?: {
    documentIds?: string[];
    topK?: number;
    useVision?: boolean;
  }
): Promise<{ answer: string; sources: DocumentChunk[] }> {
  const { topK = 5, useVision = true } = options || {};

  // Get query embedding
  const queryEmbedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  });

  // Search vector DB
  const results = await vectorIndex.query({
    vector: queryEmbedding.data[0].embedding,
    topK,
    includeMetadata: true,
  });

  // Retrieve full chunks with images
  const chunks = await Promise.all(
    results.map(async (r) => {
      // Fetch full chunk from storage
      return getChunkById(r.id);
    })
  );

  // Build multimodal prompt
  const messages: any[] = [
    {
      role: "system",
      content: `Answer questions based on the provided document pages.
        Cite specific page numbers when referencing information.
        If the answer isn't in the documents, say so.`,
    },
  ];

  // Add retrieved pages as context
  const userContent: any[] = [];

  for (const chunk of chunks) {
    if (useVision && chunk.imageBase64) {
      // Include page image for visual understanding
      userContent.push({
        type: "image_url",
        image_url: {
          url: `data:image/png;base64,${chunk.imageBase64}`,
          detail: "low", // Use low for cost efficiency
        },
      });
    }

    userContent.push({
      type: "text",
      text: `[Page ${chunk.pageNumber}]:\n${chunk.content}`,
    });
  }

  userContent.push({
    type: "text",
    text: `\n\nQuestion: ${query}`,
  });

  messages.push({ role: "user", content: userContent });

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    max_tokens: 1024,
  });

  return {
    answer: response.choices[0].message.content || "",
    sources: chunks,
  };
}

```

### Using LlamaParse for Complex Documents
Parse complex documents with LlamaParse API
**When:** Need specialized document parsing beyond basic vision
```
import { LlamaParseReader } from "llamaindex";

const reader = new LlamaParseReader({
  apiKey: process.env.LLAMA_CLOUD_API_KEY,
  resultType: "markdown", // or "text", "json"
  parsingInstruction: "Extract all tables and preserve layout",
});

interface ParsedDocument {
  content: string;
  metadata: Record<string, any>;
}

async function parseWithLlamaparse(
  filePath: string,
  options?: {
    outputFormat?: "markdown" | "text" | "json";
    parseInstruction?: string;
  }
): Promise<ParsedDocument[]> {
  const { outputFormat = "markdown", parseInstruction } = options || {};

  const customReader = new LlamaParseReader({
    apiKey: process.env.LLAMA_CLOUD_API_KEY,
    resultType: outputFormat,
    ...(parseInstruction && { parsingInstruction: parseInstruction }),
  });

  const documents = await customReader.loadData(filePath);

  return documents.map((doc) => ({
    content: doc.text,
    metadata: doc.metadata || {},
  }));
}

// Parse with specific extraction focus
async function parseInvoicesWithLlamaparse(filePath: string) {
  return parseWithLlamaparse(filePath, {
    outputFormat: "json",
    parseInstruction: `
      Extract invoice data with the following structure:
      - Invoice number
      - Date
      - Vendor information
      - Line items with quantities and prices
      - Totals and taxes
      Return as structured JSON.
    `,
  });
}

```

### Using Unstructured.io for Enterprise
Process documents with Unstructured API
**When:** Need enterprise-grade document processing
```
import { UnstructuredClient } from "unstructured-client";
import { Strategy } from "unstructured-client/sdk/models/shared";

const client = new UnstructuredClient({
  serverURL: "https://api.unstructured.io",
  security: {
    apiKeyAuth: process.env.UNSTRUCTURED_API_KEY,
  },
});

interface UnstructuredElement {
  type: string;
  text: string;
  metadata: {
    page_number?: number;
    coordinates?: any;
    parent_id?: string;
  };
}

async function processWithUnstructured(
  filePath: string,
  options?: {
    strategy?: "fast" | "hi_res" | "ocr_only";
    extractTables?: boolean;
    extractImages?: boolean;
  }
): Promise<UnstructuredElement[]> {
  const {
    strategy = "hi_res",
    extractTables = true,
    extractImages = false,
  } = options || {};

  const fileBuffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);

  const response = await client.general.partition({
    partitionParameters: {
      files: {
        content: fileBuffer,
        fileName,
      },
      strategy: strategy as Strategy,
      extractImageBlockTypes: extractImages ? ["Image", "Table"] : [],
      includePageBreaks: true,
    },
  });

  return response.elements as UnstructuredElement[];
}

// Extract structured data from elements
function extractStructuredData(elements: UnstructuredElement[]) {
  const tables = elements.filter((e) => e.type === "Table");
  const text = elements
    .filter((e) => e.type === "NarrativeText" || e.type === "Title")
    .map((e) => e.text)
    .join("\n\n");

  const byPage = elements.reduce((acc, el) => {
    const page = el.metadata.page_number || 1;
    if (!acc[page]) acc[page] = [];
    acc[page].push(el);
    return acc;
  }, {} as Record<number, UnstructuredElement[]>);

  return { tables, text, byPage };
}

```


## Anti-Patterns

### Processing large PDFs without chunking
**Why it's bad:** Exceeds token limits, causes timeouts, high costs

### No schema validation on extracted data
**Why it's bad:** LLMs can hallucinate fields, produce invalid JSON

### Ignoring low image quality
**Why it's bad:** Poor scans produce garbage extraction

### Not handling multi-column layouts
**Why it's bad:** Text gets jumbled between columns


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [HIGH] Claude on Bedrock requires citations for full PDF vision

**Situation:** Using Claude via Amazon Bedrock Converse API for PDFs

**Why it happens:**
Without citations enabled in Bedrock's Converse API, Claude falls
back to basic text extraction only - losing all visual understanding.
You won't get table structure, layouts, or image descriptions.
This is a silent degradation - no error is thrown.


**Solution:**
```
Always enable citations when using Bedrock for PDF processing:

```typescript
import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({ region: "us-east-1" });

const response = await client.send(
  new ConverseCommand({
    modelId: "anthropic.claude-sonnet-4-20250514-v1:0",
    messages: [...],
    // CRITICAL: Enable citations for full PDF vision
    additionalModelRequestFields: {
      enable_citations: true, // Without this, text-only extraction!
    },
  })
);
```

```

---

### [HIGH] PDF uploads silently truncated or rejected

**Situation:** Uploading large or many-page PDFs

**Why it happens:**
Claude limits:
- 32MB max file size
- 100 pages max per upload
- ~200k tokens for images (each page as image)

Exceeding these either fails silently, truncates content,
or produces incomplete extraction without warning.


**Solution:**
```
Validate before processing:

```typescript
import * as fs from "fs";
import { pdf } from "pdf-to-img";

const MAX_FILE_SIZE = 32 * 1024 * 1024; // 32MB
const MAX_PAGES = 100;

async function validatePDF(pdfPath: string) {
  // Check file size
  const stats = fs.statSync(pdfPath);
  if (stats.size > MAX_FILE_SIZE) {
    throw new Error(
      `PDF is ${(stats.size / 1024 / 1024).toFixed(1)}MB, max is 32MB. Split the file.`
    );
  }

  // Check page count
  const document = await pdf(pdfPath);
  let pageCount = 0;
  for await (const _ of document) {
    pageCount++;
    if (pageCount > MAX_PAGES) {
      throw new Error(
        `PDF has more than ${MAX_PAGES} pages. Split into sections.`
      );
    }
  }

  return { pageCount, sizeBytes: stats.size };
}
```

```

---

### [HIGH] Vision models hallucinate data from unclear documents

**Situation:** Extracting from low-quality scans or handwriting

**Why it happens:**
When document quality is poor, vision models don't say "unclear" -
they guess and produce plausible-looking but wrong data.

In benchmarks:
- GPT o3-mini produced "100% hallucinated" data on some test PDFs
- Claude missed passenger names in unclear sections
- Confidence doesn't correlate with accuracy


**Solution:**
```
Add validation and confidence scoring:

```typescript
async function extractWithConfidence(imageBase64: string) {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: "image/png", data: imageBase64 },
          },
          {
            type: "text",
            text: `Extract data and rate your confidence for each field.

            Return JSON:
            {
              "data": { ... extracted fields ... },
              "confidence": {
                "overall": 0.0-1.0,
                "fields": {
                  "field_name": {
                    "value": 0.0-1.0,
                    "reason": "why confident/uncertain"
                  }
                }
              }
            }`,
          },
        ],
      },
    ],
  });

  const result = JSON.parse(response.content[0].text);

  // Flag low-confidence extractions
  if (result.confidence.overall < 0.8) {
    result.requiresReview = true;
    result.lowConfidenceFields = Object.entries(result.confidence.fields)
      .filter(([_, v]) => (v as any).value < 0.7)
      .map(([k]) => k);
  }

  return result;
}
```

```

---

### [MEDIUM] Table extraction fails on complex layouts

**Situation:** Extracting tables with merged cells, nested tables, or spanning headers

**Why it happens:**
Vision models struggle with:
- Multi-row header cells
- Merged cells spanning columns
- Tables without clear borders
- Nested/hierarchical tables
- Tables split across pages

Accuracy drops significantly - one benchmark showed
47% accuracy on text parsing vs 87% on native image processing.


**Solution:**
```
Use specialized prompts and validate structure:

```typescript
async function extractComplexTable(imageBase64: string) {
  // First pass: understand table structure
  const structurePrompt = `Analyze this table's structure:
    1. How many header rows are there?
    2. Are there any merged cells?
    3. Are there sub-headers or grouped columns?
    4. Is the table split across pages?

    Return as JSON:
    {
      "headerRows": number,
      "hasMergedCells": boolean,
      "hasSubgroups": boolean,
      "isSplit": boolean,
      "description": "human readable description"
    }`;

  const structure = await extractWithPrompt(imageBase64, structurePrompt);

  // Second pass: extract with structure-aware prompt
  const extractPrompt = structure.hasMergedCells
    ? `Extract this table. Handle merged cells by repeating values.`
    : `Extract this table as a simple grid.`;

  const table = await extractWithPrompt(imageBase64, extractPrompt);

  // Validate: row counts should match
  if (table.rows.length > 0) {
    const expectedCols = table.headers.length;
    const badRows = table.rows.filter((r) => r.length !== expectedCols);
    if (badRows.length > 0) {
      console.warn(`${badRows.length} rows have incorrect column count`);
    }
  }

  return table;
}
```

```

---

### [MEDIUM] Multi-column layouts get text order wrong

**Situation:** Processing newspapers, academic papers, or multi-column documents

**Why it happens:**
Standard text extraction reads left-to-right, top-to-bottom.
Multi-column documents need column-first reading order.
Without layout awareness, text from different columns intermixes.


**Solution:**
```
Use layout-aware extraction:

```typescript
async function extractMultiColumnText(imageBase64: string) {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: "image/png", data: imageBase64 },
          },
          {
            type: "text",
            text: `This document may have multiple columns.

            1. First, identify the layout (single column, two columns, etc.)
            2. For multi-column layouts, read each column top-to-bottom before moving to the next
            3. Preserve logical paragraph breaks

            Return JSON:
            {
              "layout": "single" | "two-column" | "three-column" | "complex",
              "columns": [
                { "text": "content of column 1..." },
                { "text": "content of column 2..." }
              ],
              "fullText": "combined text in correct reading order"
            }`,
          },
        ],
      },
    ],
  });

  return JSON.parse(response.content[0].text);
}
```

```

---

### [MEDIUM] Scanned PDFs need OCR, not text extraction

**Situation:** Processing scanned documents or image-only PDFs

**Why it happens:**
Many PDFs look like text but are actually embedded images.
Calling pdf.getText() returns empty string.
Need to rasterize to images and use vision models.


**Solution:**
```
Detect and handle scanned PDFs:

```typescript
import { PdfReader } from "pdfreader";
import { pdf } from "pdf-to-img";

async function isPDFScanned(pdfPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    let hasText = false;

    new PdfReader().parseFileItems(pdfPath, (err, item) => {
      if (err) {
        resolve(true); // Assume scanned if can't parse
        return;
      }
      if (!item) {
        resolve(!hasText);
        return;
      }
      if (item.text) {
        hasText = true;
      }
    });
  });
}

async function extractPDFContent(pdfPath: string) {
  const isScanned = await isPDFScanned(pdfPath);

  if (isScanned) {
    console.log("Scanned PDF detected, using vision extraction");
    return extractWithVision(pdfPath);
  } else {
    // Has native text - can use faster text extraction
    // But vision still better for tables/layouts
    return extractWithVision(pdfPath); // Often vision is still better
  }
}
```

```

---

### [MEDIUM] Every invoice format is different

**Situation:** Extracting invoices from multiple vendors

**Why it happens:**
No two companies format invoices the same way.
Training on one format doesn't generalize well.
Field names vary: "Invoice #" vs "Inv No" vs "Bill Number"
Layouts vary: vendor at top vs bottom, items inline vs table.


**Solution:**
```
Use flexible schema with field mapping:

```typescript
const InvoiceFieldAliases = {
  invoiceNumber: [
    "Invoice #", "Invoice No", "Inv #", "Bill Number",
    "Invoice Number", "Reference", "Doc No",
  ],
  date: [
    "Invoice Date", "Date", "Inv Date", "Bill Date",
    "Document Date", "Issue Date",
  ],
  total: [
    "Total", "Grand Total", "Amount Due", "Balance Due",
    "Total Due", "Invoice Total", "Net Amount",
  ],
};

async function extractFlexibleInvoice(imageBase64: string) {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: "image/png", data: imageBase64 },
          },
          {
            type: "text",
            text: `Extract invoice data. Common field names include:
            - Invoice number: "Invoice #", "Inv No", etc.
            - Date: "Invoice Date", "Date", etc.
            - Total: "Total", "Grand Total", "Amount Due", etc.

            Map whatever labels you find to these standard fields:
            {
              "invoiceNumber": "...",
              "date": "YYYY-MM-DD",
              "vendorName": "...",
              "total": number,
              "currency": "USD/EUR/etc",
              "lineItems": [...]
            }`,
          },
        ],
      },
    ],
  });

  return JSON.parse(response.content[0].text);
}
```

```

---

### [MEDIUM] PDF images consume massive tokens

**Situation:** Processing many pages or high-resolution documents

**Why it happens:**
Each page as image = ~1000-2000 tokens (Claude)
100-page PDF = 100k-200k tokens just for input
At ~$15/million tokens = $1.50-3.00 per large document

Costs add up fast with batch processing.


**Solution:**
```
Track and limit costs:

```typescript
const TOKENS_PER_PAGE = 1500; // Approximate
const COST_PER_MILLION_TOKENS = 15; // Claude Sonnet input

class DocumentCostTracker {
  async estimateCost(pdfPath: string): Promise<{
    pages: number;
    estimatedTokens: number;
    estimatedCost: number;
  }> {
    const pageCount = await countPDFPages(pdfPath);
    const estimatedTokens = pageCount * TOKENS_PER_PAGE;
    const estimatedCost = (estimatedTokens / 1_000_000) * COST_PER_MILLION_TOKENS;

    return { pages: pageCount, estimatedTokens, estimatedCost };
  }

  async processWithBudget(
    pdfPath: string,
    maxCost: number
  ) {
    const estimate = await this.estimateCost(pdfPath);

    if (estimate.estimatedCost > maxCost) {
      throw new Error(
        `Estimated cost $${estimate.estimatedCost.toFixed(2)} exceeds budget $${maxCost}`
      );
    }

    return extractFromPDF(pdfPath);
  }
}
```

```

---

### [LOW] Password-protected PDFs silently fail

**Situation:** Processing PDFs with password protection

**Why it happens:**
Password-protected PDFs can't be rasterized or parsed.
Some libraries fail silently, returning empty results.
Claude API rejects password-protected uploads.


**Solution:**
```
Detect and handle protected PDFs:

```typescript
import { PDFDocument } from "pdf-lib";

async function isPDFProtected(pdfPath: string): Promise<boolean> {
  try {
    const pdfBytes = fs.readFileSync(pdfPath);
    await PDFDocument.load(pdfBytes);
    return false;
  } catch (error: any) {
    if (error.message.includes("encrypted") || error.message.includes("password")) {
      return true;
    }
    throw error;
  }
}

async function processSecurePDF(pdfPath: string, password?: string) {
  if (await isPDFProtected(pdfPath)) {
    if (!password) {
      throw new Error("PDF is password-protected. Please provide password.");
    }

    const pdfBytes = fs.readFileSync(pdfPath);
    const decrypted = await PDFDocument.load(pdfBytes, { password });
    const decryptedBytes = await decrypted.save();

    // Save decrypted version temporarily
    const tempPath = `/tmp/${Date.now()}-decrypted.pdf`;
    fs.writeFileSync(tempPath, decryptedBytes);

    try {
      return extractFromPDF(tempPath);
    } finally {
      fs.unlinkSync(tempPath);
    }
  }

  return extractFromPDF(pdfPath);
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

Full skill path: `~/.spawner/skills/ai-ml/document-ai/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
