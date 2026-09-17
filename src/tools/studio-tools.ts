import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { BrowserManager } from "../core/browser-manager.js";
import { FlowDriver, FlowVideoModel, FlowImageModel } from "../core/flow-driver.js";

export function registerStudioTools(server: McpServer): void {
  // 1. Scenebuilder Assembly
  server.tool(
    "google_flow_scenebuilder",
    "Assembles, sequences, and trims multiple generated video clips into a continuous multi-shot scene in Google Flow's Scenebuilder timeline.",
    {
      clip_ids: z
        .array(z.string())
        .min(2)
        .describe("Ordered list of video clip IDs or titles to sequence together on the timeline."),
      transition_type: z
        .enum(["cut", "cross_dissolve", "fade"])
        .optional()
        .default("cut")
        .describe("Transition style between successive clips."),
      dry_run: z
        .boolean()
        .optional()
        .default(false)
        .describe("If true, validates timeline clip assembly without mutating flow canvas."),
    },
    {
      title: "Scenebuilder Timeline Assembly",
      openWorldHint: true,
      destructiveHint: false,
    },
    async ({ clip_ids, transition_type, dry_run }) => {
      try {
        if (dry_run) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: true,
                    status: "dry_run_validated",
                    clipCount: clip_ids.length,
                    clips: clip_ids,
                    transition: transition_type,
                    message: `[DRY-RUN] Scenebuilder sequence validated: ${clip_ids.length} clips with ${transition_type} transitions.`,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        const page = await BrowserManager.getFlowPage();
        const result = await FlowDriver.assembleScene(page, clip_ids, transition_type);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err: any) {
        return {
          content: [
            {
              type: "text",
              text: `Scenebuilder assembly failed: ${err.message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // 2. Storyboard Studio Automated Parser
  server.tool(
    "google_flow_storyboard_studio",
    "Parses a script, scene synopsis, or narrative description into structured visual storyboard panels with shot types, camera specs, and Veo 3.1 generation prompts.",
    {
      script: z
        .string()
        .min(10)
        .describe("Script or narrative scene breakdown to parse into storyboard panels."),
      visual_style: z
        .enum(["3D Animated", "Charcoal", "Cinematic Photoreal", "Anime"])
        .optional()
        .default("Cinematic Photoreal")
        .describe("Visual style for the storyboard panels."),
    },
    {
      title: "Storyboard Studio Script Parser",
      readOnlyHint: true,
      idempotentHint: true,
    },
    async ({ script, visual_style }) => {
      const panels = FlowDriver.createStoryboardPanels(script, visual_style);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                style: visual_style,
                totalPanels: panels.length,
                panels,
                guidance:
                  "Use each panel's prompt with 'google_flow_generate_video' or 'google_flow_generate_image' to produce your multi-shot sequence.",
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // 3. Character Rig & Consistency Builder
  server.tool(
    "google_flow_manage_character",
    "Generates a standardized 5-angle Character Rig blueprint (Front, Side Profile, 3/4 View, Expression Sheet, Dynamic Action Pose) with clean background segmentation prompts to enforce character consistency across shots.",
    {
      character_name: z
        .string()
        .describe("Name identifier for the character (used as @CharacterName in prompts)."),
      physical_description: z
        .string()
        .describe("Detailed physical traits (age, hair, facial features, build, distinguishing marks)."),
      wardrobe: z
        .string()
        .describe("Standard clothing, materials, colors, and accessories worn by the character."),
    },
    {
      title: "Character Rig & Consistency Builder",
      readOnlyHint: true,
      idempotentHint: true,
    },
    async ({ character_name, physical_description, wardrobe }) => {
      const rig = FlowDriver.buildCharacterRig(character_name, physical_description, wardrobe);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                characterTag: `@${character_name}`,
                characterRig: rig,
                recommendedWorkflow: [
                  "1. Generate each of the 5 rig angles using 'google_flow_generate_image' with model 'nano-banana-pro'.",
                  "2. Save the generated images to your Google Flow asset library.",
                  "3. Reference the character in video prompts using @" + character_name + " with Veo 3.1 Fast (8s) or Gemini Omni Flash.",
                ],
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // 4. Credit Estimation and Peak Hours Advisory
  server.tool(
    "google_flow_estimate_credits",
    "Calculates required credit consumption for a planned generation or production run, accounts for subscription tiers (Free, Plus, Pro, Ultra), and advises on Google Flow peak hours (2 AM - 5 AM UTC).",
    {
      model: z
        .enum([
          "veo-3.1-quality",
          "veo-3.1-fast",
          "veo-3.1-lite",
          "gemini-omni-flash-720p",
          "gemini-omni-flash-360p",
          "video-edit",
          "nano-banana-pro",
          "nano-banana-2",
          "nano-banana-2-lite",
          "upscale-4k",
        ])
        .describe("Target model or task."),
      duration_seconds: z
        .union([z.literal(4), z.literal(6), z.literal(8), z.literal(10)])
        .optional()
        .default(8)
        .describe("Clip duration in seconds."),
      shot_count: z
        .number()
        .optional()
        .default(1)
        .describe("Number of shots to generate."),
    },
    {
      title: "Estimate Credits & Peak Hours Advisory",
      readOnlyHint: true,
      idempotentHint: true,
    },
    async ({ model, duration_seconds, shot_count }) => {
      const est = FlowDriver.calculateCredits(model as any, duration_seconds as any);
      const totalBase = est.baseCredits * shot_count;
      const totalUltra = est.ultraCredits * shot_count;
      const iterationBuffer = Math.round(totalBase * 0.25);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                model,
                durationSeconds: duration_seconds,
                shotCount: shot_count,
                perShotCredits: {
                  standardTiers: est.baseCredits,
                  ultraTier: est.ultraCredits,
                },
                totalProjectCredits: {
                  standardTiers: totalBase,
                  ultraTier: totalUltra,
                  recommendedWith25PercentIterationBuffer: totalBase + iterationBuffer,
                },
                peakHourAdvisory: {
                  isCurrentlyPeakHour: est.isPeakHour,
                  window: "2:00 AM - 5:00 AM UTC",
                  impact: est.isPeakHour
                    ? "Peak hours active: non-subscribers may face queue limits."
                    : "Off-peak hours: normal generation speed.",
                },
                notes: est.notes,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );
}
