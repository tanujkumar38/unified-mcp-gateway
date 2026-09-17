import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { BrowserManager } from "../core/browser-manager.js";
import { FlowDriver } from "../core/flow-driver.js";

export function registerExportTools(server: McpServer): void {
  // 1. Poll Generation Status
  server.tool(
    "google_flow_poll_generation",
    "Polls the active video rendering progress on flow.google, retrieving progress percentage, completion status, or direct stream video URLs.",
    {},
    {
      title: "Poll Video Generation Status",
      readOnlyHint: true,
    },
    async () => {
      try {
        const page = await BrowserManager.getFlowPage();
        const status = await FlowDriver.pollStatus(page);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(status, null, 2),
            },
          ],
        };
      } catch (err: any) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to poll generation status: ${err.message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // 2. Export / Retrieve Rendered Video
  server.tool(
    "google_flow_export_video",
    "Retrieves the playable video source URL and metadata of the most recent completed video render on flow.google.",
    {},
    {
      title: "Export Rendered Video",
      readOnlyHint: true,
      openWorldHint: true,
    },
    async () => {
      try {
        const page = await BrowserManager.getFlowPage();
        const status = await FlowDriver.pollStatus(page);

        if (status.status !== "completed" || !status.videoUrl) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  exported: false,
                  currentStatus: status.status,
                  message:
                    "No completed video render detected yet. Call 'google_flow_poll_generation' until status is completed.",
                }),
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  exported: true,
                  videoUrl: status.videoUrl,
                  pageUrl: page.url(),
                  timestamp: new Date().toISOString(),
                  instructions:
                    "You can open the videoUrl directly in your browser or use curl/ffmpeg to save the MP4 locally.",
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
              text: `Export failed: ${err.message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // 3. Extend Existing Clip
  server.tool(
    "google_flow_extend_clip",
    "Generates a seamless narrative continuation for an existing video clip in Google Flow using first-frame / last-frame continuity.",
    {
      continuation_prompt: z
        .string()
        .min(3)
        .describe("Description of what happens next in the scene"),
      camera_motion: z
        .string()
        .optional()
        .describe("Subsequent camera motion to continue from the last frame"),
      dry_run: z
        .boolean()
        .optional()
        .default(false)
        .describe("If true, validates extension prompt without consuming credits."),
    },
    {
      title: "Extend Existing Video Clip",
      openWorldHint: true,
      destructiveHint: false,
    },
    async ({ continuation_prompt, camera_motion, dry_run }) => {
      try {
        const fullPrompt = camera_motion
          ? `${continuation_prompt}, continuous camera movement: ${camera_motion}`
          : continuation_prompt;

        if (dry_run) {
          const result = await FlowDriver.generateVideo({} as any, {
            prompt: `Scene continuation: ${fullPrompt}`,
            model: "veo-3.1-lite",
            dryRun: true,
          });

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "dry_run_validated",
                    prompt: fullPrompt,
                    creditEstimate: result.creditEstimate,
                    message: "[DRY-RUN] Extension prompt validated against Veo Lite continuity rules.",
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        const page = await BrowserManager.getFlowPage();
        const result = await FlowDriver.generateVideo(page, {
          prompt: `Scene continuation: ${fullPrompt}`,
          dryRun: false,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  status: "extension_submitted",
                  jobId: result.jobId,
                  prompt: fullPrompt,
                  message: "Clip extension submitted. Veo will blend from the previous clip's endpoint.",
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
              text: `Failed to extend clip: ${err.message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
