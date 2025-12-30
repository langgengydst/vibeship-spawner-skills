# Distributed Training

> Use when training models across multiple GPUs or nodes, handling large models that don't fit in memory, or optimizing training throughput - covers DDP, FSDP, DeepSpeed ZeRO, model/data parallelism, and gradient checkpointing

**Category:** ai | **Version:** 1.0.0

---

## Patterns


## Anti-Patterns


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] One process waits forever for others that diverged

**Why it happens:**
All processes must call the same operations in the same order.
If one process takes a different code path (e.g., skips a batch),
other processes wait forever for a synchronization that never comes.


**Solution:**
```
# All processes must make same decisions
# Use distributed-aware filtering

# Option 1: Filter before distributed sampler
filtered_dataset = [x for x in dataset if valid(x)]

# Option 2: Pad/mask instead of skip
if batch['size'] < min_batch_size:
    # Pad to min_batch_size instead of skipping
    batch = pad_batch(batch)

# Option 3: Collective decision
should_skip = batch['size'] < min_batch_size
all_should_skip = dist.all_reduce(should_skip, op=dist.ReduceOp.MAX)
if all_should_skip:
    continue  # All processes skip together

```

**Symptoms:**
- Training hangs indefinitely
- No error message, just frozen
- GPU utilization drops to 0%
- NCCL timeout errors after long wait

---

### [HIGH] CPU offload doesn't help if params don't fit during forward

**Why it happens:**
FSDP CPU offload stores parameters on CPU between forward/backward.
But during forward, parameters must be gathered to GPU.
If the full layer doesn't fit, you still OOM.


**Solution:**
```
# 1. Use finer-grained wrapping
# Wrap individual layers, not whole model
for layer in model.layers:
    FSDP(layer, cpu_offload=CPUOffload(offload_params=True))

# 2. Combine with activation checkpointing
model.gradient_checkpointing_enable()

# 3. Consider DeepSpeed with NVMe offload
# For truly massive models

# 4. Use model parallelism for huge layers
# Some layers must be split across GPUs

```

**Symptoms:**
- OOM during forward pass despite CPU offload
- Memory spikes when gathering parameters
- Offload seems to have no effect

---

### [HIGH] Gradient underflow/overflow without proper loss scaling

**Why it happens:**
fp16 has limited dynamic range (5.96e-8 to 65504).
Small gradients underflow to zero.
Without loss scaling, training fails silently.


**Solution:**
```
# Option 1: Use bf16 (no scaling needed, wider range)
with torch.autocast(dtype=torch.bfloat16):
    loss = model(batch)
loss.backward()
optimizer.step()

# Option 2: fp16 with GradScaler
from torch.cuda.amp import GradScaler
scaler = GradScaler()

with torch.autocast(dtype=torch.float16):
    loss = model(batch)

scaler.scale(loss).backward()
scaler.step(optimizer)
scaler.update()

```

**Symptoms:**
- Loss becomes NaN after some steps
- Gradients are all zeros
- Model parameters become inf

---

### [MEDIUM] Forgetting set_epoch() on DistributedSampler

**Why it happens:**
DistributedSampler uses epoch as random seed.
Without set_epoch(), same shuffling every epoch.
Model overfits to the order, not the data.


**Solution:**
```
train_sampler = DistributedSampler(dataset)
train_loader = DataLoader(dataset, sampler=train_sampler)

for epoch in range(epochs):
    train_sampler.set_epoch(epoch)  # Different shuffle each epoch!

    for batch in train_loader:
        train(batch)

```

**Symptoms:**
- Model sees same batch order every epoch
- Validation metrics oscillate without improving
- Training seems to plateau early

---

### [MEDIUM] Sharded checkpoint doesn't match current world size

**Why it happens:**
FSDP/DeepSpeed shard checkpoints across processes.
Loading on different number of GPUs requires resharding.
Naive torch.load() doesn't handle this.


**Solution:**
```
# Use FSDP's checkpoint utilities
from torch.distributed.checkpoint import load_state_dict, FileSystemReader

# Load with resharding
state_dict = {"model": model.state_dict()}
load_state_dict(
    state_dict=state_dict,
    storage_reader=FileSystemReader("checkpoint_dir"),
)
model.load_state_dict(state_dict["model"])

# Or: Save full state dict for portability
# FSDP: use_orig_params=True, state_dict_type=FULL_STATE_DICT

```

**Symptoms:**
- Checkpoint loading fails
- Shape mismatch errors
- Missing or extra keys in state dict

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `transformer|model.*architecture` | transformer-architecture | Model design |
| `fine.?tun|lora|qlora|adapt` | llm-fine-tuning | Fine-tuning strategy |
| `quantiz|optim.*inference|deploy` | model-optimization | Post-training optimization |
| `rlhf|reward|alignment` | reinforcement-learning | Distributed RLHF |

### Receives Work From

- **transformer-architecture**: Model to train
- **llm-fine-tuning**: Fine-tuning workload

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/ai/distributed-training/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
