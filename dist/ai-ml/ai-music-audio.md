# AI Music & Audio Generation

> Comprehensive patterns for AI-powered audio generation including

**Category:** ai-ml | **Version:** 1.0.0

---

## Patterns

### See full skill for patterns
Contains implementation patterns with code examples


## Anti-Patterns

### See full skill for anti-patterns
Contains anti-patterns with examples


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] Voice cloning without consent creates deepfakes

**Situation:** Cloning voices from public audio without explicit permission

**Why it happens:**
Voice cloning technology can perfectly replicate anyone's voice.
Using someone's voice without consent:
- Creates potential deepfakes for fraud/misinformation
- Violates right of publicity laws in most jurisdictions
- Results in platform bans (ElevenLabs actively monitors)
- Can be used for voice phishing (vishing) attacks
- Major lawsuits pending against AI companies over this


**Solution:**
```
Always require and verify consent:
1. Implement voice consent verification flow
2. Require email/identity verification for voice owner
3. Store consent records with timestamps
4. Limit cloning to user's own voice or verified consents
5. Add voice watermarking for traceability

```typescript
// Consent verification required
const consent = await db.voiceConsent.findUnique({
  where: { voiceOwnerId: ownerId, projectId },
});

if (!consent?.verified || !consent?.signature) {
  throw new Error("Voice cloning requires verified consent");
}

// Log for audit trail
await db.voiceCloneAudit.create({
  data: {
    clonedBy: userId,
    voiceOwnerId: ownerId,
    consentId: consent.id,
    purpose: purpose,
  },
});
```

```

---

### [HIGH] Unbounded TTS text causes massive bills

**Situation:** User-provided text passed directly to TTS without limits

**Why it happens:**
TTS pricing is per character (e.g., ElevenLabs ~$0.03/1000 chars).
A single novel (~500K characters) = $15+ per generation.
Malicious users can exploit unlimited endpoints:
- Submit entire books repeatedly
- Bot attacks generating millions of characters
- Single request can consume monthly budget


**Solution:**
```
Implement multiple safeguards:

```typescript
const MAX_CHARS = 5000;
const MAX_MONTHLY_CHARS_PER_USER = 100000;

async function safeTTS(userId: string, text: string) {
  // 1. Hard character limit
  if (text.length > MAX_CHARS) {
    throw new Error(`Text exceeds ${MAX_CHARS} character limit`);
  }

  // 2. Check monthly usage
  const monthlyUsage = await getMonthlyCharUsage(userId);
  if (monthlyUsage + text.length > MAX_MONTHLY_CHARS_PER_USER) {
    throw new Error("Monthly character limit reached");
  }

  // 3. Rate limit per minute
  await rateLimit(userId, "tts", { maxRequests: 10, window: 60 });

  // 4. Track and charge
  await recordUsage(userId, text.length);

  return elevenlabs.textToSpeech.convert(voiceId, { text });
}
```

```

---

### [MEDIUM] MusicGen silently clips audio at 30 seconds

**Situation:** Requesting music duration longer than model supports

**Why it happens:**
MusicGen (via Replicate) has a hard 30-second limit.
If you request 60 seconds, you get 30 seconds (no error).
User expects full length, receives half.
Wastes money on clipped generations.


**Solution:**
```
Validate duration and implement concatenation for longer audio:

```typescript
const MUSICGEN_MAX_DURATION = 30;

async function generateLongMusic(prompt: string, duration: number) {
  // For short music, generate directly
  if (duration <= MUSICGEN_MAX_DURATION) {
    return generateMusic({ prompt, duration });
  }

  // For longer, generate segments with continuation
  const segments: string[] = [];
  let remaining = duration;

  while (remaining > 0) {
    const segmentDuration = Math.min(remaining, MUSICGEN_MAX_DURATION);
    const previousAudio = segments[segments.length - 1];

    const segment = await generateMusic({
      prompt,
      duration: segmentDuration,
      inputAudio: previousAudio, // Use as reference
      continuation: true,
    });

    segments.push(segment);
    remaining -= segmentDuration;
  }

  // Concatenate with crossfade
  return concatenateWithCrossfade(segments);
}
```

```

---

### [MEDIUM] Low stability settings produce inconsistent output

**Situation:** Using ElevenLabs with stability < 0.3

**Why it happens:**
ElevenLabs stability setting (0-1) controls voice consistency:
- Low stability = more expressive but unpredictable
- Can produce different voices on same text
- May include artifacts, breathing, emotional breaks
- Problematic for long-form content or audiobooks
- Inconsistent between API calls


**Solution:**
```
Use appropriate stability for use case:

```typescript
const STABILITY_PRESETS = {
  // High consistency for narration/audiobooks
  narration: { stability: 0.75, similarityBoost: 0.75 },

  // Medium for conversational content
  conversational: { stability: 0.5, similarityBoost: 0.75 },

  // Low for expressive/emotional content (with review)
  expressive: { stability: 0.35, similarityBoost: 0.5 },
};

function getVoiceSettings(useCase: keyof typeof STABILITY_PRESETS) {
  return STABILITY_PRESETS[useCase];
}

// Always use presets, avoid raw low values
const settings = getVoiceSettings("narration");
```

```

---

### [MEDIUM] Generated audio format incompatible with target platform

**Situation:** Using mp3/wav without checking platform requirements

**Why it happens:**
Different platforms/browsers have format limitations:
- Safari has limited WebM/Opus support
- Some mobile browsers can't play certain codecs
- Streaming requires specific container formats
- Sample rate mismatches cause playback issues
- Bitrate affects both quality and file size


**Solution:**
```
Use widely compatible formats and transcode when needed:

```typescript
// Default to MP3 for maximum compatibility
const SAFE_FORMATS = {
  web: { format: "mp3", bitrate: 128 },
  mobile: { format: "mp3", bitrate: 96 },
  highQuality: { format: "wav", bitrate: null },
  streaming: { format: "mp3", bitrate: 64 },
};

async function generateCompatibleAudio(
  prompt: string,
  platform: keyof typeof SAFE_FORMATS
) {
  const { format, bitrate } = SAFE_FORMATS[platform];

  const audio = await generate(prompt, { outputFormat: format });

  // Verify format
  const mimeType = await detectAudioFormat(audio);
  if (!isSupportedOn(mimeType, platform)) {
    return transcodeAudio(audio, format, bitrate);
  }

  return audio;
}
```

```

---

### [HIGH] Malicious prompts generate harmful audio content

**Situation:** User prompts passed to TTS without sanitization

**Why it happens:**
TTS can be used to generate:
- Hate speech and slurs
- Misinformation/fake news
- Instructions for harm
- Impersonation of real people
- Political manipulation content

Content moderation on text is essential before synthesis.


**Solution:**
```
Always moderate text before synthesis:

```typescript
import OpenAI from "openai";

const openai = new OpenAI();

async function moderatedTTS(text: string) {
  // 1. OpenAI moderation
  const moderation = await openai.moderations.create({ input: text });
  if (moderation.results[0].flagged) {
    throw new Error("Content violates content policy");
  }

  // 2. Check for impersonation patterns
  const impersonationPatterns = [
    /this is (president|senator|ceo|celebrity name)/i,
    /I am (elon musk|joe biden|famous person)/i,
    /speaking as the (ceo|president|official)/i,
  ];

  for (const pattern of impersonationPatterns) {
    if (pattern.test(text)) {
      throw new Error("Potential impersonation detected");
    }
  }

  // 3. Generate only if passes checks
  return textToSpeech(text);
}
```

```

---

### [MEDIUM] AI audio released without provenance markers

**Situation:** Generated audio shared publicly without watermarking

**Why it happens:**
Without watermarking:
- Cannot prove audio is AI-generated
- Enables deepfakes and misinformation
- No accountability for misuse
- Increasingly required by regulations
- Platforms may require C2PA compliance


**Solution:**
```
Embed AudioSeal or similar watermark before distribution:

```typescript
async function generateWatermarkedAudio(prompt: string) {
  // 1. Generate audio
  const audio = await generateAudio(prompt);

  // 2. Add watermark with provenance info
  const watermarked = await embedWatermark(audio, {
    source: "ai-generated",
    model: "elevenlabs-v2",
    timestamp: Date.now(),
    creator: userId,
  });

  // 3. Add C2PA manifest for platforms that support it
  const withManifest = await addC2PAManifest(watermarked, {
    assertions: [
      { label: "c2pa.ai_generative_training", data: { model: "elevenlabs" } },
    ],
  });

  return withManifest;
}
```

```

---

### [MEDIUM] Audio streams not properly closed cause memory leaks

**Situation:** Streaming TTS without proper stream handling

**Why it happens:**
Audio streams consume memory until closed:
- Unclosed streams accumulate
- Server memory exhaustion
- Connection pool exhaustion
- Especially bad with long audio or errors mid-stream


**Solution:**
```
Always properly handle and close streams:

```typescript
async function safeStreamTTS(text: string, voiceId: string) {
  let stream: AsyncIterable<Buffer> | null = null;

  try {
    stream = await elevenlabs.textToSpeech.convertAsStream(voiceId, {
      text,
    });

    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }

    return Buffer.concat(chunks);
  } catch (error) {
    console.error("TTS stream error:", error);
    throw error;
  } finally {
    // Cleanup - stream should auto-close but be explicit
    if (stream && typeof (stream as any).destroy === "function") {
      (stream as any).destroy();
    }
  }
}

// For HTTP responses, pipe properly
export async function GET(req: NextRequest) {
  const stream = await elevenlabs.textToSpeech.convertAsStream(...);

  return new NextResponse(
    new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            controller.enqueue(chunk);
          }
        } finally {
          controller.close();
        }
      },
      cancel() {
        // Handle client disconnect
        if (typeof (stream as any).destroy === "function") {
          (stream as any).destroy();
        }
      },
    }),
    { headers: { "Content-Type": "audio/mpeg" } }
  );
}
```

```

---

### [LOW] Mixed sample rates cause audio artifacts

**Situation:** Concatenating or mixing audio with different sample rates

**Why it happens:**
Different models output different sample rates:
- MusicGen: 32kHz
- ElevenLabs: 44.1kHz or 22.05kHz
- AudioSeal: 16kHz
- Bark: 24kHz

Mixing without resampling causes pitch/speed issues.


**Solution:**
```
Normalize sample rates before combining:

```typescript
import ffmpeg from "fluent-ffmpeg";

const TARGET_SAMPLE_RATE = 44100;

async function normalizeAndConcatenate(audioPaths: string[]) {
  const normalizedPaths: string[] = [];

  // Normalize each to target sample rate
  for (const path of audioPaths) {
    const normalized = path.replace(".mp3", "_normalized.mp3");

    await new Promise((resolve, reject) => {
      ffmpeg(path)
        .audioFrequency(TARGET_SAMPLE_RATE)
        .audioChannels(2) // Stereo
        .audioBitrate("128k")
        .output(normalized)
        .on("end", resolve)
        .on("error", reject)
        .run();
    });

    normalizedPaths.push(normalized);
  }

  // Now safe to concatenate
  return concatenateAudio(normalizedPaths);
}
```

```

---

### [HIGH] Unofficial Suno/Udio APIs break frequently

**Situation:** Using unofficial wrapper APIs for Suno or Udio

**Why it happens:**
Suno and Udio don't offer official APIs.
Unofficial wrappers:
- Scrape web interfaces (break with UI changes)
- Require solving CAPTCHAs
- Violate Terms of Service
- Can get your account banned
- Major lawsuit risk (Sony, Universal, Warner suing both)


**Solution:**
```
Use officially supported alternatives:

```typescript
// AVOID: Unofficial Suno API
// const suno = new SunoAPI({ cookie: process.env.SUNO_COOKIE });

// USE: Official APIs with proper licensing
// Option 1: Meta MusicGen (MIT license, CC-BY-NC for weights)
import Replicate from "replicate";
const music = await replicate.run("meta/musicgen");

// Option 2: Stable Audio (commercial license available)
// Option 3: Soundraw API (commercial license)
// Option 4: AIVA API (commercial license)

// For production, only use services with:
// - Official API documentation
// - Clear licensing terms
// - Commercial use rights
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

Full skill path: `~/.spawner/skills/ai-ml/ai-music-audio/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
