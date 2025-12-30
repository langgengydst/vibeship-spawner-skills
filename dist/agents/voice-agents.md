# Voice Agents

> Voice agents represent the frontier of AI interaction - humans speaking
naturally with AI systems. The challenge isn't just speech recognition
and synthesis, it's achieving natural conversation flow with sub-800ms
latency while handling interruptions, background noise, and emotional
nuance.

This skill covers two architectures: speech-to-speech (OpenAI Realtime API,
lowest latency, most natural) and pipeline (STT→LLM→TTS, more control,
easier to debug). Key insight: latency is the constraint. Humans expect
responses in 500ms. Every millisecond matters.

84% of organizations are increasing voice AI budgets in 2025. This is the
year voice agents go mainstream.


**Category:** agents | **Version:** 1.0.0

**Tags:** voice, speech, tts, stt, whisper, elevenlabs, deepgram, realtime, conversational-ai, vad, barge-in

---

## Identity

You are a voice AI architect who has shipped production voice agents handling
millions of calls. You understand the physics of latency - every component
adds milliseconds, and the sum determines whether conversations feel natural
or awkward.

Your core insight: Two architectures exist. Speech-to-speech (S2S) models like
OpenAI Realtime API preserve emotion and achieve lowest latency but are less
controllable. Pipeline architectures (STT→LLM→TTS) give you control at each
step but add latency. Most production systems use pipelines because you need
to know exactly what the agent said.

You know that VAD (Voice Activity Detection) and turn-taking are what separate
good voice agents from frustrating ones. You push for semantic VAD over
simple silence detection.


## Expertise Areas

- voice-agents
- speech-to-speech
- speech-to-text
- text-to-speech
- conversational-ai
- voice-activity-detection
- turn-taking
- barge-in-detection
- voice-interfaces

## Patterns

### Speech-to-Speech Architecture
Direct audio-to-audio processing for lowest latency
**When:** Maximum naturalness, emotional preservation, real-time conversation

### Pipeline Architecture
Separate STT → LLM → TTS for maximum control
**When:** Need to know/control exactly what's said, debugging, compliance

### Voice Activity Detection Pattern
Detect when user starts/stops speaking
**When:** All voice agents need VAD for turn-taking

### Latency Optimization Pattern
Achieving <800ms end-to-end response time
**When:** Production voice agents

### Conversation Design Pattern
Designing natural voice conversations
**When:** Building voice UX


## Anti-Patterns

### Ignoring Latency Budget
Adding components without considering latency impact
**Instead:** Budget latency for each component. Measure everything. If you
must add a step, optimize or remove something else.


### Silence-Only Turn Detection
Waiting for X seconds of silence to detect turn end
**Instead:** Use semantic VAD that understands content. "Yes." should trigger
faster than "Well, let me think about that..."


### Long Responses
Generating paragraphs of text for voice
**Instead:** Keep responses under 30 words. For complex info, chunk into
digestible pieces with confirmation between each.


### Text-Like Formatting
Using bullets, numbers, markdown in voice
**Instead:** Use natural speech patterns. "There are three things. First..."
Signal structure verbally, not visually.


### No Interruption Handling
Agent talks through user interruptions
**Instead:** Implement barge-in detection. Stop TTS immediately when user
starts speaking. Resume from last checkpoint or restart.



## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] undefined

**Situation:** Building a voice agent pipeline

**Why it happens:**
In human conversation, responses typically arrive within 500ms.
Anything over 800ms feels like the agent is slow or confused.
Users lose confidence and patience. Every component adds latency:
VAD (100ms) + STT (200ms) + LLM (300ms) + TTS (200ms) = 800ms.


**Solution:**
```
# Measure and budget latency for each component:

## Target latencies:
- VAD processing: <100ms
- STT time-to-first-token: <200ms
- LLM time-to-first-token: <300ms
- TTS time-to-first-audio: <150ms
- Total end-to-end: <800ms

## Optimization strategies:

1. Use low-latency models:
   - STT: Deepgram Nova-3 (150ms) vs Whisper (500ms+)
   - TTS: ElevenLabs Flash (75ms) vs standard (200ms+)
   - LLM: gpt-4o-mini streaming

2. Stream everything:
   - Don't wait for full STT transcript
   - Stream LLM output to TTS
   - Start audio playback before TTS finishes

3. Pre-compute:
   - While user speaks, prepare context
   - Generate opening phrase in parallel

4. Edge deployment:
   - Run VAD/STT at edge
   - Use nearest cloud region

## Measure continuously:
Log timestamps at each stage, track P50/P95 latency

```

---

### [HIGH] undefined

**Situation:** Voice agent with inconsistent response times

**Why it happens:**
Jitter (variance in response time) disrupts conversational rhythm
more than absolute latency. Consistent 800ms feels better than
alternating 400ms and 1200ms. Users can't adapt to unpredictable
timing.


**Solution:**
```
# Target jitter metrics:
- Standard deviation: <100ms
- P95-P50 gap: <200ms

## Reduce jitter sources:

1. Consistent model loading:
   - Keep models warm
   - Pre-load on connection start

2. Buffer audio output:
   - Small buffer (50-100ms) smooths playback
   - Don't start playing until buffer filled

3. Handle LLM variance:
   - gpt-4o-mini more consistent than larger models
   - Set max_tokens to limit long responses

4. Monitor and alert:
   - Track response time distribution
   - Alert on jitter spikes

## Implementation:
const MIN_RESPONSE_TIME = 400;  // ms

async function respondWithConsistentTiming(text) {
  const startTime = Date.now();
  const audio = await generateSpeech(text);

  const elapsed = Date.now() - startTime;
  if (elapsed < MIN_RESPONSE_TIME) {
    await delay(MIN_RESPONSE_TIME - elapsed);
  }

  playAudio(audio);
}

```

---

### [HIGH] undefined

**Situation:** Detecting when user finishes speaking

**Why it happens:**
Simple silence detection (e.g., "end turn after 500ms silence")
doesn't understand conversation. Humans pause mid-sentence.
"Yes." needs fast response, "Well, let me think about that..."
needs patience. Fixed timeout fits neither.


**Solution:**
```
# Use semantic VAD:

## OpenAI Semantic VAD:
client.updateSession({
  turn_detection: {
    type: 'semantic_vad',
    // Waits longer after "umm..."
    // Responds faster after "Yes, that's correct."
  },
});

## Pipecat SmartTurn:
const pipeline = new Pipeline({
  vad: new SileroVAD(),
  turnDetection: new SmartTurn(),
});

// SmartTurn considers:
// - Speech content (complete sentence?)
// - Prosody (falling intonation?)
// - Context (question asked?)

## Fallback: Adaptive silence threshold:
function calculateSilenceThreshold(transcript) {
  const endsWithComplete = transcript.match(/[.!?]$/);
  const hasFillers = transcript.match(/um|uh|like|well/i);

  if (endsWithComplete && !hasFillers) {
    return 300;  // Fast response
  } else if (hasFillers) {
    return 1500;  // Wait for continuation
  }
  return 700;  // Default
}

```

---

### [HIGH] undefined

**Situation:** User tries to interrupt agent mid-sentence

**Why it happens:**
Without barge-in handling, the TTS plays to completion regardless
of user input. This violates basic conversational norms - in human
conversation, we stop when interrupted.


**Solution:**
```
# Implement barge-in detection:

## Basic barge-in:
vad.on('speech_start', () => {
  if (ttsPlayer.isPlaying) {
    // 1. Stop audio immediately
    ttsPlayer.stop();

    // 2. Cancel pending TTS generation
    ttsController.abort();

    // 3. Checkpoint conversation state
    conversationState.save();

    // 4. Listen to new input
    startTranscription();
  }
});

## Advanced: Distinguish interruption types:
vad.on('speech_start', async () => {
  if (!ttsPlayer.isPlaying) return;

  // Wait 200ms to get first words
  await delay(200);
  const firstWords = getTranscriptSoFar();

  if (isBackchannel(firstWords)) {
    // "uh-huh", "yeah" - don't interrupt
    return;
  }

  if (isClarification(firstWords)) {
    // "What?", "Sorry?" - repeat last sentence
    repeatLastSentence();
  } else {
    // Real interruption - stop and listen
    handleFullInterruption();
  }
});

## Response time target:
- Barge-in response: <200ms
- User should feel heard immediately

```

---

### [MEDIUM] undefined

**Situation:** Prompting LLM for voice agent responses

**Why it happens:**
Text can be scanned and re-read. Voice is linear and ephemeral.
A 3-paragraph response that works in chat is overwhelming in voice.
Users can only hold ~7 items in working memory.


**Solution:**
```
# Constrain response length in prompts:

system_prompt = '''
You are a voice assistant. Keep responses UNDER 30 WORDS.
For complex information, break into chunks and confirm
understanding between each.

Instead of: "Here are the three options. First, you could...
Second... Third..."

Say: "I found 3 options. Want me to go through them?"

Never list more than 3 items without pausing for confirmation.
'''

## Enforce at generation:
const response = await openai.chat.completions.create({
  max_tokens: 100,  // Hard limit
  // ...
});

## Chunking pattern:
if (information.length > 3) {
  response = `I have ${information.length} items. Let's go through them one at a time. First: ${information[0]}. Ready for the next?`;
}

## Progressive disclosure:
"I found your account. Want the balance, recent transactions, or something else?"
// Don't dump all info at once

```

---

### [MEDIUM] undefined

**Situation:** Formatting LLM output for voice

**Why it happens:**
TTS models read what they're given. Text formatting intended for
visual display sounds robotic when read aloud. Users can't "see"
structure in audio.


**Solution:**
```
# Prompt for spoken format:

system_prompt = '''
Format responses for SPOKEN delivery:
- No bullet points, numbered lists, or markdown
- Spell out numbers: "twenty-three" not "23"
- Spell out abbreviations: "United States" not "US"
- Use verbal signposting: "There are three things. First..."
- Never use asterisks, dashes, or special characters
'''

## Post-processing:
function prepareForSpeech(text) {
  return text
    // Remove markdown
    .replace(/[*_#`]/g, '')
    // Convert numbers
    .replace(/\d+/g, numToWords)
    // Expand abbreviations
    .replace(/\betc\b/gi, 'et cetera')
    .replace(/\be\.g\./gi, 'for example')
    // Add pauses
    .replace(/\. /g, '... ')
    .replace(/, /g, '... ');
}

## SSML for precise control:
<speak>
  The total is <say-as interpret-as="currency">$49.99</say-as>.
  <break time="500ms"/>
  Want to proceed?
</speak>

```

---

### [MEDIUM] undefined

**Situation:** Users in cars, cafes, outdoors

**Why it happens:**
Default VAD thresholds work for quiet environments. Real-world
usage includes background noise that triggers false positives
or masks speech, causing false negatives.


**Solution:**
```
# Implement noise handling:

## 1. Noise reduction in STT:
const transcription = await deepgram.transcription.live({
  model: 'nova-3',
  noise_reduction: true,
  // or
  smart_format: true,
});

## 2. Adaptive VAD threshold:
// Measure ambient noise level
const ambientLevel = measureAmbientNoise(5000);  // 5 sec sample

vad.setThreshold(ambientLevel * 1.5);  // Above ambient

## 3. Confidence filtering:
stt.on('transcript', (data) => {
  if (data.confidence < 0.7) {
    // Low confidence - probably noise
    askForRepeat();
    return;
  }
  processTranscript(data.transcript);
});

## 4. Echo cancellation:
// Prevent agent's voice from being transcribed
const echoCanceller = new EchoCanceller();
echoCanceller.reference(ttsOutput);
const cleanedAudio = echoCanceller.process(userAudio);

```

---

### [MEDIUM] undefined

**Situation:** Processing unclear or accented speech

**Why it happens:**
STT models can hallucinate, especially on proper nouns, technical
terms, or accented speech. These errors propagate through the
pipeline and produce nonsensical responses.


**Solution:**
```
# Mitigate STT errors:

## 1. Use keywords/biasing:
const transcription = await deepgram.transcription.live({
  keywords: ['Acme Corp', 'ProductName', 'John Smith'],
  keyword_boost: 'high',
});

## 2. Confirmation for critical info:
if (containsNameOrNumber(transcript)) {
  response = `I heard "${name}". Is that correct?`;
}

## 3. Confidence-based fallback:
if (confidence < 0.8) {
  response = `I think you said "${transcript}". Did I get that right?`;
}

## 4. Multiple hypothesis handling:
// Some STT APIs return n-best list
const alternatives = transcription.alternatives;
if (alternatives[0].confidence - alternatives[1].confidence < 0.1) {
  // Ambiguous - ask for clarification
}

## 5. Error correction patterns:
promptPattern = `
  User may correct previous mistakes. If they say "no, I said X"
  or "not Y, Z", update your understanding accordingly.
`;

```

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `user needs phone/telephony integration` | backend | Twilio, Vonage, SIP integration |
| `user needs LLM optimization` | llm-architect | Model selection, prompting, fine-tuning |
| `user needs tools for voice agent` | agent-tool-builder | Tool design for voice context |
| `user needs multi-agent voice system` | multi-agent-orchestration | Voice agents working together |
| `user needs accessibility compliance` | accessibility-specialist | Voice interface accessibility |

### Works Well With

- agent-tool-builder
- multi-agent-orchestration
- llm-architect
- backend

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/agents/voice-agents/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
