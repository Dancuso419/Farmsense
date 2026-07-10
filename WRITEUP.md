# FarmSense — Your Farm's Expert, Offline

### An offline-first AI farming assistant that runs Gemma locally so smallholder farmers can diagnose crop disease with no internet, in their own language.

---

## The Problem

In rural Southeast Nigeria, a farmer who spots strange spots on a cassava leaf has three bad options: guess, wait days for a scarce extension officer, or travel to find one — while the disease spreads. Cloud AI tools don't help: connectivity is unreliable or absent, data is expensive, and most tools only speak English. The expertise exists in the world; it just never reaches the field.

**FarmSense closes that gap.** A farmer describes a symptom or snaps a photo, and gets an instant, practical diagnosis and treatment — with **no internet at all**, in **English, Igbo, Yoruba, or Hausa**, running entirely on a local machine.

## The Solution

FarmSense is an installable Progressive Web App (PWA) that talks to **Gemma running locally through Ollama**. One laptop on the farm runs the model and shares it over local WiFi; farmers open the app on their phones. Nothing leaves the device — no cloud, no accounts, no data collection.

Core capabilities:
- **Text diagnosis** — describe symptoms, get a structured remedy.
- **Photo diagnosis** — Gemma's multimodal vision reads a leaf/stem/fruit image.
- **Multilingual, zero-config** — the model auto-detects the language and replies in it; the farmer never changes a setting.
- **Truly offline** — service-worker caching means the app shell loads with WiFi off; inference runs on-device.

## Architecture

We deliberately kept the stack radically simple — the shortest path that delivers the feature.

```
Phone (browser / installed PWA)
        │  local WiFi, HTTP
        ▼
Laptop ── static PWA (vanilla HTML/CSS/JS, Python http.server)
        └── Ollama  →  Gemma 4 (gemma4:e2b-it-qat)
```

- **Frontend:** pure vanilla HTML/CSS/JavaScript. No React, no build step, no bundler. The entire app is a handful of static files a service worker can cache byte-for-byte. This is a design choice, not a shortcut: frameworks add megabytes and a build pipeline that fight the offline-first goal. Distinctiveness comes from color, scale, and hand-authored inline SVG motifs (no CDN fonts or stock images that would break offline).
- **Inference:** Ollama exposes Gemma on `http://<host>:11434`. The browser calls `/api/chat` directly.
- **PWA layer:** `manifest.json` + a cache-first service worker make it installable and offline-capable, with maskable icons for Android.

## How We Used Gemma 4

Gemma is the entire intelligence of the product, used through Ollama's `gemma4:e2b-it-qat` variant. Three things made it the right model:

1. **It runs on-device.** The `e2b` (compact) QAT-quantized build fits in ~4.3 GB and runs on a CPU-only 2013 laptop. That is what makes "offline farming assistant" physically possible.
2. **It's multimodal.** We send crop photos as base64 in the Ollama message (`{ role, content, images: [base64] }`), and Gemma diagnoses from the image — no separate vision model needed.
3. **It's genuinely multilingual.** A single system-prompt rule instructs Gemma to detect and reply in the farmer's language. Gemma handles English, Igbo, Yoruba and Hausa from one prompt, no translation layer.

We steer behaviour entirely through a carefully engineered **system prompt** that encodes the farming domain, brevity, structure, language-matching, and a strict on-topic guardrail (it politely refuses non-farming requests and resists "ignore your instructions" jailbreaks).

## Key Engineering Decisions (and why they were right)

**1. Auto-detect the model → portability.** Rather than hard-coding a tag, the app queries `/api/tags` and picks any installed Gemma, and reads `/api/show` capabilities. This means anyone can clone the repo, `ollama pull` any Gemma variant, and it just works — a "foundational asset," not a one-machine hack.

**2. Disable "thinking" for this reasoning variant.** `gemma4:e2b-it-qat` is a thinking model; by default it spent its whole token budget reasoning and returned *empty* content. We detect the `thinking` capability and send `think: false`, giving direct answers and cutting latency dramatically.

**3. Stream the response.** On a CPU, a full answer takes seconds. We switched to `stream: true`, parse Ollama's newline-delimited JSON, and paint tokens as they arrive with a live caret. Perceived responsiveness transforms even though raw speed is unchanged.

**4. Keep the model warm.** Ollama unloads after 5 minutes idle, causing a ~60s cold reload. Setting `keep_alive: -1` keeps Gemma resident, eliminating the worst latency spikes.

**5. Prompt for brevity + safe markdown rendering.** On slow hardware, response time ≈ length, so we prompt Gemma to lead with the answer and use tight bullet lists. A tiny, XSS-safe formatter renders bold/lists and strips stray markdown so output is clean for low-literacy users.

## Challenges Overcome in the 1-Day Sprint

- **Browser ↔ Ollama CORS.** Phones hit Ollama from a LAN origin Ollama blocks by default. Fixed by binding `OLLAMA_HOST=0.0.0.0` and `OLLAMA_ORIGINS=*`, verified with origin-scoped CORS probes.
- **Empty replies from a thinking model** — diagnosed via the raw API (`content` empty, `thinking` full) and solved with capability-gated `think:false`.
- **Service-worker cache staleness** — fast iteration kept serving old files; we versioned the cache and bumped it on every change.
- **Language drift** — the model over-defaulted to Igbo because the prompt over-emphasised the region. Hardened rule 6 to match the *latest* message and default to English when ambiguous.
- **Hardware reality** — no GPU, an old 4-core CPU, limited RAM. We couldn't change the silicon, so we attacked *perceived* and *reload* latency (streaming + keep-alive + brevity) instead of chasing raw throughput.

## Why This Solution Matters

FarmSense proves a full multimodal, multilingual AI assistant can run **entirely offline on cheap, existing hardware** — the exact conditions rural farmers live in. Because Gemma runs locally, it is **private by design** (photos and questions never leave the laptop), **free to operate** (no API bills), and **resilient** (works with no signal). The auto-detecting, framework-free codebase is a clean foundation others can fork for any offline, on-device Gemma use case — clinics, schools, field research — anywhere the signal ends.

## What's Next

Self-hosted fonts and a bundled one-click Ollama installer; a thin proxy to enforce the guardrail server-side; a curated few-shot example per language for even stronger localization; and validation trials with real extension officers.

---

## Project Links

- **Public Code Repository:** https://github.com/Dancuso419/Farmsense
- **Live Demo (video walkthrough):** https://youtu.be/dSLGYsDQJ0k
  _(The app is offline-by-design and needs a local Ollama backend, so a screen-recording is the truest "live" demo — it shows the app running with WiFi off.)_

**Track:** _Select the track that best fits (e.g. accessibility / social impact / offline & on-device)._

*Built with Gemma 4 · Ollama · vanilla JS. No frameworks, no cloud, no compromise on privacy.*
