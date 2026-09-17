import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CAMERA_PRESETS } from "./camera-controls.js";
import { BrowserManager } from "../core/browser-manager.js";
import { FlowDriver } from "../core/flow-driver.js";
import { AntiBanGuardrails } from "../core/anti-ban-guardrails.js";
import { config } from "../config.js";

const MODEL_CATALOG = [
  {
    id: "model:veo-3.1-quality",
    name: "Veo 3.1 Quality",
    type: "video",
    cost: "100 credits",
    duration: "8s native",
    description: "Google's flagship cinematic video generation model with premier temporal consistency, photoreal lighting, and synchronized audio.",
  },
  {
    id: "model:veo-3.1-fast",
    name: "Veo 3.1 Fast",
    type: "video",
    cost: "20 credits (standard), 10 credits (short)",
    duration: "4s - 8s",
    description: "Rapid turnaround production model for iterating video prompts and multi-shot storyboards.",
  },
  {
    id: "model:veo-3.1-lite",
    name: "Veo 3.1 Lite",
    type: "video",
    cost: "10 credits (standard), 5 credits (short)",
    duration: "4s - 8s",
    description: "Ultra-lean iteration model supporting first-frame and last-frame clip extensions.",
  },
  {
    id: "model:gemini-omni-flash-720p",
    name: "Gemini Omni Flash (720p)",
    type: "video",
    cost: "Free / Minimal credits",
    duration: "4s - 10s",
    description: "High-speed multimodal video engine with synchronized voice generation and narrative action.",
  },
  {
    id: "model:nano-banana-pro",
    name: "Nano Banana Pro (Imagen 3)",
    type: "image",
    cost: "Standard image credits",
    duration: "Instant",
    description: "State-of-the-art cinematic still generation, 8k resolution character rigs, and reference frames.",
  },
];

export function registerSearchFetchTools(server: McpServer): void {
  // 1. Unified Search Tool (Compliant with ChatGPT Connectors & Deep Research)
  const searchHandler = async ({ query, category }: { query: string; category?: string }) => {
    const q = query.toLowerCase().trim();
    const results: Array<{ id: string; title: string; category: string; snippet: string }> = [];

    // Search Models
    if (!category || category === "all" || category === "models") {
      for (const m of MODEL_CATALOG) {
        if (m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q) || m.id.toLowerCase().includes(q)) {
          results.push({
            id: m.id,
            title: m.name,
            category: "model",
            snippet: `${m.description} [Cost: ${m.cost}, Native Duration: ${m.duration}]`,
          });
        }
      }
    }

    // Search Camera Presets
    if (!category || category === "all" || category === "presets") {
      for (const [key, preset] of Object.entries(CAMERA_PRESETS)) {
        if (
          key.toLowerCase().includes(q) ||
          preset.motion.toLowerCase().includes(q) ||
          preset.description.toLowerCase().includes(q)
        ) {
          results.push({
            id: `camera:${key}`,
            title: `Camera Preset: ${key.replace("_", " ").toUpperCase()}`,
            category: "camera_preset",
            snippet: `${preset.motion} (${preset.focalLength}): ${preset.description}`,
          });
        }
      }
    }

    // Search Online Projects if connected
    if (!category || category === "all" || category === "projects") {
      try {
        if (await BrowserManager.isConnected()) {
          const page = await BrowserManager.getFlowPage();
          const projects = await FlowDriver.listProjects(page);
          for (const proj of projects) {
            if (proj.title.toLowerCase().includes(q) || proj.id.toLowerCase().includes(q)) {
              results.push({
                id: `project:${proj.id}`,
                title: `Project: ${proj.title}`,
                category: "project",
                snippet: `Google Flow project '${proj.title}' (last modified: ${proj.updatedAt || "recent"})`,
              });
            }
          }
        }
      } catch {
        // Non-blocking browser inspection
      }
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              query,
              category: category || "all",
              totalMatches: results.length,
              results,
            },
            null,
            2
          ),
        },
      ],
    };
  };

  server.tool(
    "google_flow_search",
    "Searches Google Flow models, camera presets, prompt styles, and saved storyboard projects. Full ChatGPT Connector & Deep Research search compliance.",
    {
      query: z.string().min(1).describe("Search query, keyword, or asset name"),
      category: z
        .enum(["all", "models", "presets", "projects"])
        .optional()
        .default("all")
        .describe("Category filter for search results"),
    },
    {
      title: "Search Google Flow Knowledge & Assets",
      readOnlyHint: true,
      openWorldHint: true,
    },
    searchHandler
  );

  // Expose universal 'search' alias for ChatGPT Connectors
  server.tool(
    "search",
    "Universal search across Google Flow studio tools, camera movements, Veo models, and video projects for ChatGPT Deep Research and Connectors.",
    {
      query: z.string().min(1).describe("Search term or query"),
      category: z.string().optional().describe("Optional search filter"),
    },
    {
      title: "Universal Search (ChatGPT Connector)",
      readOnlyHint: true,
      openWorldHint: true,
    },
    async ({ query, category }) => searchHandler({ query, category: category as any })
  );

  // 2. Unified Fetch Tool (Compliant with ChatGPT Connectors & Deep Research)
  const fetchHandler = async ({ id }: { id: string }) => {
    const trimmedId = id.trim();

    // Fetch Camera Preset
    if (trimmedId.startsWith("camera:")) {
      const key = trimmedId.replace("camera:", "");
      const preset = CAMERA_PRESETS[key];
      if (preset) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ id: trimmedId, category: "camera_preset", ...preset }, null, 2),
            },
          ],
        };
      }
    }

    // Fetch Model
    if (trimmedId.startsWith("model:")) {
      const model = MODEL_CATALOG.find((m) => m.id === trimmedId);
      if (model) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ ...model, id: trimmedId }, null, 2),
            },
          ],
        };
      }
    }

    // Fetch Session Status
    if (trimmedId === "status:session" || trimmedId === "session") {
      const guardrails = AntiBanGuardrails.getStatus();
      const connected = await BrowserManager.isConnected();
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                id: trimmedId,
                browserConnected: connected,
                guardrails,
                cdpPort: config.cdpPort,
                flowUrl: config.flowUrl,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            id: trimmedId,
            found: false,
            message: `Resource '${trimmedId}' not found. Valid prefixes: 'camera:<preset>', 'model:<id>', 'status:session'.`,
          }),
        },
      ],
      isError: true,
    };
  };

  server.tool(
    "google_flow_fetch",
    "Fetches detailed specifications or data for a specific Google Flow resource ID. Full ChatGPT Connector & Deep Research fetch compliance.",
    {
      id: z.string().min(1).describe("The resource identifier to fetch (e.g. 'camera:dolly_in', 'model:veo-3.1-quality', 'status:session')"),
    },
    {
      title: "Fetch Google Flow Resource",
      readOnlyHint: true,
      openWorldHint: true,
    },
    fetchHandler
  );

  // Expose universal 'fetch' alias for ChatGPT Connectors
  server.tool(
    "fetch",
    "Universal fetch for specific Google Flow asset, camera preset, model spec, or project details by ID for ChatGPT Deep Research and Connectors.",
    {
      id: z.string().min(1).describe("Resource identifier to fetch"),
    },
    {
      title: "Universal Fetch (ChatGPT Connector)",
      readOnlyHint: true,
      openWorldHint: true,
    },
    fetchHandler
  );
}
