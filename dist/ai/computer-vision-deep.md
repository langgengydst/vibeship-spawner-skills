# Computer Vision Deep

> Use when implementing object detection, semantic/instance segmentation, 3D vision, or video understanding - covers YOLO, SAM, depth estimation, and multi-modal vision

**Category:** ai | **Version:** 1.0.0

---

## Patterns


## Anti-Patterns


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] Input resolution too low for small objects

**Why it happens:**
Object detectors need minimum feature map size to detect.
At 640x640, a 10x10 pixel object becomes 1x1 on final feature map.
Below threshold, object becomes undetectable.


**Solution:**
```
# Higher resolution for small objects
results = model(image, imgsz=1280)  # 2x resolution

# Or use tiled inference
from sahi import AutoDetectionModel, get_sliced_prediction

detection_model = AutoDetectionModel.from_pretrained(
    model_type="yolov8",
    model_path="yolov8n.pt",
)

result = get_sliced_prediction(
    image,
    detection_model,
    slice_height=640,
    slice_width=640,
    overlap_height_ratio=0.2,
    overlap_width_ratio=0.2,
)

```

**Symptoms:**
- Small objects not detected
- Works on large objects, fails on small
- Recall drops dramatically for small objects

---

### [CRITICAL] Geometric augmentations not applied to masks

**Why it happens:**
Geometric augmentations (rotation, flip, crop) change pixel locations.
If mask isn't transformed identically, supervision is wrong.
Model learns to predict wrong regions.


**Solution:**
```
import albumentations as A

# Apply SAME transform to both
transform = A.Compose([
    A.RandomRotate90(p=0.5),
    A.HorizontalFlip(p=0.5),
    A.RandomResizedCrop(512, 512, scale=(0.5, 1.0)),
])

# Transform together
transformed = transform(image=image, mask=mask)
augmented_image = transformed['image']
augmented_mask = transformed['mask']

```

**Symptoms:**
- Masks are offset from objects
- Training loss doesn't decrease
- Model predicts wrong regions

---

### [HIGH] NMS threshold not tuned for use case

**Why it happens:**
NMS (Non-Maximum Suppression) removes duplicate boxes.
Too high IoU threshold: duplicates remain.
Too low: overlapping objects get suppressed.


**Solution:**
```
# Tune for your use case
results = model(
    image,
    conf=0.25,  # Confidence threshold
    iou=0.45,   # IoU for NMS (lower = more suppression)
)

# For crowded scenes (pedestrians, products)
iou=0.5  # Higher threshold, keep overlapping boxes

# For sparse scenes (vehicles, large objects)
iou=0.3  # Lower threshold, aggressive duplicate removal

# Alternative: Soft-NMS for crowded scenes
# Reduces score instead of removing

```

**Symptoms:**
- Multiple boxes on same object
- Overlapping objects miss detections
- Confidence seems wrong

---

### [MEDIUM] Re-encoding image for every prompt

**Why it happens:**
SAM has two stages: image encoding and mask decoding.
Image encoding is expensive (~150ms on GPU).
If you re-encode for each prompt, it's 150ms × N prompts.


**Solution:**
```
# Encode once, decode many
predictor = SamPredictor(sam)
predictor.set_image(image)  # Encode once (~150ms)

for box in bounding_boxes:
    # Only decode (~10ms each)
    masks, scores, _ = predictor.predict(box=box)

# For batch processing
from segment_anything import SamPredictor

predictor.set_image(image)
all_masks = []

for prompt in prompts:
    mask, _, _ = predictor.predict(**prompt)
    all_masks.append(mask)

```

**Symptoms:**
- Interactive segmentation is slow
- Batch segmentation takes forever
- GPU utilization spiky

---

### [MEDIUM] Similar objects swap identities

**Why it happens:**
Tracking algorithms rely on appearance + motion.
When objects look similar and cross paths,
the tracker can confuse their identities.


**Solution:**
```
# Use more robust tracker
results = model.track(
    video_path,
    tracker="botsort.yaml",  # Better re-ID
    persist=True,
)

# Or use appearance-based re-identification
# Add ReID model for feature matching

# Tune tracking parameters
# botsort.yaml:
# track_high_thresh: 0.5  # Higher for fewer false positives
# track_low_thresh: 0.1
# match_thresh: 0.8
# new_track_thresh: 0.6

```

**Symptoms:**
- Person A becomes Person B mid-video
- Objects crossing paths swap IDs
- Consistent tracking breaks on occlusion

---

### [MEDIUM] Relative depth, not metric depth

**Why it happens:**
Single-image depth estimation is inherently ambiguous.
A toy car close up looks like a real car far away.
Most models output relative depth, not metric.


**Solution:**
```
# Option 1: Use metric depth models
from transformers import pipeline

pipe = pipeline("depth-estimation", model="LiheYoung/depth-anything-large-hf")
# Still relative, but better calibrated

# Option 2: Calibrate with known reference
known_distance = 10.0  # meters
known_depth_value = depth[ref_y, ref_x]
scale = known_distance / known_depth_value

metric_depth = depth * scale

# Option 3: Use stereo or structured light
# For actual metric depth, need multiple views

```

**Symptoms:**
- Depth values don't match real distances
- Scale changes between frames
- Can't use for measurement

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `quantiz|deploy|tensorrt|onnx` | model-optimization | Model optimization for deployment |
| `multi.*gpu|distributed|fsdp` | distributed-training | Distributed training setup |
| `text.*image|clip|multi.*modal|vision.*language` | nlp-advanced | Multi-modal vision-language |
| `3d.*reconstruct|point.*cloud|mesh` | neural-architecture-search | 3D reconstruction architectures |

### Receives Work From

- **model-optimization**: Optimized vision model deployment
- **distributed-training**: Multi-GPU vision training

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/ai/computer-vision-deep/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
