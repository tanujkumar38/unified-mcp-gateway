# Google Flow Professional Production Pipeline Blueprint

A battle-tested blueprint for executing full-lifecycle generative cinema, commercials, and episodic content from script breakdown to master 4K delivery.

---

## 1. Pipeline Overview & Lifecycle Phases

```
[Phase 1: Pre-Production]
  Script Breakdown ──> Character Rigs (8-Angle Nano Banana) ──> Storyboard Studio (Beats & Stills)
                                                                           │
                                                                           ▼
[Phase 2: Production]
  Veo 3.1 Lite Blocking ──> Multi-Shot Scenebuilder Assembly ──> Veo 3.1 Quality Renders
                                                                           │
                                                                           ▼
[Phase 3: Post-Production]
  Audio Track & Dialogue Sync ──> 4K Latent Upscaling & De-Flicker ──> ProRes Master Export
```

---

## 2. Phase 1: Pre-Production & Character Consistency

### 2.1 The 8-Angle Canonical Character Rig System
To maintain 100% facial and anatomical continuity across multiple scenes, shots, and wardrobe configurations, every project begins by building a **Character Rig**.

1. **Model**: Execute with `nano-banana-pro` (4K Still Anchor).
2. **Setup**: Uniform neutral three-point studio lighting, solid neutral grey backdrop (`#808080`), static expressionless or slight natural smile.
3. **The 8 Canonical Angles**:
   - `01_front`: Direct eye-level frontal view (0 degrees).
   - `02_three_quarter_left`: 45-degree angle showing left profile and nose bridge.
   - `03_profile_left`: Strict 90-degree left silhouette profile.
   - `04_back_left`: 135-degree rear three-quarter view showing hairline and left shoulder.
   - `05_back`: 180-degree rear view showing complete posture and spine alignment.
   - `06_back_right`: 225-degree rear three-quarter view.
   - `07_profile_right`: Strict 90-degree right silhouette profile.
   - `08_three_quarter_right`: 315-degree front-right three-quarter view.
4. **Identity Anchor Embedding**:
   - Extract the latent seed and reference image URLs.
   - Assign a unique Character Rig ID (e.g., `crig_elena_vanguard_v1`).
   - In subsequent video prompts, inject the Character Rig ID into the `character_rig_id` parameter or reference the canonical anchor frames as conditioning image inputs.

### 2.2 Storyboard Studio Setup
- Deconstruct the narrative screenplay into individual visual beats (typically 3 to 6 seconds per beat).
- Generate a 2K concept keyframe for each beat using `nano-banana-2`.
- Store beat metadata: Shot Number, Duration, Camera Angle, Camera Move, Sound/Dialogue, Mood Palette.

---

## 3. Phase 2: Production & Scenebuilder Sequencing

### 3.1 Multi-Shot Scenebuilder Assembly
The **Scenebuilder** module stitches individual generative shots into continuous scenes while eliminating cuts or perceptual jumps.

1. **Overlap Continuity (Anchor Frames)**:
   - To render Shot B following Shot A, export the final frame of Shot A (Frame $N$) as a high-resolution lossless PNG.
   - Pass Frame $N$ as the `anchor_frame` input to Shot B's generation job.
   - Specify `temporal_blend_frames: 12` to ensure latent vector coherence across the cut boundary.

2. **Camera Motion Vector Continuity**:
   - Maintain momentum across cuts: If Shot A ends with a rightward truck (`truck right at 1.2 m/s`), Shot B should initiate with an identical or complementary velocity vector (`continue truck right` or `dolly in`).
   - A sudden reversal of camera motion without an intervening cut induces visual disorientation and model hallucination.

3. **Two-Stage Rendering Strategy**:
   - **Stage 1 (Pre-vis)**: Generate the complete sequence using `veo-3.1-lite` (720p, 5-10s latency). Review pacing, composition, and cut points.
   - **Stage 2 (Final Mastering)**: Transfer locked seeds and prompts directly into `veo-3.1-quality` (4K, 60fps) during off-peak hours (02:00-08:00 UTC) to minimize credit burn.

---

## 4. Phase 3: Post-Production, Audio Sync & Mastering

### 4.1 Audio & Lip-Sync Alignment
- Ingest the voiceover dialogue, Foley track, and musical score.
- Run `flow_sync_audio` tool with `gemini-omni-flash-720p` or the Google Flow Audio Alignment Engine.
- The alignment engine parses phonetic viseme timings from the speech waveform and recalculates facial landmark latents on the video frames to generate precise lip synchronization.

### 4.2 AI Upscaling & De-Flicker Processing
- Run `flow_upscale_media` on rendered sequences:
  - **Upscaling Kernel**: AI Latent Super-Resolution (upscales 1080p -> 4K or 4K -> 8K).
  - **De-Flicker Filter**: Multi-frame optical flow smoothing suppresses micro-frequency lighting strobes across contiguous frames.
  - **Color Conformation**: Apply project LUT (Look-Up Table) in Rec.709 (SDR web broadcast) or Rec.2020 / DCI-P3 (HDR theatrical).

### 4.3 Master Export Specifications
- **Broadcast / Theatrical Master**: Apple ProRes 422 HQ or Avid DNxHR HQX, 3840x2160, 24.000 fps, Linear PCM 24-bit 48kHz audio.
- **Web & Social Master**: H.265 / HEVC (MP4), Rec.709, CRF 18, AAC audio 320 kbps.

---

## 5. End-to-End Production Case Study: 30-Second Commercial

**Project**: *"Aethelgard Chronograph - Timeless Precision"* (30s Luxury Watch Commercial)

| Beat | Duration | Model | Camera Choreography | Prompt Summary | Cost |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Beat 1** | 5 sec | `veo-3.1-quality` | Slow motorized turntable macro | Obsidian slab, water droplets rolling on sapphire crystal, 100mm macro lens. | 50 cr |
| **Beat 2** | 6 sec | `veo-3.1-quality` | Steadicam forward glide | Modernist Swiss atelier, master craftsman seated at wooden bench in morning sun. | 60 cr |
| **Beat 3** | 7 sec | `veo-3.1-quality` | Over-the-shoulder macro rack focus | Tweezers placing gold balance wheel into mechanical movement, internal gear tick. | 70 cr |
| **Beat 4** | 6 sec | `veo-3.1-quality` | Slow dolly out to medium shot | Craftsman puts on jacket, checks wrist, subtle confident smile, golden hour light. | 60 cr |
| **Beat 5** | 6 sec | `veo-3.1-quality` | Hero beauty shot, orbit 45 deg | Watch floating in zero gravity against black silk, golden light flare across bezel. | 60 cr |
| **Upscale**| 30 sec | `flow_upscale_media`| N/A | 4K Latent Super-Resolution & De-Flicker pass across all 5 master clips. | 35 cr |
| **Total** | **30 sec**| **Quality Tier** | **Complete Cinema Package** | **Grand Total Production Cost**: | **335 cr** |
