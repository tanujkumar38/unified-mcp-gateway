---
name: google-flow
description: "End-to-end professional skill for Google Flow video generation and cinematic production. Orchestrates Veo 3.1 (Quality, Fast, Lite), Gemini Omni Flash (720p, 360p), and Nano Banana (Pro, 2, 2-Lite) models via the Google Flow MCP Server. Covers 5-element prompt architecture, 8-angle canonical character rigging, Scenebuilder multi-shot continuity, Storyboard Studio sequencing, lip-sync audio alignment, credit economics, zero-ban CDP automation, and automated 5-dimensional Video Quality Control (QC) with hallucination auto-remediation. Use whenever creating videos, generating cinematic prompts, building character rigs, auditing video quality, fixing hallucinations, scheduling batch renders, or automating Google Flow workflows."
metadata:
  version: "2.1.0"
  author: "Antigravity & Google Flow Team"
  license: "MIT"
  platforms: ["linux", "macos", "windows"]
  tags: ["google-flow", "veo-3.1", "gemini-omni-flash", "nano-banana", "video-generation", "mcp", "video-qc", "hallucination-remediation"]
---

# Google Flow Professional AI Skill

A comprehensive operational manual and agent guidance system for orchestrating end-to-end generative cinema, commercial video production, and visual storytelling with **Google Flow**.

---

## 1. When to Use This Skill

Activate this skill whenever the user asks to:
- Generate or edit videos, stills, or animations using Google Flow, Veo 3.1, Gemini Omni Flash, or Nano Banana.
- Engineer or optimize video generation prompts using the 5-Element Cinematic Architecture.
- Establish character consistency across multiple shots using the 8-angle Canonical Character Rig System.
- Deconstruct screenplays into visual beats with Storyboard Studio.
- Sequence multi-shot narratives with Scenebuilder and anchor-frame transitions.
- Synchronize audio tracks, dialogue lip-sync, or sound effects with generative video.
- Perform automated 5-dimensional Video Quality Control (QC) audits and score generation outputs.
- Diagnose and auto-remediate hallucinations (melting limbs, strobe flickering, garbled text, physics violations, identity drift).
- Estimate project credit costs, analyze peak vs. off-peak pricing, or budget generation runs.
- Automate Google Flow workflows using the `google-flow-mcp-server` or zero-ban CDP browser pipelines.

---

## 2. Fast Decision Matrix & Model Routing

Before initiating generation, select the optimal model tier based on production phase:

| Production Phase | Task Description | Primary Model | Cost / Unit | Max Duration |
| :--- | :--- | :--- | :--- | :--- |
| **Character Rigging** | 8 canonical turnaround stills for facial identity lock | `nano-banana-pro` | 5 cr / image | N/A (1 frame) |
| **Concept / Storyboard** | Visual beat sketches and environmental keyframes | `nano-banana-2` | 2 cr / image | N/A (1 frame) |
| **Rapid Pre-vis** | Testing prompt semantics, lens choices, camera moves | `veo-3.1-lite` | 2 cr / sec | 15 seconds |
| **Interactive Directing**| Real-time prompt adjustments and audio-guided staging | `gemini-omni-flash-720p` | 1 cr / sec | Interactive |
| **Social / High-Volume**| Fast turnarounds for YouTube Shorts, Reels, TikTok | `veo-3.1-fast` | 5 cr / sec | 30 seconds |
| **Cinema Mastering** | Final broadcast trailers, commercials, 4K delivery | `veo-3.1-quality` | 10 cr / sec | 60 seconds |

> [!IMPORTANT]
> **The 3-Iteration Credit Rule**: Never render an untested prompt directly on `veo-3.1-quality`. Always test syntax on `veo-3.1-lite` first to save up to 60% of project credits. Detailed economic specifications are in [Model Specifications](references/model_specifications.md).

---

## 3. Core Standard Operating Procedures

### SOP 1: Formulating Production Prompts (The 5-Element Rule)
Every generative video prompt must assemble all 5 structural elements:
1. **Subject & Action**: Precise actor/entity appearance and kinematic motion progression.
2. **Environment & Setting**: Spatial architecture, terrain, weather, atmospheric particulates.
3. **Cinematography & Lens**: Focal length (e.g., `35mm anamorphic`), shot size (`CU`, `WS`), and camera move (`dolly in`, `truck right`, `orbital pan`).
4. **Lighting & Palette**: Setup (`Rembrandt lighting`, `golden hour rim`), color grade (`teal & orange`, `Kodachrome`).
5. **Render Texture & Style**: Sensor/film stock (`Arri Alexa 65`, `35mm Kodak Vision3 500T`), natural motion blur, aspect ratio (`16:9`, `9:16`, `2.39:1`).

To assemble prompts deterministically:
```bash
python scripts/flow_helper.py format-prompt \
  --subject "A cyberpunk courier racing on a neon-lit hoverbike" \
  --environment "Dense vertical metropolis under heavy monsoon rain" \
  --cinematography "Low-angle tracking dolly on 24mm anamorphic lens at f/2.0" \
  --lighting "Vibrant magenta and cyan neon reflections with high chiaroscuro contrast" \
  --style "Shot on Arri Alexa Mini LF, 180-degree shutter angle, 2.39:1 widescreen"
```

For genre-specific production prompts and negative prompt dictionaries, consult the [Prompt Engineering Handbook](references/prompt_engineering_handbook.md).

---

### SOP 2: Multi-Shot Production & Character Rigging
To eliminate character mutation across cuts:
1. **Generate Character Rig**: Call `flow_create_character_rig` or write schema conforming to [Character Rig Template](assets/character_rig_template.json).
2. **Anchor 8 Angles**: Produce the 8 canonical turnaround views (`front`, `three_quarter_left`, `profile_left`, `back_left`, `back`, `back_right`, `profile_right`, `three_quarter_right`) with `nano-banana-pro`.
3. **Storyboard Beat Decomposition**: Structure shots with [Storyboard Template](assets/storyboard_template.json).
4. **Anchor-Frame Continuity**: When generating Shot $N+1$, supply the terminal frame of Shot $N$ as the `anchor_frame` to maintain optical flow momentum.
5. **Scene Assembly**: Combine rendered clips with `flow_build_scene` specifying cut or match-cut transitions.

Review complete pipeline blueprints in [Production Pipeline Blueprint](references/production_pipeline_blueprint.md).

---

### SOP 3: Budgeting & Off-Peak Rendering
1. Check current off-peak discount status:
   ```bash
   python scripts/flow_helper.py check-peak
   ```
   *Off-Peak Window*: `02:00 - 08:00 UTC` provides **20% to 40% discount** on all credit consumption.
2. Calculate estimated project credits:
   ```bash
   python scripts/flow_helper.py estimate-cost --model veo-3.1-quality --duration 15 --count 4
   ```
3. Validate storyboard credit budget:
   ```bash
   python scripts/flow_helper.py validate-storyboard path/to/storyboard.json
   ```

---

### SOP 4: Video Quality Control (QC) & Hallucination Auto-Remediation
Every rendered clip must be audited against the 5-dimensional QC gate before timeline assembly:

$$\text{Composite QC} = (0.25 \times \text{Temporal}) + (0.25 \times \text{Anatomy}) + (0.20 \times \text{Semantic}) + (0.15 \times \text{Artifacts}) + (0.15 \times \text{Physics})$$

1. **Execute QC Audit**:
   ```bash
   python scripts/flow_helper.py audit-quality --temporal 90 --anatomy 92 --semantic 88 --artifacts 95 --physics 85
   ```
   - **Score $\ge 85$ (Approved)**: Pass to Scenebuilder assembly and audio sync.
   - **Score $70 - 84$ (Targeted Remediation)**: Minor localized defects. Execute targeted remediation below.
   - **Score $< 70$ (Critical Failure)**: Reject clip. Execute prompt de-crowding and full re-generation.

2. **Diagnose Defect & Apply Prescriptive Remediation**:
   ```bash
   python scripts/flow_helper.py diagnose-fix --defect <anatomy|flicker|text|physics|drift> --prompt "your original prompt"
   ```
   - **Anatomical Hallucinations (Class A)**: Isolate intricate hand/face actions into separate close-up shots; inject negative anatomical tokens.
   - **Temporal Flickering & Strobe (Class B)**: Apply multi-frame optical flow smoothing via `flow_upscale_media` (`apply_deflicker: true`) and clamp camera velocity deltas.
   - **Garbled Text & Watermarks (Class C)**: Inject strict exclusion tokens (`text, typography, subtitles, watermark`); omit written words from prompt; composite titles in post.
   - **Kinematic & Physics Violations (Class D)**: Escalate model to `veo-3.1-quality` (3D spatio-temporal physics attention); anchor ground contact mechanics.
   - **Identity & Style Drift (Class E)**: Re-apply 8-angle Nano Banana Pro Character Rig; lock random seed; feed previous shot terminal frame as `anchor_frame`.

Consult the comprehensive guide in [Video QC & Hallucination Engine](references/video_qc_and_hallucination_engine.md).

---

## 4. MCP Server Tool Orchestration

When connected to `google-flow-mcp-server`, use the 15 specialized MCP tools:

```
[flow_get_credits_balance / flow_estimate_cost]
                      │
                      ▼
[flow_create_character_rig] ──> [flow_create_storyboard]
                                          │
                                          ▼
[flow_generate_video (veo-3.1-lite pre-vis)]
                      │
                      ▼
[flow_generate_video (veo-3.1-quality master)] ──> [flow_extend_video]
                                                             │
                                                             ▼
[flow_build_scene] ──> [flow_sync_audio] ──> [flow_upscale_media] ──> [flow_export_project]
```

Full tool signatures, JSON schemas, resources, and client configurations are detailed in [MCP Server Reference](references/mcp_server_reference.md).

---

## 5. Artifact Troubleshooting & Remediation Quick Reference

| Issue Encountered | Defect Class | Root Cause | Solution |
| :--- | :--- | :--- | :--- |
| **Frame Flickering / Strobe** | Class B | Rapid lighting delta across frames | Apply multi-frame optical flow de-flicker via `flow_upscale_media`. |
| **Melting Limbs / Hands** | Class A | Complex concurrent physical actions | Reinforce negative prompt: `deformed limbs, extra fingers, melting anatomy`. Break complex actions into isolated shots. |
| **Identity Drift Across Cuts** | Class E | Unconditioned latent sampling | Pass `character_rig_id` and prior shot's final frame as `anchor_frame`. |
| **Hallucinated Text / Signs** | Class C | Diffusion model generating gibberish | Add `text, subtitles, logos, watermarks` to negative prompt. Add titles in post. |
| **Stalled / Frozen Motion** | Operational | Action outlasts clip generation length | Call `flow_extend_video` with 8-frame latent overlap. |

For CDP stealth automation and human-emulation rules, refer to [Troubleshooting & Anti-Ban Architecture](references/troubleshooting_and_rules.md).

---

## 6. Verification Checklist

Before delivering any Google Flow project to the user, verify:
- [ ] Prompts follow the strict 5-element format without generic filler adjectives.
- [ ] Pre-vis validation was executed on `veo-3.1-lite` before burning `veo-3.1-quality` credits.
- [ ] Canonical 8-angle character rigs are established for all recurring actors.
- [ ] Consecutive shots maintain camera momentum and pass anchor frames.
- [ ] Rendered clips passed 5-Dimensional Video QC audit ($\text{Composite QC} \ge 85$) or auto-remediation was applied.
- [ ] Renders are checked for flickering and de-flickered where necessary.
- [ ] Video exported in ProRes 422 HQ (Broadcast) or H.265 (Web).
