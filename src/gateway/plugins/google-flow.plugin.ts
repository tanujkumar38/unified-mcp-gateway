import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpPlugin, ToolMetadata } from "../types.js";
import { registerAllTools } from "../../tools/index.js";
import { registerResources } from "../../resources/index.js";
import { registerPrompts } from "../../prompts/index.js";
import { BrowserManager } from "../../core/browser-manager.js";
import { AntiBanGuardrails } from "../../core/anti-ban-guardrails.js";

export class GoogleFlowPlugin implements McpPlugin {
  public readonly id = "google-flow";
  public readonly name = "Google Flow Professional MCP";
  public readonly version = "1.0.0";
  public readonly description = "Zero-Ban No-API Creative Studio for Google Flow (flow.google) with Veo 3.1 & Gemini Omni Flash video generation, Scenebuilder, Storyboard Studio, and Camera Presets.";
  public readonly category = "creative";
  public readonly tags = ["video-generation", "veo-3.1", "imagen-3", "creative-studio", "camera-presets"];

  public register(server: McpServer, _options?: { prefix?: string }): void {
    registerAllTools(server);
    registerResources(server);
    registerPrompts(server);
  }

  public getTools(): ToolMetadata[] {
    return [
      {
        name: "google_flow_get_status",
        originalName: "google_flow_get_status",
        namespacedName: "flow__get_status",
        title: "Get Google Flow Status",
        description: "Inspects the connection status of Google Chrome, active flow.google tab, authentication state, and anti-ban guardrail metrics.",
        pluginId: this.id,
        readOnly: true,
        category: "connection",
      },
      {
        name: "google_flow_launch_chrome",
        originalName: "google_flow_launch_chrome",
        namespacedName: "flow__launch_chrome",
        title: "Launch Authentic Chrome for Google Flow",
        description: "Launches authentic Google Chrome with remote debugging (CDP port 9222) and persistent user profile.",
        pluginId: this.id,
        readOnly: false,
        category: "connection",
      },
      {
        name: "google_flow_list_projects",
        originalName: "google_flow_list_projects",
        namespacedName: "flow__list_projects",
        title: "List Google Flow Projects",
        description: "Retrieves the list of existing projects, storyboards, and video reels from the user's flow.google workspace.",
        pluginId: this.id,
        readOnly: true,
        category: "project-management",
      },
      {
        name: "google_flow_create_project",
        originalName: "google_flow_create_project",
        namespacedName: "flow__create_project",
        title: "Create Google Flow Project",
        description: "Creates a new creative project or scene storyboard on flow.google.",
        pluginId: this.id,
        readOnly: false,
        category: "project-management",
      },
      {
        name: "google_flow_generate_video",
        originalName: "google_flow_generate_video",
        namespacedName: "flow__generate_video",
        title: "Generate Video (Veo 3.1 & Gemini Omni Flash)",
        description: "Generates professional AI video clips using Veo 3.1 (Quality, Fast, Lite) and Gemini Omni Flash with text, frames, and references.",
        pluginId: this.id,
        readOnly: false,
        category: "video-generation",
      },
      {
        name: "google_flow_poll_generation",
        originalName: "google_flow_poll_generation",
        namespacedName: "flow__poll_generation",
        title: "Poll Video Generation Status",
        description: "Polls active video rendering progress on flow.google, retrieving progress percentage, completion status, or video URLs.",
        pluginId: this.id,
        readOnly: true,
        category: "export-tools",
      },
      {
        name: "google_flow_edit_video",
        originalName: "google_flow_edit_video",
        namespacedName: "flow__edit_video",
        title: "Conversational Video Edit",
        description: "Performs conversational video-to-video editing on generated or uploaded videos using Gemini Omni Flash.",
        pluginId: this.id,
        readOnly: false,
        category: "video-editing",
      },
      {
        name: "google_flow_extend_clip",
        originalName: "google_flow_extend_clip",
        namespacedName: "flow__extend_clip",
        title: "Extend Existing Video Clip",
        description: "Generates a seamless narrative continuation for an existing video clip in Google Flow using first/last-frame continuity.",
        pluginId: this.id,
        readOnly: false,
        category: "video-editing",
      },
      {
        name: "google_flow_generate_image",
        originalName: "google_flow_generate_image",
        namespacedName: "flow__generate_image",
        title: "Generate Image Asset (Nano Banana Pro / 2 / 2-Lite)",
        description: "Generates high-resolution concept art, storyboard frames, character references using Nano Banana models.",
        pluginId: this.id,
        readOnly: false,
        category: "image-generation",
      },
      {
        name: "google_flow_control_camera",
        originalName: "google_flow_control_camera",
        namespacedName: "flow__control_camera",
        title: "Configure Camera Motion Directive",
        description: "Generates calibrated cinematic camera motion directives and lens specifications for Veo 3.1 prompts.",
        pluginId: this.id,
        readOnly: true,
        category: "camera-controls",
      },
      {
        name: "google_flow_export_video",
        originalName: "google_flow_export_video",
        namespacedName: "flow__export_video",
        title: "Export Rendered Video",
        description: "Retrieves the playable video source URL and metadata of the most recent completed video render on flow.google.",
        pluginId: this.id,
        readOnly: true,
        category: "export-tools",
      },
      {
        name: "google_flow_estimate_credits",
        originalName: "google_flow_estimate_credits",
        namespacedName: "flow__estimate_credits",
        title: "Estimate Credits & Peak Hours Advisory",
        description: "Calculates required credit consumption for planned generations and advises on Google Flow peak hours.",
        pluginId: this.id,
        readOnly: true,
        category: "studio-tools",
      },
      {
        name: "google_flow_manage_character",
        originalName: "google_flow_manage_character",
        namespacedName: "flow__manage_character",
        title: "Character Rig & Consistency Builder",
        description: "Generates a standardized 5-angle Character Rig blueprint with segmentation prompts for visual consistency.",
        pluginId: this.id,
        readOnly: true,
        category: "studio-tools",
      },
      {
        name: "google_flow_storyboard_studio",
        originalName: "google_flow_storyboard_studio",
        namespacedName: "flow__storyboard_studio",
        title: "Storyboard Studio Script Parser",
        description: "Parses a script or scene synopsis into structured visual storyboard panels with shot types, camera specs, and prompts.",
        pluginId: this.id,
        readOnly: true,
        category: "studio-tools",
      },
      {
        name: "google_flow_scenebuilder",
        originalName: "google_flow_scenebuilder",
        namespacedName: "flow__scenebuilder",
        title: "Scenebuilder Timeline Assembly",
        description: "Assembles, sequences, and trims multiple generated video clips into a continuous multi-shot scene in Google Flow's Scenebuilder timeline.",
        pluginId: this.id,
        readOnly: false,
        category: "studio-tools",
      },
      {
        name: "google_flow_search",
        originalName: "google_flow_search",
        namespacedName: "flow__search",
        title: "Search Google Flow Knowledge & Assets",
        description: "Searches Google Flow models, camera presets, prompt styles, and saved storyboard projects. Full ChatGPT Connector & Deep Research compliance.",
        pluginId: this.id,
        readOnly: true,
        category: "search",
      },
      {
        name: "google_flow_fetch",
        originalName: "google_flow_fetch",
        namespacedName: "flow__fetch",
        title: "Fetch Google Flow Resource",
        description: "Fetches detailed specifications or data for a specific Google Flow resource ID. Full ChatGPT Connector & Deep Research compliance.",
        pluginId: this.id,
        readOnly: true,
        category: "fetch",
      },
    ];
  }

  public async healthCheck(): Promise<{ status: "healthy" | "degraded" | "unhealthy"; message?: string; details?: any }> {
    try {
      const connected = await BrowserManager.isConnected();
      const guardrails = AntiBanGuardrails.getStatus();
      return {
        status: connected ? "healthy" : "degraded",
        message: connected ? "Chrome connected via CDP on port 9222" : "Chrome not currently attached (on-demand launch ready)",
        details: { browserConnected: connected, guardrails },
      };
    } catch (err: any) {
      return {
        status: "unhealthy",
        message: `Health check failed: ${err.message}`,
      };
    }
  }
}
