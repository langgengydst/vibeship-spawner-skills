# LLM Fine-Tuning

> Use when adapting large language models to specific tasks, domains, or behaviors - covers LoRA, QLoRA, PEFT, instruction tuning, and full fine-tuning strategies

**Category:** ai | **Version:** 1.0.0

---

## Patterns


## Anti-Patterns


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] Training data has mixed formats, model outputs garbage

**Why it happens:**
LLMs learn patterns from data, including formatting.
If training data has "### Response:" sometimes and "Answer:" other times,
model will randomly produce both, breaking downstream parsing.


**Solution:**
```
# Use ONE consistent format
TEMPLATE = """### Instruction:
{instruction}

### Response:
{response}"""

# Validate all examples match format
for example in examples:
    assert example['text'].startswith("### Instruction:")
    assert "### Response:" in example['text']

```

**Symptoms:**
- Model sometimes follows format, sometimes doesn't
- Outputs contain format artifacts
- Inconsistent response structure

---

### [CRITICAL] Model only knows task domain, fails on everything else

**Why it happens:**
Fine-tuning updates weights toward task distribution.
Without general data, model overwrites general knowledge
with task-specific patterns.


**Solution:**
```
# Mix task and general data
task_data = load_task_dataset()
general_data = load_general_dataset()

# 70% task, 30% general
n_general = int(len(task_data) * 0.3 / 0.7)
general_sampled = general_data.shuffle().select(range(n_general))

mixed_data = concatenate_datasets([task_data, general_sampled])
mixed_data = mixed_data.shuffle(seed=42)

```

**Symptoms:**
- Model can't do basic tasks anymore
- Reasoning capability degraded
- Only responds well to training-like prompts

---

### [HIGH] Tokenizer has no pad token

**Why it happens:**
Many LLM tokenizers (Llama, Mistral) don't have pad tokens.
Training requires padding for batching.
Using eos_token as pad_token is common but has gotchas.


**Solution:**
```
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-2-7b")

# Option 1: Use eos as pad (common)
tokenizer.pad_token = tokenizer.eos_token

# Option 2: Add new pad token (safer)
tokenizer.add_special_tokens({'pad_token': '[PAD]'})
model.resize_token_embeddings(len(tokenizer))

# Option 3: Use left padding for generation
tokenizer.padding_side = 'left'

```

**Symptoms:**
- ValueError: Padding is required
- Model outputs <unk> tokens
- Loss is NaN or very high

---

### [HIGH] Target modules don't match model architecture

**Why it happens:**
Different model architectures use different module names.
Llama uses "q_proj", GPT-2 uses "c_attn".
Wrong names means LoRA isn't applied.


**Solution:**
```
# Architecture-specific target modules
TARGET_MODULES = {
    "llama": ["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    "mistral": ["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    "gpt2": ["c_attn", "c_proj", "c_fc"],
    "falcon": ["query_key_value", "dense", "dense_h_to_4h", "dense_4h_to_h"],
    "phi": ["q_proj", "k_proj", "v_proj", "dense", "fc1", "fc2"],
}

# Or auto-detect
for name, module in model.named_modules():
    print(name)  # Find the right names

```

**Symptoms:**
- ValueError: target_modules not found
- trainable params: 0
- Fine-tuning has no effect

---

### [MEDIUM] Gradient checkpointing still enabled during inference

**Why it happens:**
Gradient checkpointing recomputes activations during backward pass.
If not disabled, it also recomputes during inference (wasteful).


**Solution:**
```
# Disable before inference
model.gradient_checkpointing_disable()
model.eval()

# Or when loading for inference
model = AutoModelForCausalLM.from_pretrained(
    model_path,
    use_cache=True,  # Enable KV cache (incompatible with checkpointing)
)

```

**Symptoms:**
- Inference is 2-3x slower than expected
- High GPU memory usage during inference
- Same speed as training

---

### [MEDIUM] Merge fails because full model doesn't fit in memory

**Why it happens:**
Merging requires loading full model + adapter into memory.
For quantized training (QLoRA), the merged model is larger
than what fit during training.


**Solution:**
```
# Merge on CPU (slower but fits)
base_model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-70b",
    torch_dtype=torch.bfloat16,
    device_map="cpu",  # Merge on CPU
    low_cpu_mem_usage=True,
)

model = PeftModel.from_pretrained(base_model, adapter_path)
merged = model.merge_and_unload()
merged.save_pretrained(output_path)

# Or: Use unsloth for efficient merging
# Or: Keep adapters separate, load at inference

```

**Symptoms:**
- CUDA out of memory during merge
- Merge hangs indefinitely
- System becomes unresponsive

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `multi.*gpu|distributed|fsdp|ddp` | distributed-training | Distributed fine-tuning setup |
| `quantiz|deploy|inference.*optim` | model-optimization | Post-fine-tuning optimization |
| `rlhf|reward|preference|dpo` | reinforcement-learning | Alignment after SFT |
| `architecture|attention|layers` | transformer-architecture | Model architecture questions |

### Receives Work From

- **transformer-architecture**: Base model architecture
- **distributed-training**: Multi-GPU fine-tuning

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/ai/llm-fine-tuning/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
