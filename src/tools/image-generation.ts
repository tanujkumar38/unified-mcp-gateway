import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { BrowserManager } from "../core/browser-manager.js";
import { FlowDriver, FlowImageModel } from "../core/flow-driver.js";

export function registerImageTools(server: McpServer): void {
  // Generate Image Asset via Nano Banana Models
  server.tool(
    "google_flow_generate_image",
    "Generates high-resolution concept art, storyboard frames, character references, or marketing graphics using Google Flow's Nano Banana model family (Nano Banana Pro, Nano Banana 2, Nano Banana 2 Lite).",
    {
      prompt: z
        .string()
        .min(3)
        .describe("Descriptive prompt for the visual concept, character, or environment."),
      model: z
        .enum(["nano-banana-pro", "nano-banana-2", "nano-banana-2-lite"])
        .optional()
        .default("nano-banana-pro")
        .describe(
          "Model variant: 'nano-banana-pro' (up to 4K, superior typography and detail), 'nano-banana-2' (consistent character generation), 'nano-banana-2-lite' (zero credits, ultra-fast up to 1K)."
        ),
      aspect_ratio: z
        .enum(["16:9", "9:16", "1:1"])
        .optional()
        .default("1:1")
        .describe("Aspect ratio for the generated image asset."),
      upscale_4k: z
        .boolean()
        .optional()
        .default(false)
        .describe("Request 4K upscaling (available to AI Ultra subscribers at 50 credits; 1080p to 2K is 0 credits)."),
      dry_run: z
        .boolean()
        .optional()
        .default(false)
        .describe("If true, validates image generation parameters and estimates credit costs without consuming quota."),
    },
    {
      title: "Generate Image Asset (Nano Banana Pro / 2 / 2-Lite)",
      openWorldHint: true,
      destructiveHint: false,
    },
    async ({ prompt, model, aspect_ratio, upscale_4k, dry_run }) => {
      try {
        if (dry_run) {
          const result = await FlowDriver.generateImage(
            {} as any,
            prompt,
            model as FlowImageModel,
            aspect_ratio,
            upscale_4k,
            true
          );

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
        const result = await FlowDriver.generateImage(
          page,
          prompt,
          model as FlowImageModel,
          aspect_ratio,
          upscale_4k,
          false
        );

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
              text: `Image generation failed: ${err.message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
