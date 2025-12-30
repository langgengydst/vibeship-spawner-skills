# Advanced NLP

> Use when extracting structured information from text - named entity recognition, relation extraction, coreference resolution, knowledge graph construction, and information extraction pipelines

**Category:** ai | **Version:** 1.0.0

---

## Patterns


## Anti-Patterns


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] BERT tokenization breaks word boundaries

**Why it happens:**
BERT tokenizes "Cupertino" as ["Cup", "##ert", "##ino"].
If you have one label for "Cupertino", it doesn't match 3 tokens.
Training fails or learns wrong alignments.


**Solution:**
```
def tokenize_and_align_labels(examples, tokenizer):
    tokenized = tokenizer(
        examples["tokens"],
        truncation=True,
        is_split_into_words=True,
    )

    labels = []
    for i, label in enumerate(examples["ner_tags"]):
        word_ids = tokenized.word_ids(batch_index=i)
        label_ids = []
        previous_word_idx = None

        for word_idx in word_ids:
            if word_idx is None:
                label_ids.append(-100)  # Special tokens - ignore
            elif word_idx != previous_word_idx:
                label_ids.append(label[word_idx])  # First token of word
            else:
                label_ids.append(-100)  # Subword - ignore in loss

            previous_word_idx = word_idx

        labels.append(label_ids)

    tokenized["labels"] = labels
    return tokenized

```

**Symptoms:**
- Training crashes with shape mismatch
- Entity boundaries are wrong
- Model predicts partial words as entities

---

### [HIGH] Entity boundaries don't match actual mentions

**Why it happens:**
Entity boundaries depend on tokenization.
If training uses word-level and inference uses character-level,
boundaries won't match.


**Solution:**
```
# Consistent span extraction
def extract_spans_consistent(text, entities):
    spans = []
    for ent in entities:
        # Always use character offsets
        start_char = ent['start_char']
        end_char = ent['end_char']

        # Validate span matches text
        extracted = text[start_char:end_char]
        assert extracted == ent['text'], f"Mismatch: {extracted} vs {ent['text']}"

        spans.append({
            'text': extracted,
            'start': start_char,
            'end': end_char,
            'label': ent['label'],
        })

    return spans

```

**Symptoms:**
- Entities include extra words
- Entities cut off early
- Different boundaries in train vs inference

---

### [HIGH] No negative examples in training

**Why it happens:**
Relation extraction is often imbalanced.
If you only train on positive (related) pairs,
model never learns to say "no relation".


**Solution:**
```
# Add negative sampling
def create_re_dataset(entities, positive_relations):
    data = []

    # Positive pairs
    for rel in positive_relations:
        data.append({
            'entity1': rel['subject'],
            'entity2': rel['object'],
            'relation': rel['type'],
        })

    # Negative pairs (unrelated entity pairs)
    related_pairs = {(r['subject'], r['object']) for r in positive_relations}

    for e1 in entities:
        for e2 in entities:
            if e1 != e2 and (e1, e2) not in related_pairs:
                data.append({
                    'entity1': e1,
                    'entity2': e2,
                    'relation': 'no_relation',
                })

    # Balance: 1:3 positive to negative ratio
    return balance_dataset(data, ratio=3)

```

**Symptoms:**
- Model predicts relations between unrelated entities
- High recall, terrible precision
- Random entity pairs get high confidence

---

### [MEDIUM] Context window too short for document-level coref

**Why it happens:**
BERT-based models have 512 token limit.
Document-level coreference needs full document context.
Truncation breaks long-range dependencies.


**Solution:**
```
# Option 1: Use Longformer for long documents
from transformers import LongformerForTokenClassification

model = LongformerForTokenClassification.from_pretrained(
    "shtoshni/longformer_coreference_joint"
)  # 4096 token context

# Option 2: Sliding window with merging
def process_long_document(doc, window_size=512, overlap=128):
    chunks = []
    for i in range(0, len(doc), window_size - overlap):
        chunk = doc[i:i + window_size]
        chunks.append((i, chunk))

    # Process each chunk
    chunk_results = [model(chunk) for _, chunk in chunks]

    # Merge results, resolving overlaps
    return merge_coref_chains(chunk_results, overlap)

```

**Symptoms:**
- Pronouns not linked to antecedents
- Works in single sentences, fails on paragraphs
- Coreference chains incomplete

---

### [MEDIUM] Same entity with different mentions not merged

**Why it happens:**
NER extracts surface forms, not canonical entities.
"Apple", "Apple Inc.", "the tech giant" are all Apple.
Without entity linking/clustering, they're separate.


**Solution:**
```
class EntityResolver:
    def __init__(self):
        self.canonical_forms = {}  # surface -> canonical

    def resolve(self, entity_text, entity_type):
        # Normalize
        normalized = entity_text.lower().strip()
        normalized = re.sub(r'\s+(inc|corp|llc|ltd)\.?$', '', normalized)

        # Check if we've seen similar
        if normalized in self.canonical_forms:
            return self.canonical_forms[normalized]

        # Or use entity linking
        linked = entity_linker.link(entity_text)
        if linked:
            canonical = linked.wikidata_id
        else:
            canonical = normalized

        self.canonical_forms[normalized] = canonical
        return canonical

# Usage
resolver = EntityResolver()
for entity in entities:
    canonical_id = resolver.resolve(entity['text'], entity['type'])
    graph.add_node(canonical_id, mentions=[entity['text']])

```

**Symptoms:**
- Apple Inc. and Apple are separate nodes
- Graph has more entities than expected
- Relations duplicated across mentions

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `fine.?tun|train.*model|domain.*adapt` | llm-fine-tuning | Model training |
| `architecture|attention|custom.*model` | transformer-architecture | Model architecture |
| `image.*text|document.*understand|ocr` | computer-vision-deep | Multi-modal document processing |
| `deploy|inference|optim.*speed` | model-optimization | Deployment optimization |

### Receives Work From

- **llm-fine-tuning**: Domain-specific NLP model
- **transformer-architecture**: Custom NLP architecture

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/ai/nlp-advanced/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
