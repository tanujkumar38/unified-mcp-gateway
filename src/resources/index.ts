import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { BrowserManager } from "../core/browser-manager.js";
import { FlowDriver } from "../core/flow-driver.js";
import { AntiBanGuardrails } from "../core/anti-ban-guardrails.js";
import { CAMERA_PRESETS } from "../tools/camera-controls.js";
import { config } from "../config.js";
import { logger } from "../utils/logger.js";

export function registerResources(server: McpServer): void {
  logger.info("Registering Google Flow Professional MCP resources...");

  // 1. Session and Guardrail Status Resource
  server.resource(
    "flow-session-status",
    "flow://session/status",
    {
      description: "Real-time Google Flow connection state, anti-ban guardrail status, and cooldown metrics.",
      mimeType: "application/json",
    },
    async () => {
      const guardrails = AntiBanGuardrails.getStatus();
      const connected = await BrowserManager.isConnected();
      let authInfo: any = null;

      if (connected) {
        try {
          const page = await BrowserManager.getFlowPage();
          authInfo = await FlowDriver.checkAuthStatus(page);
        } catch {
          // Non-blocking
        }
      }

      return {
        contents: [
          {
            uri: "flow://session/status",
            mimeType: "application/json",
            text: JSON.stringify(
              {
                connected,
                auth: authInfo,
                guardrails,
                config: {
                  cdpPort: config.cdpPort,
                  flowUrl: config.flowUrl,
                  cooldownMs: config.generationCooldownMs,
                },
                timestamp: new Date().toISOString(),
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // 2. Models Catalog & Feature Matrix Resource
  server.resource(
    "flow-models-catalog",
    "flow://models",
    {
      description: "Complete technical specifications, credit costs, and feature matrix for all Veo 3.1, Gemini Omni, and Nano Banana models.",
      mimeType: "application/json",
    },
    async () => {
      const models = {
        videoModels: {
          "veo-3.1-quality": {
            durations: [8],
            nativeAudio: true,
            resolution: "720p+",
            creditCostStandard: 100,
            creditCostUltra: 100,
            features: ["Text-to-Video", "Frames-to-Video"],
            unsupported: ["Ingredients-to-Video", "Extend", "Video-to-Video Edit"],
            bestFor: "Final production, cinematic excellence, maximum physics and realism",
          },
          "veo-3.1-fast": {
            durations: [4, 6, 8],
            nativeAudio: true,
            resolution: "720p+",
            creditCostStandard: 20,
            creditCostUltra: 10,
            features: ["Text-to-Video", "Frames-to-Video", "Ingredients-to-Video (8s only)"],
            unsupported: ["Extend", "Video-to-Video Edit"],
            bestFor: "Standard professional productions, reliable quality-to-speed ratio",
          },
          "veo-3.1-lite": {
            durations: [4, 6, 8],
            nativeAudio: true,
            resolution: "720p+",
            creditCostStandard: 10,
            creditCostUltra: 5,
            features: ["Text-to-Video", "Frames-to-Video", "Ingredients-to-Video (8s only)", "Video Extension"],
            unsupported: ["Video-to-Video Edit"],
            bestFor: "Fast prototyping, rapid concept testing, video clip extension",
          },
          "gemini-omni-flash-720p": {
            durations: [4, 6, 8, 10],
            nativeAudio: true,
            resolution: "720p",
            creditCostStandard: "7 (4s), 10 (6s), 12 (8s), 15 (10s)",
            videoEditCost: 40,
            features: ["Text-to-Video", "Frames-to-Video", "Ingredients-to-Video", "Video-to-Video Edit", "Voice References"],
            bestFor: "10-second clips, conversational video editing, multimodal projects",
          },
          "gemini-omni-flash-360p": {
            durations: [4, 6, 8, 10],
            nativeAudio: true,
            resolution: "360p (upscalable to 720p)",
            creditCostStandard: "4 (4s), 5 (6s), 6 (8s), 7 (10s)",
            features: ["Text-to-Video", "Frames-to-Video", "Ingredients-to-Video"],
            bestFor: "Budget-conscious prototyping and rapid testing",
          },
        },
        imageModels: {
          "nano-banana-pro": {
            resolution: "Up to 4K",
            creditCost: "10 (Standard) / 5 (Ultra)",
            features: ["Text-to-Image", "Image Editing", "Superior Typography", "Multi-Image Blending"],
            bestFor: "Commercial visuals, character reference sheets, high-detail assets",
          },
          "nano-banana-2": {
            resolution: "Up to 2K/4K",
            creditCost: 0,
            features: ["Text-to-Image", "Consistent Characters across scenes"],
            bestFor: "Standard creative generation (default on free tier)",
          },
          "nano-banana-2-lite": {
            resolution: "Up to 1K",
            creditCost: 0,
            features: ["Text-to-Image", "Ultra-fast generation"],
            bestFor: "Rapid iteration and rough layout prototyping",
          },
        },
      };

      return {
        contents: [
          {
            uri: "flow://models",
            mimeType: "application/json",
            text: JSON.stringify(models, null, 2),
          },
        ],
      };
    }
  );

  // 3. Production Checklists Resource from Handbook
  server.resource(
    "flow-checklists",
    "flow://production-checklists",
    {
      description: "Pre-production, pre-generation, quality control, and export checklists from the Google Flow Professional Handbook.",
      mimeType: "application/json",
    },
    async () => {
      const checklists = {
        preGenerationPromptChecklist: [
          "Subject clearly described (age, attire, facial traits)",
          "Specific physical action defined",
          "Environment & lighting direction detailed",
          "Camera angle, focal length, and motion specified",
          "Native audio cues and soundscape included",
          "Aspect ratio matched to target platform (16:9 or 9:16)",
          "Reference tags verified (@CharacterName, @Environment)",
        ],
        qualityControlChecklist: [
          "Visual sharpness & texture fidelity (no blur/noise)",
          "Motion smoothness (no unnatural jumps or physics violations)",
          "Character facial and wardrobe consistency matching reference",
          "Camera stability matching intended movement speed",
          "Audio synchronization matching visual actions",
        ],
        exportChecklist: [
          "Sequence assembled cleanly in Scenebuilder",
          "Transitions timed properly",
          "Resolution set to maximum available (720p/1080p/4K)",
          "Color space preserved",
        ],
      };

      return {
        contents: [
          {
            uri: "flow://production-checklists",
            mimeType: "application/json",
            text: JSON.stringify(checklists, null, 2),
          },
        ],
      };
    }
  );

  // 4. Cinematic Presets & Formulas Resource for Veo 3.1
  server.resource(
    "flow-cinematic-presets",
    "flow://presets/cinematic-shots",
    {
      description: "Curated cinematic camera motions, lens specifications, lighting archetypes, and audio descriptors for Veo 3.1.",
      mimeType: "application/json",
    },
    async () => {
      const presets = {
        cameraPresets: CAMERA_PRESETS,
        lightingArchetypes: {
          chiaroscuro: "High-contrast chiaroscuro lighting with deep shadows and sharp rim light",
          golden_hour: "Warm golden hour natural sunlight with soft atmospheric lens flare",
          cyberpunk_neon: "Bioluminescent and vibrant cyan-magenta neon backlight reflected on wet asphalt",
          overcast_diffused: "Soft diffused daylight under moody overcast sky, neutral tones",
          rembrandt: "Rembrandt lighting setup with key light at 45 degrees creating subtle triangle of light on cheek",
        },
        filmStocks: [
          "Kodak Vision3 500T 35mm grain",
          "Anamorphic Panavision 2.39:1 widescreen flare",
          "IMAX 70mm ultra-sharp hyper-detailed texture",
        ],
        audioFormulas: [
          "Ambient environmental soundscape with subtle orchestral score crescendo",
          "Rhythmic footsteps on gravel with distant thunder and wind howling",
          "Intimate character dialogue with clean acoustic presence and quiet vinyl crackle",
        ],
      };

      return {
        contents: [
          {
            uri: "flow://presets/cinematic-shots",
            mimeType: "application/json",
            text: JSON.stringify(presets, null, 2),
          },
        ],
      };
    }
  );

  logger.info("Google Flow Professional resources registered successfully");
}
