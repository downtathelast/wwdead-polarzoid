# Polarzoid 📸 (WWDead Snapshot Tool)

Polarzoid is a lightweight snapshot system for WWDead that captures the current game state as a shareable “Polaroid-style” snapshot. It uploads the rendered page to a Cloudflare Worker and returns a permanent link that can be shared (e.g., on Discord).

---

## Features

- One-click snapshot of the current WWDead page
- Uploads HTML snapshots to a Cloudflare Worker
- Returns a shareable URL instantly
- Auto-copies snapshot links to clipboard
- Sanitization (redacts or trims sensitive UI sections)
- Lightweight client-side userscript (no backend dependency besides Worker)

---

## Current Versions

Right now the project exists in **two separate userscript implementations**:

### 1. Tampermonkey Version (Chrome / Chromium-based browsers)
- Uses `fetch()` for uploading snapshots
- Works reliably in Chrome, Edge, etc.
- Simpler modern implementation

### 2. Greasemonkey / Firefox Version
- Uses `GM_xmlhttpRequest`
- Required due to stricter Firefox Content Security Policy (CSP)
- More compatible with Firefox’s userscript sandboxing

---

## Important Note (Current State)

These two versions are **not yet unified**.

They differ because of browser limitations:

- Chrome allows direct `fetch()` to external workers
- Firefox often requires `GM_xmlhttpRequest` to bypass CSP restrictions
- Some environments block cross-origin requests entirely unless using userscript grants

---

## Goal (Roadmap)

The long-term goal of Polarzoid is to:

- Merge both scripts into a **single unified userscript**
- Automatically detect environment (Tampermonkey vs Greasemonkey)
- Fall back intelligently between:
  - `fetch()`
  - `GM_xmlhttpRequest`
- Provide consistent behavior across:
  - Chrome
  - Firefox
  - Future userscript managers

---

## Architecture Overview

- **Userscript Layer**
  - Captures DOM (`document.documentElement.outerHTML`)
  - Adds optional UI enhancements (banner, timestamp)
  - Sends payload to backend

- **Cloudflare Worker**
  - Receives snapshot HTML
  - Stores in bucket (R2 or KV)
  - Returns snapshot URL
  - Serves snapshot viewer pages

---

## Usage

### 1. Install Userscript
- Install Tampermonkey (Chrome/Edge) or Greasemonkey (Firefox)
- Import the correct script version:
  - `polarzoid-tampermonkey.user.js`
  - `polarzoid-greasemonkey.user.js`

### 2. Visit WWDead
- Load any game page
- Click **📸 Snapshot**

### 3. Share
- The snapshot URL is automatically copied to your clipboard
- Paste it into Discord or anywhere else

---

## Known Issues

- Firefox may block direct `fetch()` due to CSP (use Greasemonkey version)
- Some embedded resources (iframes, external scripts) may not render in snapshots
- Snapshot styling may differ slightly from live game due to sanitization

---

## Permissions

Depending on version:

- `GM_xmlhttpRequest` (Firefox version only)
- Access to snapshot worker domain:
  - `https://wwdead-snapshot.downtothelast.workers.dev`

---

## Future Improvements

- Unified cross-browser userscript
- Polaroid-style rendered image output (canvas-based snapshots)
- Optional Markdown / Discord embed export
- Selective sanitization profiles (safe / full / minimal UI)
- Snapshot diffing between states

---

## License

MIT License

---

## 🙌 Acknowledgements

Special thanks to [tvrusso](https://github.com/tvrusso) for help during development and testing of Polarzoid.

---

## Contributing

This is currently a personal / experimental project. Contributions, forks, and improvements are welcome once the unified version is stabilized.

---

## 💬 Notes

This tool is designed specifically for WWDead gameplay visualization and sharing. It is not affiliated with the original game or its creators.
