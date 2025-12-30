# Transformer Architecture

> Use when implementing attention mechanisms, building custom transformer models, understanding positional encoding, or optimizing transformer inference - covers self-attention, multi-head attention, RoPE, ALiBi, and architecture variants

**Category:** ai | **Version:** 1.0.0

---

## Patterns


## Anti-Patterns


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] Dot products grow large, pushing softmax into saturated regions

**Why it happens:**
For large d_k, the dot products q·k can grow large in magnitude.
When passed through softmax, large values push gradients to near-zero.
The scaling factor 1/sqrt(d_k) keeps the variance of dot products ≈ 1.


**Solution:**
```
d_k = query.size(-1)
scores = torch.matmul(query, key.transpose(-2, -1)) / math.sqrt(d_k)
attention_weights = F.softmax(scores, dim=-1)

```

**Symptoms:**
- Vanishing gradients during training
- Attention weights become very peaky (near one-hot)
- Training diverges or stalls

---

### [CRITICAL] Decoder sees future tokens during training, fails at inference

**Why it happens:**
Decoder-only models must not see future tokens during training.
If the mask allows future token access, the model learns to cheat.
At inference, future tokens don't exist, so the model fails.


**Solution:**
```
# Correct: Lower triangular mask (each position sees only previous)
mask = torch.tril(torch.ones(seq_len, seq_len))  # Lower triangular

# Apply mask
scores = scores.masked_fill(mask == 0, float('-inf'))
attention_weights = F.softmax(scores, dim=-1)

```

**Symptoms:**
- Perfect training loss but poor generation
- Model generates repetitive or nonsensical text
- Validation loss much higher than training

---

### [HIGH] Original transformer used post-norm, but pre-norm is more stable

**Why it happens:**
Post-norm: x + LayerNorm(Attention(x))
Pre-norm: x + Attention(LayerNorm(x))

Pre-norm keeps residual path clean, gradients flow more easily.
Modern LLMs (GPT-3, LLaMA) all use pre-norm.


**Solution:**
```
# Pre-norm (modern, more stable)
residual = x
x = self.norm1(x)
x = self.attention(x)
x = residual + x

```

**Symptoms:**
- Training becomes unstable with more layers
- Requires very careful learning rate tuning
- Gradient explosion in deep networks

---

### [HIGH] KV cache grows linearly with sequence length

**Why it happens:**
KV cache stores key/value tensors for all previous tokens.
For a 7B model with 32 layers, 32 heads, 128 head_dim:
KV cache per token = 2 * 32 * 32 * 128 * 2 bytes = 512KB
4K context = 2GB just for KV cache


**Solution:**
```
# Use KV cache with proper memory management
past_key_values = None
for i in range(max_new_tokens):
    output = model(new_token_only, past_key_values=past_key_values)
    past_key_values = output.past_key_values

# For very long sequences: sliding window attention
# Or: quantize KV cache to int8

```

**Symptoms:**
- OOM during generation with long prompts
- Memory usage grows unexpectedly
- Batch size must decrease for longer sequences

---

### [MEDIUM] Learned/sinusoidal positions don't extrapolate well

**Why it happens:**
Learned positions: Only trained up to max_position_embeddings.
Sinusoidal: Frequencies may not extrapolate well.

RoPE and ALiBi are designed for length extrapolation.


**Solution:**
```
# Use RoPE or ALiBi for length extrapolation
class RotaryPositionalEmbedding(nn.Module):
    def __init__(self, dim, max_seq_len=4096, base=10000):
        # RoPE naturally extrapolates beyond training length
        ...

# Or dynamically extend positions
# LLaMA uses RoPE with NTK-aware scaling for longer contexts

```

**Symptoms:**
- Quality degrades on longer sequences
- Model produces garbage after position limit
- Perplexity spikes at certain positions

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `train.*multi.*gpu|distributed|fsdp|ddp` | distributed-training | Multi-GPU training setup |
| `quantiz|optimi.*inference|tensorrt|onnx` | model-optimization | Model optimization for deployment |
| `fine.?tun|lora|qlora|peft|adapt` | llm-fine-tuning | Fine-tuning transformer models |
| `rlhf|reward.*model|ppo|alignment` | reinforcement-learning | RLHF alignment training |
| `ner|relation.*extract|entity|nlp.*pipeline` | nlp-advanced | NLP information extraction |
| `object.*detect|segment|yolo|sam|vision` | computer-vision-deep | Vision transformer applications |

### Receives Work From

- **distributed-training**: Multi-GPU training strategies
- **model-optimization**: Inference optimization

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/ai/transformer-architecture/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
