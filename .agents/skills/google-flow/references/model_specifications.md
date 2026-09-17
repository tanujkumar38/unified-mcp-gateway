# Google Flow AI Model Specifications & Economic Architecture

This reference document provides the definitive specifications, performance envelopes, credit economics, and deployment guidelines for all AI models operational in the Google Flow video generation ecosystem.

---

## 1. Complete Model Taxonomy & Matrix

| Model Identifier | Native Resolution | Max Duration / Type | Credit Cost | Typical Latency | Frame Rate | Optimal Use Cases |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `veo-3.1-quality` | 4K UHD / 1080p | 60 seconds | 10 credits / sec | 45 - 90s | 24, 30, 60 fps | Final production mastering, cinema trailers, hyper-realistic physical simulations, commercial campaigns. |
| `veo-3.1-fast` | 1080p FHD | 30 seconds | 5 credits / sec | 15 - 30s | 24, 30 fps | Rapid turnarounds, social media video (9:16), iterative sequence staging, client review animatics. |
| `veo-3.1-lite` | 720p HD | 15 seconds | 2 credits / sec | 5 - 12s | 24 fps | Rapid conceptual prototyping, prompt test iterations, camera blocking, rough-cut animatics. |
| `gemini-omni-flash-720p`| 720p HD | Real-time / Interactive | 1 credit / sec | 2 - 5s | 24 fps | Multi-modal script-to-video co-direction, live interactive scene manipulation, prompt-to-motion preview. |
| `gemini-omni-flash-360p`| 360p SD | Interactive Preview | 0.5 credits / sec | 1 - 3s | 15, 24 fps | Low-bandwidth live prototyping, real-time agent-in-the-loop director visual feedback. |
| `nano-banana-pro` | 4K Stills (3840x2160) | Still Image Anchor | 5 credits / image | 8 - 15s | N/A (1 frame) | Master character turnaround rig generation, key visual style anchors, production matte paintings. |
| `nano-banana-2` | 2K Stills (2048x1152) | Still Image | 2 credits / image | 4 - 8s | N/A (1 frame) | Storyboard beat keyframes, environmental concept art, continuity reference cards. |
| `nano-banana-2-lite` | 1080p Stills | Still Image | 0.8 credits / image| 2 - 4s | N/A (1 frame) | Rapid ideation, negative space testing, prompt exploration grids. |

---

## 2. In-Depth Model Deep Dive

### 2.1 Veo 3.1 Quality (`veo-3.1-quality`)
- **Architecture**: Latent Diffusion Video Transformer with 3D Spatio-Temporal Attention.
- **Motion Coherence**: Exceptional physics simulation including fluid dynamics, cloth simulation, optical dispersion, and anatomical micro-expressions.
- **Max Generation Envelope**: Up to 60 contiguous seconds without temporal degradation using autoregressive latent continuity windows.
- **Supported Aspect Ratios**: `16:9` (1.78:1), `9:16` (0.56:1), `1:1` (Square), `2.39:1` (Anamorphic Cinema), `4:3` (Vintage Academy).
- **Prompt Fidelity Score**: 98.4% adherence across spatial, atmospheric, lighting, and camera motion axes.
- **Cost Considerations**: High credit consumption (600 credits for a full 60s shot). **Rule**: Never run `veo-3.1-quality` on untested prompts; always validate prompt parameters and camera moves on `veo-3.1-lite` first.

### 2.2 Veo 3.1 Fast (`veo-3.1-fast`)
- **Architecture**: Distilled Spatio-Temporal Diffusion Transformer with accelerated ODE sampling.
- **Latency**: 3x to 4x faster generation times compared to Quality tier.
- **Strengths**: High temporal consistency, sharp dynamic movement, exceptional facial expression fidelity over 10-20 second bursts.
- **Sweet Spot**: Commercial social media campaigns (Instagram Reels, YouTube Shorts, TikTok), YouTube widescreen cuts, and client presentation mockups.

### 2.3 Veo 3.1 Lite (`veo-3.1-lite`)
- **Architecture**: Compact Latent Diffusion Backbone optimized for low memory footprint and sub-10-second latency.
- **Primary Function**: The "Drafting Table" of Google Flow. Enables directors and agents to test 5-10 prompt variations, verify camera choreographies (e.g. `orbital dolly clockwise`), and inspect lighting moods for under 30 credits per test run.

### 2.4 Gemini Omni Flash Family (`gemini-omni-flash-720p` & `360p`)
- **Architecture**: Unified multimodal generative vision-language model with streaming frame decoding.
- **Key Capability**: Understands direct natural language directorial corrections in conversational workflows (e.g., *"Make the lightning strike twice on beat 3 and pivot camera down toward the puddle"*).
- **Audio-Visual Grounding**: Can ingest guide audio tracks and synthesize rough visual choreography aligned to audio peak transients.

### 2.5 Nano Banana Image Family (`nano-banana-pro`, `nano-banana-2`, `nano-banana-2-lite`)
- **Role in Production**: Video generation without high-fidelity still anchors suffers from character mutation and style drift. Nano Banana models serve as the **foundational visual anchor generation system**.
- **Character Consistency Rigging**: `nano-banana-pro` creates 8 canonical camera angle stills of a character under uniform studio lighting (Front, 3/4 Left, Profile Left, Back Left, Back, Back Right, Profile Right, 3/4 Right) with identical seed and identity embeddings.
- **Style Matrices**: Used to generate master art direction reference boards injected into Veo video conditioning latents.

---

## 3. Credit Economics, Plans & Peak Hours

### 3.1 Subscription Tiers & Allowances
| Plan Tier | Monthly Cost | Included Credits | Concurrent Jobs | Storage Quota | API / MCP Rate Limit |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Free Tier** | $0 | 250 credits/mo | 1 job | 5 GB | 5 req / min |
| **Creator / Pro** | $29 / mo | 2,500 credits/mo | 3 concurrent jobs| 50 GB | 20 req / min |
| **Studio Tier** | $99 / mo | 10,000 credits/mo| 8 concurrent jobs| 500 GB | 60 req / min |
| **Enterprise** | Custom | Custom / Pooled | Unlimited | Multi-TB | Dedicated throughput |

### 3.2 Dynamic Peak Hours & Off-Peak Discounts
Google Flow utilizes dynamic compute balancing:
- **Peak Hours**: `14:00 UTC - 22:00 UTC` (Standard credit burn rate: 1.0x).
- **Off-Peak Window**: `02:00 UTC - 08:00 UTC` (**20% to 40% discount** on all credit burns).
- **Weekend Optimization**: Sunday `00:00 UTC - 12:00 UTC` offers guaranteed 30% reduction for batch rendering jobs.
- **Strategic Agent Rule**: When orchestrating long multi-shot project pipelines, schedule heavy `veo-3.1-quality` renders during the off-peak window to save up to 40% of project credits.

---

## 4. Production Model Selection Matrix

Use the following decision tree to choose the ideal model:

```
[Is the task Video or Still?]
  ├─ Still Image:
  │    ├─ Master Character Turnaround / Art Anchor? ──> nano-banana-pro
  │    ├─ Storyboard Beat Panel / Concept Sketch? ───> nano-banana-2
  │    └─ Fast Ideation / Grid Testing? ─────────────> nano-banana-2-lite
  │
  └─ Video Generation:
       ├─ Prompt Exploration / Camera Blocking? ─────> veo-3.1-lite
       ├─ Interactive Direction / Rough Visual Sync? ─> gemini-omni-flash-720p
       ├─ High-Volume Production / Social Media? ────> veo-3.1-fast
       └─ Final Mastering / Broadcast / Film? ────────> veo-3.1-quality
```
