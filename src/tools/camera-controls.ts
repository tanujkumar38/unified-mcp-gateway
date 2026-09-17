import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export const CAMERA_PRESETS: Record<
  string,
  { motion: string; focalLength: string; description: string; samplePrompt: string }
> = {
  dolly_in: {
    motion: "Slow dolly forward closing distance to the subject",
    focalLength: "50mm prime",
    description: "Moves the physical camera closer to the subject, heightening intimacy or suspense.",
    samplePrompt: "Camera dollies forward smoothly from medium shot into a tight emotional close-up.",
  },
  dolly_out: {
    motion: "Slow dolly backward revealing the broader surroundings",
    focalLength: "35mm anamorphic",
    description: "Pulls the camera back to unveil scale, isolation, or narrative context.",
    samplePrompt: "Camera dollies backward smoothly from subject into an expansive wide environment.",
  },
  crane_up: {
    motion: "Pedestal / crane shot elevating smoothly from ground level to high perspective",
    focalLength: "24mm wide angle",
    description: "Ascends vertically to show vast landscape or architectural scope.",
    samplePrompt: "Camera cranes upward vertically revealing a bustling futuristic metropolis.",
  },
  pan_horizontal: {
    motion: "Smooth horizontal pan from left to right following action",
    focalLength: "40mm cine lens",
    description: "Rotates camera horizontally on a fixed axis to survey a scene.",
    samplePrompt: "Smooth cinematic pan sweeping across the ancient ruins under sunset glow.",
  },
  orbit_360: {
    motion: "Continuous 360-degree rotational orbit around central focal point",
    focalLength: "85mm portrait lens",
    description: "Circles the subject completely while maintaining focus, creating heroic or disorienting effect.",
    samplePrompt: "Camera orbits smoothly in a 360-degree circle around the central character standing in rainfall.",
  },
  fpv_drone: {
    motion: "Dynamic high-speed FPV drone dive and swoop through tight spaces",
    focalLength: "18mm ultra-wide",
    description: "Energetic, fast-paced acrobatic flight path.",
    samplePrompt: "Fast FPV drone shot swooping through misty canyon crevices matching subject speed.",
  },
};

export function registerCameraTools(server: McpServer): void {
  server.tool(
    "google_flow_control_camera",
    "Generates or configures calibrated cinematic camera motion directives and lens specifications for Veo 3.1 prompts in Google Flow.",
    {
      preset: z
        .enum([
          "dolly_in",
          "dolly_out",
          "crane_up",
          "pan_horizontal",
          "orbit_360",
          "fpv_drone",
        ])
        .describe("The cinematic camera movement preset to apply"),
      speed: z
        .enum(["slow", "moderate", "fast"])
        .optional()
        .default("moderate")
        .describe("Movement velocity"),
      lens_focal_length: z
        .string()
        .optional()
        .describe("Custom focal length or lens type (e.g. '85mm anamorphic', '24mm wide')"),
    },
    {
      title: "Configure Camera Motion Directive",
      readOnlyHint: true,
      idempotentHint: true,
    },
    async ({ preset, speed, lens_focal_length }) => {
      const data = CAMERA_PRESETS[preset];
      const focal = lens_focal_length || data.focalLength;
      const formattedMotion = `${speed.toUpperCase()} ${data.motion} shot on ${focal}`;

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                preset,
                speed,
                focalLength: focal,
                cameraDirective: formattedMotion,
                description: data.description,
                suggestedIntegration: `Append to your prompt: ", cinematic camera movement: ${formattedMotion}"`,
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
