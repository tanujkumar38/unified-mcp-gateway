import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { BrowserManager } from "../core/browser-manager.js";
import { FlowDriver, FlowVideoModel } from "../core/flow-driver.js";

export function registerVideoTools(server: McpServer): void {
  // Generate Video with Veo 3.1 or Gemini Omni Flash
  server.tool(
    "google_flow_generate_video",
    "Generates professional AI video clips using Google Flow's flagship models: Veo 3.1 (Quality, Fast, Lite) and Gemini Omni Flash (720p, 360p). Supports Text-to-Video, Frames-to-Video (start/end frames), Ingredients-to-Video (@references), camera motion, native audio prompts, and credit budgeting.",
    {
      prompt: z
        .string()
        .min(3)
        .describe(
          "Core narrative prompt describing the scene, subject, movement, and visual action."
        ),
      model: z
        .enum([
          "veo-3.1-quality",
          "veo-3.1-fast",
          "veo-3.1-lite",
          "gemini-omni-flash-720p",
          "gemini-omni-flash-360p",
        ])
        .optional()
        .default("veo-3.1-fast")
        .describe(
          "Model variant: 'veo-3.1-quality' (100 credits, 8s only, best cinematic fidelity), 'veo-3.1-fast' (20/10 credits, 4-8s), 'veo-3.1-lite' (10/5 credits, supports extension), 'gemini-omni-flash-720p' (4-10s, custom voice), 'gemini-omni-flash-360p' (budget prototyping)."
        ),
      aspect_ratio: z
        .enum(["16:9", "9:16", "1:1", "2.39:1", "4:3"])
        .optional()
        .default("16:9")
        .describe("Aspect ratio for the generated video (16:9 landscape, 9:16 vertical/shorts, 1:1 square, 2.39:1 anamorphic cinema, 4:3 academy)."),
      duration_seconds: z
        .number()
        .min(1)
        .max(60)
        .optional()
        .describe("Target duration in seconds (e.g. 4, 5, 6, 8, 10, up to 60s). Automatically normalized to native model increments."),
      camera_motion: z
        .string()
        .optional()
        .describe(
          "Cinematic camera motion directive (e.g. 'Dolly forward into close-up', 'Smooth drone crane shot ascending', 'Slow 360 orbit', 'Tracking shot matching speed')."
        ),
      style_preset: z
        .string()
        .optional()
        .describe(
          "Visual aesthetic style (e.g. '35mm anamorphic film, cinematic lighting', 'Photorealistic hyper-detailed documentary', 'Cyberpunk neon atmospheric haze')."
        ),
      audio_cues: z
        .string()
        .optional()
        .describe(
          "Directives for Veo's native synchronized audio engine (e.g. 'Thunder rumbling with heavy rain and whisper dialogue', 'Upbeat ambient synth score with footsteps')."
        ),
      start_frame: z
        .string()
        .optional()
        .describe("URL or file path to an initial starting image frame (Frames-to-Video)."),
      end_frame: z
        .string()
        .optional()
        .describe("URL or file path to a final ending image frame (Frames-to-Video)."),
      ingredients: z
        .array(z.string())
        .optional()
        .describe("Reference tags for characters, environments, or props (e.g. ['@Sarah_Character', '@NeoTokyo'])."),
      dry_run: z
        .boolean()
        .optional()
        .default(false)
        .describe(
          "If true, validates model compatibility, calculates credit costs, and compiles the complete prompt blueprint without consuming generation quota."
        ),
    },
    {
      title: "Generate Video (Veo 3.1 & Gemini Omni Flash)",
      openWorldHint: true,
      destructiveHint: false,
    },
    async (params) => {
      try {
        if (params.dry_run) {
          const result = await FlowDriver.generateVideo({} as any, {
            prompt: params.prompt,
            model: params.model as FlowVideoModel,
            aspectRatio: params.aspect_ratio,
            durationSeconds: params.duration_seconds,
            cameraMotion: params.camera_motion,
            stylePreset: params.style_preset,
            audioCues: params.audio_cues,
            startFrameUrl: params.start_frame,
            endFrameUrl: params.end_frame,
            ingredients: params.ingredients,
            dryRun: true,
          });

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        const page = await BrowserManager.getFlowPage();
        const result = await FlowDriver.generateVideo(page, {
          prompt: params.prompt,
          model: params.model as FlowVideoModel,
          aspectRatio: params.aspect_ratio,
          durationSeconds: params.duration_seconds,
          cameraMotion: params.camera_motion,
          stylePreset: params.style_preset,
          audioCues: params.audio_cues,
          startFrameUrl: params.start_frame,
          endFrameUrl: params.end_frame,
          ingredients: params.ingredients,
          dryRun: false,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  ...result,
                  guidance:
                    "Generation is processing on Google Flow. Call 'google_flow_poll_generation' to track rendering progress and retrieve the streamable MP4 link.",
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (err: any) {
        return {
          content: [
            {
              type: "text",
              text: `Video generation failed: ${err.message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
