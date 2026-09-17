import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { BrowserManager } from "../core/browser-manager.js";
import { FlowDriver } from "../core/flow-driver.js";

export function registerVideoEditingTools(server: McpServer): void {
  server.tool(
    "google_flow_edit_video",
    "Performs conversational video-to-video editing on generated or uploaded videos using Gemini Omni Flash. Allows modifying content, changing visual styles, or adjusting objects over 10-second segments (up to 3 refinement turns). Costs 40 credits.",
    {
      instruction: z
        .string()
        .min(3)
        .describe("Conversational editing instruction (e.g. 'Replace the daytime sky with a stormy twilight sky and add neon reflections on the road')."),
      segment_duration_seconds: z
        .number()
        .max(10)
        .optional()
        .default(10)
        .describe("Duration of the segment to edit (up to 10 seconds)."),
      style_reference: z
        .string()
        .optional()
        .describe("Optional style reference image or tag to transfer aesthetics."),
      voice_reference: z
        .string()
        .optional()
        .describe("Optional voice tag (e.g. '@Voice: Sarah') for dialogue voice modification."),
      dry_run: z
        .boolean()
        .optional()
        .default(false)
        .describe("If true, validates edit instructions without consuming credits."),
    },
    {
      title: "Conversational Video-to-Video Edit (Gemini Omni Flash)",
      openWorldHint: true,
      destructiveHint: false,
    },
    async (params) => {
      try {
        if (params.dry_run) {
          const result = await FlowDriver.editVideo({} as any, {
            instruction: params.instruction,
            segmentDurationSeconds: params.segment_duration_seconds,
            styleReference: params.style_reference,
            voiceReference: params.voice_reference,
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
        const result = await FlowDriver.editVideo(page, {
          instruction: params.instruction,
          segmentDurationSeconds: params.segment_duration_seconds,
          styleReference: params.style_reference,
          voiceReference: params.voice_reference,
          dryRun: false,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  ...result,
                  creditCost: 40,
                  model: "gemini-omni-flash",
                  guidance: "Video edit submitted. Track progress via 'google_flow_poll_generation'.",
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
              text: `Video editing failed: ${err.message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
