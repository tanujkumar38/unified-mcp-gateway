# Google Flow MCP Server v2.0 Technical Reference

A complete integration and operational manual for the `google-flow-mcp-server`, enabling AI agents across any MCP-compliant environment to orchestrate video generation, character rigs, scene assembly, and post-production.

---

## 1. Architecture & Protocol Overview

The Google Flow MCP Server bridges Model Context Protocol clients (Claude Desktop, Antigravity, Cursor, Windsurf, Trae, Continue, Hermes) with Google Flow's generative video engine.

- **Protocol Specification**: Model Context Protocol (MCP) 2024-11-05 / latest.
- **Server Implementation**: TypeScript / Node.js ESM (`@modelcontextprotocol/sdk`).
- **Transport**: Standard I/O (`stdio`).
- **Capabilities**: Tools (14), Resources (5), Prompts (6).

---

## 2. Tools Reference (14 Tools)

### 2.1 Video & Still Generation Tools
1. **`flow_generate_video`**:
   - *Arguments*: `prompt` (string, required), `model` (`veo-3.1-quality` | `veo-3.1-fast` | `veo-3.1-lite` | `gemini-omni-flash-720p` | `gemini-omni-flash-360p`), `duration_seconds` (number, 1-60), `aspect_ratio` (`16:9` | `9:16` | `1:1` | `2.39:1` | `4:3`), `negative_prompt` (string), `seed` (number), `character_rig_id` (string), `anchor_frame` (string URL/path).
   - *Returns*: Job object containing `job_id`, `status: queued`, `estimated_completion_seconds`, `credit_cost`.

2. **`flow_extend_video`**:
   - *Arguments*: `video_id` (string, required), `prompt` (string, required), `extension_seconds` (number, 1-30), `overlap_frames` (default: 8).
   - *Returns*: Extended video job descriptor.

3. **`flow_generate_still`**:
   - *Arguments*: `prompt` (string, required), `model` (`nano-banana-pro` | `nano-banana-2` | `nano-banana-2-lite`), `aspect_ratio` (`16:9` | `9:16` | `1:1` | `2.39:1` | `4:3`), `seed` (number).
   - *Returns*: Still generation job with output URL.

### 2.2 Production & Sequencing Tools
4. **`flow_create_character_rig`**:
   - *Arguments*: `name` (string, required), `description` (string, required), `art_style` (string, default: `"cinematic photorealism"`), `generate_8_angles` (boolean, default: true).
   - *Returns*: Character Rig object with `rig_id`, character seed, and 8 canonical angle URLs.

5. **`flow_create_storyboard`**:
   - *Arguments*: `project_name` (string, required), `shots` (array of shot objects: `shot_number`, `prompt`, `camera_movement`, `duration_seconds`, `model`).
   - *Returns*: Storyboard record with `storyboard_id`, shot breakdown, and total cost estimate.

6. **`flow_build_scene`**:
   - *Arguments*: `scene_name` (string, required), `shot_ids` (array of strings, required), `transition_type` (`cut` | `crossfade` | `match_cut` | `whip_pan`), `blend_frames` (number).
   - *Returns*: Assembled continuous scene job.

7. **`flow_sync_audio`**:
   - *Arguments*: `video_id` (string, required), `audio_source` (string URL/path, required), `sync_mode` (`lip_sync` | `beat_align` | `ambient_foley`).
   - *Returns*: Audio-synchronized video media descriptor.

8. **`flow_upscale_media`**:
   - *Arguments*: `media_id` (string, required), `target_resolution` (`1080p` | `4k` | `8k`), `apply_deflicker` (boolean, default: true).
   - *Returns*: Super-resolution job descriptor.

### 2.3 Job Management & Economics Tools
9. **`flow_check_job_status`**:
   - *Arguments*: `job_id` (string, required).
   - *Returns*: Detailed job state (`queued` | `processing` | `completed` | `failed`), progress percentage, output media URLs.

10. **`flow_cancel_job`**:
    - *Arguments*: `job_id` (string, required).
    - *Returns*: Cancellation confirmation and refunded credit balance.

11. **`flow_get_credits_balance`**:
    - *Arguments*: None.
    - *Returns*: Available credits, plan tier, reset date, active concurrent jobs.

12. **`flow_estimate_cost`**:
    - *Arguments*: `model` (string, required), `duration_seconds` (number), `count` (number, default: 1), `is_peak_hours` (boolean).
    - *Returns*: Estimated credits, standard cost vs. off-peak discounted cost.

13. **`flow_list_models`**:
    - *Arguments*: None.
    - *Returns*: Complete list of available models and specifications.

14. **`flow_export_project`**:
    - *Arguments*: `project_id` (string, required), `export_format` (`prores_422_hq` | `h265_mp4` | `edl_xml` | `complete_zip`).
    - *Returns*: Download URL and export artifact metadata.

---

## 3. Resources Reference (5 Resources)

Clients can read live state via MCP Resource URIs:
- `flow://models`: Static and dynamic catalog of available video and still generative models.
- `flow://pricing`: Current credit pricing matrix, off-peak multiplier, and subscription quotas.
- `flow://rigs`: In-memory and persistent character turnaround rigs.
- `flow://storyboards`: Active storyboard documents and visual beat sheets.
- `flow://jobs/{id}`: Real-time progress and logs for a specific generation job.

---

## 4. Prompt Templates Reference (6 Prompts)

Exposed as reusable client prompts:
1. `flow-prompt-optimizer`: Rewrites naive prompts into the 5-element cinematic architecture.
2. `flow-storyboard-breakdown`: Deconstructs a narrative script into timed visual beats.
3. `flow-character-rig-designer`: Generates the 8 canonical turnaround prompt specifications.
4. `flow-cinematography-director`: Formulates camera movements and lens selections for given dramatic moods.
5. `flow-cost-estimator`: Analyzes a shot list and computes budget across Quality/Fast/Lite tiers.
6. `flow-troubleshoot-artifacts`: Ingests video generation defect descriptions and prescribes remedies.

---

## 5. Client Configuration Schemas

### Claude Desktop (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "google-flow": {
      "command": "node",
      "args": ["c:/Users/tanuj/Documents/antigravity/zealous-brahmagupta/google-flow-mcp-server/dist/index.js"]
    }
  }
}
```

### Cursor (`~/.cursor/mcp.json`)
```json
{
  "mcpServers": {
    "google-flow": {
      "command": "node",
      "args": ["c:/Users/tanuj/Documents/antigravity/zealous-brahmagupta/google-flow-mcp-server/dist/index.js"]
    }
  }
}
```

### Antigravity / Gemini (`~/.gemini/antigravity/mcp/google-flow/`)
Configured in the local environment to expose tools directly into the agent tool registry.
