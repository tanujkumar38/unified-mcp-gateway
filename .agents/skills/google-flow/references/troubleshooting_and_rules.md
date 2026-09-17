# Google Flow Troubleshooting Guide & Anti-Ban Architecture

A comprehensive operational manual detailing failure mode resolutions, artifact cures, and zero-ban browser/CDP automation guidelines.

---

## 1. Video Artifact Diagnosis & Cures

| Symptom / Failure Mode | Root Cause | Immediate Remediation / Cure |
| :--- | :--- | :--- |
| **Temporal Flickering & Strobe Light** | Unconstrained frame-to-frame high-frequency variance in lighting or background elements. | 1. Apply multi-frame optical flow smoothing filter via `flow_upscale_media`.<br>2. Reduce `motion_bucket_id` or camera velocity.<br>3. Condition generation on an explicit `anchor_frame`. |
| **Melting Anatomy & Extra Limbs** | Ambiguous spatial prompts requiring simultaneous complex hand/finger gestures. | 1. Reinforce negative prompt with: `extra limbs, fused fingers, deformed hands, melting anatomy`.<br>2. Avoid micro-actions like *"typing intricate code while juggling"* in single shots; isolate gestures into dedicated close-up shots. |
| **Character Identity Drift Across Cuts** | Generating subsequent shots with generic text prompts without latent seed or reference anchors. | 1. Use the **Character Rig System** (`nano-banana-pro` 8-angle anchor).<br>2. Inject identical `character_rig_id` into all prompt batches.<br>3. Feed Frame $N$ of prior shot as `anchor_frame` to Shot $N+1$. |
| **Hallucinated Text & Pseudo-Glyphs** | Diffusion backbone attempting to generate signboards, computer screens, or labels described in prompt. | 1. Add `text, subtitles, typography, watermark, logos` to negative prompt.<br>2. Omit requests for specific written words in prompt; composite all typography, titles, and UI in post-production. |
| **Unnatural Physics / Liquid Glitches** | Fast or Lite models exceeding their simplified spatial-temporal physics envelope. | 1. Upgrade generation tier to `veo-3.1-quality`.<br>2. Explicitly specify fluid kinetics (*"viscous liquid dripping slowly under natural Earth gravity"*). |
| **Abrupt Clip Stalling / Motion Freeze** | Generation reaches max clip duration boundary before action sequence concludes. | 1. Call `flow_extend_video` using the last 8 frames as conditioning latent overlap.<br>2. Set extension duration to 5-10 seconds to maintain uninterrupted continuous momentum. |

---

## 2. Zero-Ban CDP Automation Architecture

When building automated agents or headless browser scripts interacting with Google Flow's web interface or backend endpoints, follow these strict anti-detection protocols.

### 2.1 Headless Fingerprint Neutralization
Standard Puppeteer, Playwright, or Selenium instances trigger automated anti-bot security systems. Neutralize detection flags with the following CDP injections:

1. **`navigator.webdriver` Stripping**:
   ```javascript
   Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
   ```
2. **WebGL & GPU Spoofing**:
   - Do not allow the browser to report `Google SwiftShader` or `llvmpipe` as renderer.
   - Emulate realistic vendor strings: `ANGLE (NVIDIA, NVIDIA GeForce RTX 4090 Direct3D11 vs_5_0 ps_5_0, D3D11)`.
3. **Canvas & AudioContext Noise Injection**:
   - Inject microscopic mathematical jitter (sub-perceptual ±0.0001 delta) into Canvas 2D image data readouts and AudioContext dynamics compressors to disrupt fingerprint hashes.
4. **Viewport & Window Dimensions**:
   - Never run on default `800x600`. Set realistic consumer display resolutions (e.g., `1920x1080` or `2560x1440`).

### 2.2 Human Emulation Dynamics
- **Mouse Trajectories**: Never use instant coordinate teleportation (`page.mouse.click(x, y)`). Always route cursor travel along non-linear cubic Bézier spline curves with random overshoot and micro-corrections.
- **Fast Kinetic Chunk Typing**: Disperse keystrokes in natural clusters of 6–12 characters with random micro-delays (15–35ms). Total typing time for a 1,000-character prompt drops from >120s to ~2–4s, eliminating tool timeouts while maintaining 100% genuine human input event cadence.
- **Viewport Scrolling**: Use smooth wheel increments with quadratic deceleration curves rather than instantaneous jump scrolls.

### 2.3 Session & Cookie Preservation
- Store authentication state, Google Workspace cookies, and local storage keys in encrypted persistent profile directories (`--user-data-dir`).
- Never perform automated credential re-logins continuously in headless mode. Perform initial authentication in headful mode, export authenticated session tokens, and refresh cookies before expiry.

### 2.4 Rate Limiting & Graceful Backoff
- **HTTP 429 (Too Many Requests)**: Halt immediately. Apply exponential backoff with random jitter:
  $$\Delta t = 2^{\text{retry}} + \text{rand}(1, 5) \text{ seconds}$$
- **Concurrent Request Limits**: Free tier: max 1 concurrent job; Pro: max 3; Studio: max 8. Attempting to launch jobs beyond concurrency thresholds triggers account flagging.

---

## 3. Professional Credit Budget Rules

1. **The 3-Iteration Rule**:
   - Iteration 1: Test prompt semantics & composition on `veo-3.1-lite` (2 cr/sec).
   - Iteration 2: Refine lighting and camera dynamics on `veo-3.1-fast` (5 cr/sec).
   - Iteration 3: Final lock and master render on `veo-3.1-quality` (10 cr/sec).
   - *Result*: Saves over 60% of credits compared to running every exploratory prompt directly on Quality tier.
2. **Off-Peak Batch Scheduling**:
   - Run bulk rendering jobs during off-peak hours (`02:00 - 08:00 UTC`) to exploit the 20-40% dynamic compute discount.
3. **Stills Before Motion**:
   - Always generate character rigs (`nano-banana-pro`, 5 cr) and storyboard stills (`nano-banana-2`, 2 cr) before rendering any video shots. An invalid visual design caught in a still costs 2 credits; caught in a 10s Quality video, it costs 100 credits.

---

## 4. Production Automation Edge Cases & Fix Playbook

### 4.1 Windows Job Object Process Detachment
- On Windows, Node.js `spawn({ detached: true })` does not escape the parent process's Windows Job Object. When the script exits, Chrome is killed immediately.
- **Remedy**: Always launch Chrome via PowerShell `Start-Process` inside `exec()` on Windows platforms so Chrome persists independently as a background daemon.

### 4.2 Passive reCAPTCHA vs. Active Challenge
- Google Flow always loads `<script src="...recaptcha/api.js">` in `<head>` for passive metrics. Checking script URLs causes false-positive circuit breaker trips.
- **Remedy**: Only inspect visible challenge iframes (`iframe[src*="bframe"]`, `.rc-imageselect`) and explicit body text (`"complete the captcha"`, `"solve the challenge"`).

### 4.3 Angular Material UI Mode & Model Selection
- Google Flow defaults to **Image mode**. Canvas prompt generation for video requires explicitly opening the settings sheet (`button.settings-trigger-button`), toggling the `Video` radio button, selecting the target model family (`Quality`, `Fast`, `Lite`, `Omni`), and pressing `Escape` to close the sheet.

### 4.4 Dashboard vs. Canvas Auto-Navigation
- If an agent calls `generateVideo` while on the home dashboard, no prompt box exists. The driver must autonomously discover `New Project` or existing project cards, navigate to the canvas, and await prompt box readiness before typing.

### 4.5 Video Gallery Thumbnail Click-to-Mount
- Google Flow displays generated videos in the gallery grid as static image thumbnails (`img[alt*="Generated video thumbnail"]`). The actual `<video>` tag is only mounted when the card is clicked. Polling must click the thumbnail card and extract the streamable `.mp4` URL from the mounted modal player.
