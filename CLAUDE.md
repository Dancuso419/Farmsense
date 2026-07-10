# FarmSense — Claude Instructions

## Project

Offline-first PWA farming assistant for rural Southeast Nigerian farmers. Runs Gemma 4 locally via Ollama. Pure HTML/CSS/Vanilla JS — no frameworks.

## Known Issues in the Source Docs (fix before shipping)

1. **Model name mismatch** — PRD and TRD prose say "Gemma 4" but every code sample uses `model: "gemma3"`. Use `model: "gemma4"` everywhere.
2. **Hardcoded IP** — `192.168.1.105` is hardcoded in both `askGemma` and `askGemmaWithImage`. This breaks on any other machine. Read it from a `config.js` or a single `const OLLAMA_HOST` at the top of `app.js` that the user can change once.
3. **Wrong multimodal API format** — The TRD shows the Claude/Anthropic image format. Ollama's actual format is `images: [base64String]` on the message object, not a content array with `{ type: "image", data, mimeType }`. Use:
   ```js
   { role: "user", content: userMessage, images: [base64Image] }
   ```
4. **Image not saved to history** — After an image analysis, neither the image nor the user message is pushed to `conversationHistory`, so follow-up questions lose context. Push the text at minimum.

---

## Skills to Use

### Frontend / UI — use `impeccable`

Invoke before any visual work: layout, component design, chat UI, color, typography, responsive behavior, empty states, loading states.

```
/impeccable
```

Applies to: `index.html`, `style.css`, any UI component decisions.

### Logic / Code quality — ponytail mode is active

Ponytail is already on. It governs all JS logic, API integration, service worker, and file structure decisions. Shortest working diff wins. No abstractions until the second use case exists.

### Verification — use `verify` after each feature

```
/verify
```

Run after: Ollama integration works, image upload works, PWA installs on Android, Igbo responses come back correctly.

---

## Step-by-Step Build Guide

Follow these phases in order. Complete and verify each before moving.

### Phase 1 — Project Scaffold

1. Create the file structure exactly as specified in the TRD:
   ```
   farmsense/
   ├── index.html
   ├── style.css
   ├── app.js
   ├── config.js        ← add this, not in TRD
   ├── manifest.json
   ├── service-worker.js
   ├── icon-192.png
   └── icon-512.png
   ```
2. Put `const OLLAMA_HOST = "http://192.168.1.105:11434"` in `config.js`. Every fetch call imports from here. User changes one line when IP changes.
3. Add `manifest.json` and register the service worker in `index.html`.

### Phase 2 — Landing Page + Floating Chat (built via `impeccable`)

**Architecture:** single-page landing (brand register) with the chat as a floating FAB that opens a bottom-sheet panel. Sections act as pages — anchored, not separate HTML files (keeps offline PWA caching simple).

**Brand palette (locked):**
- Canvas `#FCDDC6` (soft apricot) — section backgrounds, tags, cards
- Anchor `#1E1410` (dark cocoa) — all text, borders, the trust section
- Action `#3B694C` (juniper green) — hero drench, buttons, FAB, icons, hover states

**Offline-first constraints that drive design decisions:**
- NO remote fonts (Google Fonts CDN won't load offline) — system stack, distinctiveness via color + scale + SVG. Upgrade path: self-host woff2.
- NO remote stock images (break offline promise) — custom inline SVG organic motifs instead.
- NO CDN scripts. GSAP + ScrollTrigger (scroll-scrubbed hero parallax) are **vendored locally** in `/vendor/` and cached by the service worker. Loaded via `<script>` before `app.js`; guarded by `if (window.gsap …)` so a missing file degrades gracefully. Gated behind `prefers-reduced-motion: no-preference` via `gsap.matchMedia()`.

Landing sections: Hero (green drench) → How it works (3 steps) → Crops → Offline/trust (cocoa) → CTA band → footer. FAB bottom-right opens the chat panel.

Checklist:
- [ ] Renders on 375px (mobile bottom-sheet chat) and desktop (floating card chat)
- [ ] Nav goes transparent→solid on scroll
- [ ] FAB opens/closes panel; Esc and scrim close it
- [ ] Image upload button visible and tappable (44px+)
- [ ] Loading state (animated dots) + error bar (human message, no raw fetch error)

### Phase 3 — Ollama Text Integration

1. Write `askGemma(userMessage, history)` in `app.js` using the corrected model name `gemma4` and dynamic host from `config.js`.
2. Wire up the system prompt from the TRD verbatim.
3. Implement `conversationHistory` array and push both user and assistant turns after each response.
4. Test: start Ollama with `OLLAMA_HOST=0.0.0.0 ollama serve`, open app, ask a farming question, confirm response appears.

Run `/verify` — confirm response arrives and history persists across follow-ups.

### Phase 4 — Image Upload + Multimodal Analysis

1. Implement `convertImageToBase64(imageFile)` using FileReader (TRD has this correct).
2. Implement `askGemmaWithImage(userMessage, imageFile)` using the **correct Ollama format**:
   ```js
   {
     role: "user",
     content: userMessage || "What disease does this crop have? Diagnose and recommend treatment.",
     images: [base64Image]
   }
   ```
3. After response, push `{ role: "user", content: userMessage }` and `{ role: "assistant", content: response }` to `conversationHistory`.
4. Accept JPG, PNG, WEBP only — validate in the file input `accept` attribute and in JS.

Run `/verify` — upload a leaf photo, confirm diagnosis comes back.

### Phase 5 — PWA Offline Support

1. Implement `service-worker.js` exactly as in TRD.
2. Register it in `index.html` with a feature check:
   ```js
   if ('serviceWorker' in navigator) navigator.serviceWorker.register('/service-worker.js');
   ```
3. Test install on Android Chrome: connect phone to same WiFi, navigate to `http://<laptop-ip>:3000`, tap "Add to Home Screen".

Run `/verify` — install PWA on phone, kill WiFi, confirm app shell loads.

### Phase 6 — Multilingual Support (English, Igbo, Yoruba, Hausa)

The model auto-detects the language from each message and replies in the same one — **the farmer never changes a setting** (no manual toggle). This is driven entirely by system-prompt point 6 in `app.js`. Verify it works per language:

1. Ask a farming question in Igbo → confirm reply is in Igbo.
2. Repeat for Yoruba and Hausa.
3. If a language drifts back to English, strengthen point 6 (name the language explicitly) or add a one-shot example per language.

### Phase 7 — Polish Pass (invoke `impeccable`)

Run `/impeccable` again with the built UI. Ask it to audit:
- Loading states during slow Ollama responses
- Error state when Ollama is unreachable (show "Check that Ollama is running" not a raw fetch error)
- Empty state on first load
- Image preview before sending

---

## Ollama Setup Reference

```bash
# Install from ollama.com, then:
ollama pull gemma4

# Start server accessible to all devices on network
OLLAMA_HOST=0.0.0.0 ollama serve
```

On Windows, set the env var before the command:
```cmd
set OLLAMA_HOST=0.0.0.0
ollama serve
```

## Model Selection by RAM

| RAM   | Model       |
|-------|-------------|
| 8GB   | gemma4:2b   |
| 16GB  | gemma4:4b   |
| 32GB+ | gemma4:12b  |

Update `config.js` with the right model tag for the machine.

---

## Out of Scope (do not build)

- Voice input/output
- Cloud sync or user accounts
- Payments
- Any backend beyond Ollama + Python HTTP server
