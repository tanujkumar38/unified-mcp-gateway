# Google Flow Professional Model Context Protocol (MCP) Server

[![MCP Specification](https://img.shields.io/badge/MCP-2026-blue.svg)](https://modelcontextprotocol.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Anti-Ban Guardrails](https://img.shields.io/badge/Anti--Ban-Guaranteed-brightgreen.svg)](#-zero-ban--no-api-architecture)

A professional, production-grade Model Context Protocol (MCP) server for **Google Flow** (`flow.google`), Google's unified AI creative studio. Built in accordance with the official **Google Flow Professional Handbook (September 2026)** and the MCP 2026 specification.

It provides autonomous AI assistants (in Claude Desktop, Cursor, ChatGPT, and custom host agents) with studio-grade control over **Veo 3.1** (Quality, Fast, Lite), **Gemini Omni Flash** (720p, 360p), and **Nano Banana** (Pro, 2, 2-Lite) models, without developer API keys and with **guaranteed zero risk of Google account bans**.

---

## 🎯 The Zero-Ban, No-API Architecture

Google Flow does not provide a public developer REST API with API keys. Automated headless bots and programmatic password entries trigger Google's automated threat detection, requiring SMS verification or risking account suspension.

This server circumvents all bot detection through an **Authentic Browser Session Bridge**:

```
┌──────────────────────────────────────────────────────────────┐
│                    MCP Host (AI Assistant)                   │
│       (Claude Desktop, Cursor, ChatGPT, Antigravity)         │
└──────────────────────────────┬───────────────────────────────┘
                               │ JSON-RPC 2.0 (stdio)
                               │ (Clean stdout, all logs to stderr)
┌──────────────────────────────▼───────────────────────────────┐
│     Google Flow Professional MCP Server (TypeScript / Node)  │
├──────────────────────────────────────────────────────────────┤
│  Anti-Ban Guardrail Engine:                                  │
│   • Gaussian Kinetic Jitter (1.2s - 3.2s natural pauses)     │
│   • Variable Cadence Typing Emulator (35ms - 90ms / char)    │
│   • Generation Velocity Governor (20s cooldown throttle)     │
│   • Challenge Detector & Circuit Breaker (halts on CAPTCHA)  │
├──────────────────────────────────────────────────────────────┤
│  Studio Capabilities (14 Tools, 5 Resources, 6 Prompts):     │
│   • Veo 3.1 Quality (100c), Fast (20c), Lite (10c, Extend)   │
│   • Gemini Omni Flash 720p/360p (4-10s, Edit @ 40c, Voice)   │
│   • Nano Banana Pro (4K), 2, 2-Lite                          │
│   • Scenebuilder, Storyboard Studio, Character Rigs, Credits │
└──────────────────────────────┬───────────────────────────────┘
                               │ Chrome DevTools Protocol (CDP :9222)
┌──────────────────────────────▼───────────────────────────────┐
│             Authentic Local Google Chrome                    │
│      (C:\Program Files\Google\Chrome\Application\chrome.exe) │
│                                                              │
│  • Genuine hardware GPU, WebGL, Widevine, and codecs         │
│  • navigator.webdriver is NOT set                            │
│  • Zero programmatic password entry (Human logs in once)     │
│  • Persistent local session profile                          │
└──────────────────────────────────────────────────────────────┘
```

1. **Authentic CDP Attachment**: Connects directly to your genuine, locally installed Google Chrome browser via Chrome DevTools Protocol (`--remote-debugging-port=9222`). Google sees your everyday browser with authentic hardware acceleration, genuine codecs, and natural cookies.
2. **Zero Password Handling**: You sign into Google in your actual Chrome window once. The server never handles, stores, or automates password submission.
3. **Kinetic Humanized Emulation**: Prompts are typed character-by-character with variable Gaussian cadence (35ms–90ms) and natural hesitation pauses. Button clicks include pre-hover pauses and bezier curves.
4. **Velocity Governor**: Enforces a strict cooldown period (default: 20s) between video generation requests to prevent triggering Google Labs rate limiters.
5. **Safety Circuit Breaker**: Continuously inspects the DOM for security verification banners, CAPTCHAs, or policy strikes. If detected, it immediately halts automated actions and alerts you to inspect your browser, preventing account penalties.
6. **Quota-Saving Dry-Run**: Video generation and editing tools include a `dry_run` flag that validates prompt blueprints, calculates credit costs, and tests model rules without consuming generation quota.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v20+ or v22+
- **Google Chrome**: Installed on your system
- **Google Account**: Signed into `flow.google`

### 2. Installation & Build
```bash
# Clone or navigate to the project
cd c:\Users\tanuj\Documents\antigravity\zealous-brahmagupta

# Install dependencies
npm install

# Build the TypeScript project
npm run build
```

### 3. Launch Chrome with Remote Debugging

**Option A: Using the built-in MCP tool**  
Call the `google_flow_launch_chrome` tool from your AI assistant.

**Option B: Via Windows PowerShell**  
```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="$env:LOCALAPPDATA\google-flow-mcp\chrome-profile" https://flow.google
```

*Log into your Google account once in the opened Chrome window. Your session will remain saved.*

---

## ⚙️ MCP Client Configuration

### Claude Desktop
Add to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "google-flow": {
      "command": "node",
      "args": [
        "c:/Users/tanuj/Documents/antigravity/zealous-brahmagupta/dist/index.js"
      ],
      "env": {
        "CHROME_CDP_PORT": "9222",
        "FLOW_GENERATION_COOLDOWN_MS": "20000"
      }
    }
  }
}
```

### Cursor (`.cursor/mcp.json`)
```json
{
  "mcpServers": {
    "google-flow": {
      "command": "node",
      "args": [
        "c:/Users/tanuj/Documents/antigravity/zealous-brahmagupta/dist/index.js"
      ]
    }
  }
}
```

---

## 🛠️ Complete MCP Primitives Reference

### 1. Tools (14 Professional Tools)

| Tool Name | Type | Purpose | Key Parameters |
| :--- | :--- | :--- | :--- |
| `google_flow_get_status` | Read-only | Inspects Chrome connection, flow.google tab, auth state, and anti-ban metrics | *None* |
| `google_flow_launch_chrome` | Action | Spawns authentic Chrome with CDP port 9222 and persistent profile | `forceNew` (boolean) |
| `google_flow_list_projects` | Read-only | Lists all projects, scenes, and storyboards in your Flow workspace | *None* |
| `google_flow_create_project` | Action | Initializes a new project or storyboard on flow.google | `title` (string) |
| `google_flow_generate_video` | Action | Generates cinematic video using Veo 3.1 (Quality, Fast, Lite) or Gemini Omni Flash (720p, 360p) | `prompt`, `model`, `aspect_ratio`, `duration_seconds` (4/6/8/10), `camera_motion`, `style_preset`, `audio_cues`, `start_frame`, `end_frame`, `ingredients`, `dry_run` |
| `google_flow_edit_video` | Action | Conversational video-to-video editing using Gemini Omni Flash (40 credits) | `instruction`, `segment_duration_seconds`, `style_reference`, `voice_reference`, `dry_run` |
| `google_flow_generate_image` | Action | Generates concept art or character reference frames using Nano Banana Pro (4K), 2, or 2-Lite | `prompt`, `model`, `aspect_ratio`, `upscale_4k` |
| `google_flow_control_camera` | Idempotent | Generates calibrated camera motions & lens specs for Veo 3.1 | `preset` (dolly_in, crane_up, orbit_360, etc.), `speed`, `lens_focal_length` |
| `google_flow_extend_clip` | Action | Continues an existing video clip maintaining first/last frame continuity (Veo Lite) | `continuation_prompt`, `camera_motion` |
| `google_flow_scenebuilder` | Action | Sequences, orders, and trims multiple video clips into a continuous timeline sequence | `clip_ids`, `transition_type` (cut, cross_dissolve, fade) |
| `google_flow_storyboard_studio`| Idempotent | Parses a script into structured visual storyboard panels with shot types and camera specs | `script`, `visual_style` |
| `google_flow_manage_character` | Idempotent | Generates a 5-angle Character Rig (Front, Profile, 3/4, Expressions, Action) for consistency | `character_name`, `physical_description`, `wardrobe` |
| `google_flow_estimate_credits` | Idempotent | Calculates credit consumption for a planned generation run and checks peak hours | `model`, `duration_seconds`, `shot_count` |
| `google_flow_poll_generation` | Read-only | Safely checks rendering status, progress %, or completion | *None* |
| `google_flow_export_video` | Read-only | Retrieves direct stream URL and metadata of completed video render | *None* |

### 2. Resources (5 Core Resources)

| Resource URI | MIME Type | Description |
| :--- | :--- | :--- |
| `flow://session/status` | `application/json` | Real-time session health, cooldown countdown, and circuit breaker status |
| `flow://projects` | `application/json` | Cached listing of projects and scenes in the user's workspace |
| `flow://models` | `application/json` | Complete catalog of Veo 3.1, Gemini Omni, and Nano Banana models with credit costs and capabilities |
| `flow://production-checklists` | `application/json` | Pre-production, pre-generation, quality control, and export checklists from the handbook |
| `flow://presets/cinematic-shots` | `application/json` | Curated cinematic camera movements, lens formulas, lighting archetypes, and audio cues |

### 3. Prompts (6 Guided Production Blueprints)

| Prompt Name | Purpose | Parameters |
| :--- | :--- | :--- |
| `flow_direct_cinematic_scene` | 5-element blueprint (Subject, Action, Environment, Lighting, Camera, Audio) | `scene_concept`, `mood`, `genre` |
| `flow_action_sequence` | Rapid tracking camera, particle physics, and high-impact momentum | `action_type`, `character_ref` |
| `flow_dialogue_scene` | Over-the-shoulder framing, facial micro-expressions, and voice references | `characters`, `topic_or_conflict`, `setting` |
| `flow_product_commercial` | 360-degree studio turntable orbit, softbox lighting, and macro detail | `product_name`, `key_features` |
| `flow_veo_prompt_enhancer` | Converts simple natural-language prompts into high-fidelity Veo 3.1 blueprints | `raw_prompt` |
| `flow_storyboard_planner` | Deconstructs a script or screenplay into sequential Scenebuilder shots | `script_or_story` |

---

## 💰 Credit Economics & Model Selection

| Model | Output | Max Duration | Credit Cost (Standard) | Credit Cost (Ultra) | Best Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Veo 3.1 Quality** | Video | 8s | 100 credits | 100 credits | Final cinematic deliverable, superior physics |
| **Veo 3.1 Fast** | Video | 4s, 6s, 8s | 20 credits | 10 credits | Standard production, reliable balance |
| **Veo 3.1 Lite** | Video | 4s, 6s, 8s | 10 credits | 5 credits | Fast prototyping, video extension |
| **Gemini Omni Flash 720p** | Video | 4s, 6s, 8s, 10s | 7–15 credits | 7–15 credits | 10s clips, conversational video editing, voice references |
| **Gemini Omni Flash 360p** | Video | 4s, 6s, 8s, 10s | 4–7 credits | 4–7 credits | Budget testing (upscalable to 720p for subscribers) |
| **Gemini Omni Video Edit** | Video | 10s segment | 40 credits | 40 credits | Video-to-video editing (up to 3 refinement turns) |
| **Nano Banana Pro** | Image | N/A | 10 credits | 5 credits | 4K image generation, typography, character references |
| **Nano Banana 2** | Image | N/A | 0 credits | 0 credits | Included free tier, character consistency |
| **Nano Banana 2 Lite** | Image | N/A | 0 credits | 0 credits | Rapid 1K concept iterations |

> [!NOTE]
> **Peak Hours Alert**: Between **2:00 AM and 5:00 AM UTC**, non-subscribers may experience queue delays or temporary generation pauses. AI Plus/Pro/Ultra subscribers receive priority queue access.

---

## 🧪 Testing & Verification

Run the automated test suite:
```bash
npm test
```

### Protocol Verification
Verify clean stdio handshake:
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}' | node dist/index.js
```

---

## 📜 License
MIT License. Built for seamless and safe integration with Model Context Protocol AI hosts.
