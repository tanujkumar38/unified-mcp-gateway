# Google Flow Video Quality Control (QC) & Hallucination Remediation Engine

A rigorous, production-grade framework for automated quality assessment, defect classification, and systematic hallucination remediation in generative video pipelines (Veo 3.1, Gemini Omni Flash, Nano Banana).

---

## 1. Multi-Dimensional Quality Control (QC) Architecture

To prevent deformed or hallucinatory outputs from contaminating production edits, every rendered clip must undergo a 5-dimensional audit.

### 1.1 The 5 Audit Dimensions

| Dimension | Description | Target Benchmark | Failure Indicators |
| :--- | :--- | :--- | :--- |
| **1. Temporal Stability** | Optical flow consistency and illumination smoothness across sequential frames. | $\ge 85 / 100$ | Strobe flickering, micro-jitter, background object warping, erratic geometry shifts. |
| **2. Anatomical Integrity** | Biological plausibility of human, animal, or character anatomy. | $\ge 90 / 100$ | Melting facial features, 6+ fingers, fused joints, disappearing limbs, asymmetrical eyes. |
| **3. Semantic Adherence** | Exact fidelity to the 5-element prompt specifications (action, camera, style). | $\ge 85 / 100$ | Ignored camera movements (e.g. static instead of dolly), mismatched color palette, missing attire. |
| **4. Artifact & Text Suppression**| Elimination of diffusion artifacts, pseudo-alphabets, and compression noise. | $\ge 95 / 100$ | Garbled neon signs, hallucinated subtitles, watermark stamps, pixelated compression noise. |
| **5. Physical Coherence** | Consistency with real-world or stylized physics, momentum, and gravity. | $\ge 80 / 100$ | Moonwalking (sliding feet), phase-through object collisions, inverted liquid gravity, unnatural acceleration. |

### 1.2 Composite QC Scoring Formula

$$\text{Composite QC} = (0.25 \times \text{Temporal}) + (0.25 \times \text{Anatomy}) + (0.20 \times \text{Semantic}) + (0.15 \times \text{Artifacts}) + (0.15 \times \text{Physics})$$

- **Tier 1: Approved ($\ge 85$)**: Pristine output. Ready for Scenebuilder assembly, audio synchronization, and final 4K mastering.
- **Tier 2: Targeted Remediation ($70 - 84$)**: Minor localized defects. Apply automated post-processing filters (e.g., de-flicker or single-seed re-roll).
- **Tier 3: Critical Failure ($< 70$)**: Severe hallucination or anatomical collapse. Reject output immediately; execute prompt de-crowding and negative prompt reinforcement before re-rendering.

---

## 2. Hallucination Taxonomy & Remediation Playbook

Every generative video error falls into one of five standardized defect classes. Apply the corresponding deterministic remediation protocol:

```
[Defect Detected]
  ├─ Class A: Anatomical Hallucination ────> Negative Prompt Reinforce + Action Isolation
  ├─ Class B: Temporal Glitch / Flicker ───> Multi-Frame Optical Flow + Motion Bucket Clamping
  ├─ Class C: Garbled Text / Watermark ────> Strict Exclusion Tokens + Post Composite
  ├─ Class D: Kinematic / Physics Error ───> Model Escalation (to Veo Quality) + Velocity Grounding
  └─ Class E: Identity / Style Drift ──────> Anchor-Frame Clamping + 8-Angle Character Rig Lock
```

---

### 2.1 Class A: Anatomical Hallucination (Melting Faces, Extra Digits, Disfigured Limbs)
- **Root Cause**: Diffusion transformers struggle when a prompt asks for simultaneous multi-limb micro-gestures (e.g. *"juggling keys while unlocking a door and pointing at a map"*).
- **Remediation Protocol**:
  1. **Action Isolation**: Split the shot into two sequential cuts:
     - Shot 1: Medium shot focusing on posture and facial expression.
     - Shot 2: Tight macro close-up isolating hand interactions with the object.
  2. **Negative Prompt Injection**:
     ```text
     extra limbs, extra fingers, missing fingers, fused digits, deformed hands, unnatural anatomy, asymmetrical face, melting facial features, detached appendages, wax mannequin skin.
     ```
  3. **Model Selection**: Switch generation from `veo-3.1-lite` to `veo-3.1-quality` or use `nano-banana-pro` to establish a locked keyframe anchor before re-animating.

---

### 2.2 Class B: Temporal Glitch (Strobe Flickering, Background Warping, Micro-Jitter)
- **Root Cause**: Unconstrained high-frequency variance in lighting sources or excessive camera velocity deltas between frames.
- **Remediation Protocol**:
  1. **Optical Flow Smoothing**: Call `flow_upscale_media` with `apply_deflicker: true`. The multi-frame temporal smoothing pass eliminates high-frequency illumination strobes.
  2. **Motion Vector Clamping**: Reduce camera speed instructions (e.g., change *"high-speed whip pan"* to *"smooth measured tracking pan at 1.5 m/s"*).
  3. **Anchor Frame Clamping**: Provide the final frame of the preceding shot as `anchor_frame` and set `temporal_blend_frames: 12`.

---

### 2.3 Class C: Text & Watermark Hallucination (Garbled Glyphs, Pseudo-Subtitles)
- **Root Cause**: Describing written signage or logos in natural language prompts causes the model to synthesize gibberish pseudo-characters.
- **Remediation Protocol**:
  1. **Strict Exclusion Token Injection**:
     ```text
     text, typography, letters, alphabet, words, subtitles, captions, watermark, logo, trademark, brand stamp, UI overlay, HUD symbols.
     ```
  2. **Decouple Text from Generative Pass**: Strip all requests for written text from the prompt (e.g., replace *"a sign that says COFFEE"* with *"a glowing neon storefront sign in warm amber"*). Overlay authentic typographic titles in post-production.

---

### 2.4 Class D: Kinematic & Physics Violations (Sliding Feet, Inverted Fluids, Clipping)
- **Root Cause**: Lightweight models (`veo-3.1-lite` or fast distillations) employ simplified spatio-temporal physics approximations that fail under complex dynamics.
- **Remediation Protocol**:
  1. **Model Tier Escalation**: Escalate from `veo-3.1-lite`/`fast` to `veo-3.1-quality`. The Quality model integrates full 3D spatio-temporal attention for physical simulation.
  2. **Ground Contact Reinforcement**: In the prompt, anchor the interaction to solid physics (e.g., *"boots firmly pressing into damp packed gravel, distinct footprints left with each deliberate step"*).
  3. **Fluid Simulation Anchoring**: Explicitly state fluid parameters (*"viscous dense honey pouring with natural gravity at 24fps"*).

---

### 2.5 Class E: Identity / Style Drift Across Sequential Cuts
- **Root Cause**: Generating contiguous shots without conditioning on shared latent seeds or character reference embeddings.
- **Remediation Protocol**:
  1. **Character Rig Enforcement**: Re-inject the locked `character_rig_id` (generated via `flow_create_character_rig` or `assets/character_rig_template.json`).
  2. **Latent Seed Pinning**: Lock the random generator seed across related sequence shots.
  3. **Visual Anchor Handoff**: Pass the exact terminal PNG frame of Shot $A$ as the `anchor_frame` of Shot $B$.

---

## 3. Automated QC Audit Pipeline Workflow

```
[Render Output Completed]
            │
            ▼
[Execute QC Audit: flow_helper.py audit-quality]
            │
      ┌─────┴────────────────────────┐
      ▼                              ▼
[QC Score >= 85]              [QC Score < 85]
(Approved)                           │
      │                              ▼
      │                      [Execute Diagnosis: flow_helper.py diagnose-fix]
      │                              │
      │                              ▼
      │                      [Apply Targeted Remediation Protocol]
      │                              │
      │                              ▼
      │                      [Re-render or De-flicker Pass]
      │                              │
      └──────────────┬───────────────┘
                     ▼
       [Master ProRes Export & Scene Delivery]
```

### Deterministic CLI Commands
- **Audit Video Quality**:
  ```bash
  python scripts/flow_helper.py audit-quality --temporal 90 --anatomy 75 --semantic 85 --artifacts 80 --physics 85
  ```
- **Diagnose Defect & Get Prescriptive Fix**:
  ```bash
  python scripts/flow_helper.py diagnose-fix --defect anatomy
  python scripts/flow_helper.py diagnose-fix --defect flicker
  python scripts/flow_helper.py diagnose-fix --defect text
  python scripts/flow_helper.py diagnose-fix --defect physics
  python scripts/flow_helper.py diagnose-fix --defect drift
  ```
- **Generate Production QC Inspection Checklist**:
  ```bash
  python scripts/flow_helper.py qc-checklist
  ```
