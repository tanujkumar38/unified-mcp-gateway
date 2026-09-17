import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createMcpServer } from "../src/index.js";

describe("Google Flow Professional Full 15 MCP Tools Client Test Suite", () => {
  let client: Client;
  let server: ReturnType<typeof createMcpServer>;

  const EXPECTED_TOOLS = [
    "google_flow_get_status",
    "google_flow_launch_chrome",
    "google_flow_list_projects",
    "google_flow_create_project",
    "google_flow_generate_video",
    "google_flow_poll_generation",
    "google_flow_edit_video",
    "google_flow_extend_clip",
    "google_flow_generate_image",
    "google_flow_control_camera",
    "google_flow_export_video",
    "google_flow_estimate_credits",
    "google_flow_manage_character",
    "google_flow_storyboard_studio",
    "google_flow_scenebuilder",
  ];

  beforeAll(async () => {
    server = createMcpServer();
    client = new Client(
      {
        name: "test-mcp-client",
        version: "1.0.0",
      },
      {
        capabilities: {},
      }
    );

    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    await client.connect(clientTransport);
  });

  afterAll(async () => {
    await client.close();
    await server.close();
  });

  it("lists all 15 registered Google Flow MCP tools", async () => {
    const toolsResponse = await client.listTools();
    const registeredToolNames = toolsResponse.tools.map((t) => t.name);

    expect(registeredToolNames.length).toBeGreaterThanOrEqual(15);
    for (const expected of EXPECTED_TOOLS) {
      expect(registeredToolNames).toContain(expected);
    }
    // Also verify cross-platform ChatGPT Connectors search & fetch tools
    expect(registeredToolNames).toContain("google_flow_search");
    expect(registeredToolNames).toContain("google_flow_fetch");
    expect(registeredToolNames).toContain("search");
    expect(registeredToolNames).toContain("fetch");
  });

  it("lists MCP resources and prompts", async () => {
    const resourcesResponse = await client.listResources();
    expect(resourcesResponse.resources).toBeDefined();
    expect(resourcesResponse.resources.length).toBeGreaterThan(0);

    const promptsResponse = await client.listPrompts();
    expect(promptsResponse.prompts).toBeDefined();
    expect(promptsResponse.prompts.length).toBeGreaterThan(0);
  });

  // Tool 1: google_flow_get_status
  it("Tool 1: google_flow_get_status returns valid status schema", async () => {
    const result = await client.callTool({
      name: "google_flow_get_status",
      arguments: {},
    });

    expect(result.content).toBeDefined();
    const parsed = JSON.parse((result.content[0] as any).text);
    expect(parsed).toHaveProperty("browserConnected");
    expect(parsed).toHaveProperty("guardrails");
    expect(parsed.guardrails).toHaveProperty("circuitBreaker");
  });

  // Tool 2: google_flow_estimate_credits
  it("Tool 2: google_flow_estimate_credits accurately calculates credit economics", async () => {
    const result = await client.callTool({
      name: "google_flow_estimate_credits",
      arguments: {
        model: "veo-3.1-quality",
        duration_seconds: 8,
        shot_count: 2,
      },
    });

    const parsed = JSON.parse((result.content[0] as any).text);
    expect(parsed.model).toBe("veo-3.1-quality");
    expect(parsed.totalProjectCredits.standardTiers).toBe(200);
    expect(parsed.peakHourAdvisory).toBeDefined();
  });

  // Tool 3: google_flow_generate_video (Veo Quality dryRun)
  it("Tool 3: google_flow_generate_video executes dry-run validation for Veo Quality", async () => {
    const result = await client.callTool({
      name: "google_flow_generate_video",
      arguments: {
        prompt: "Cinematic establishing shot of Neo-Kyoto in heavy rain",
        model: "veo-3.1-quality",
        duration_seconds: 8,
        aspect_ratio: "2.39:1",
        dry_run: true,
      },
    });

    const parsed = JSON.parse((result.content[0] as any).text);
    expect(parsed.success).toBe(true);
    expect(parsed.status).toBe("dry_run_validated");
    expect(parsed.model).toBe("veo-3.1-quality");
    expect(parsed.creditEstimate.baseCredits).toBe(100);
  });

  // Tool 4: google_flow_generate_video (Veo Fast with ingredients dryRun)
  it("Tool 4: google_flow_generate_video validates Veo Fast with ingredients", async () => {
    const result = await client.callTool({
      name: "google_flow_generate_video",
      arguments: {
        prompt: "walking calmly through neon marketplace",
        model: "veo-3.1-fast",
        duration_seconds: 6,
        ingredients: ["@ElenaVance"],
        style_preset: "35mm anamorphic film",
        dry_run: true,
      },
    });

    const parsed = JSON.parse((result.content[0] as any).text);
    expect(parsed.success).toBe(true);
    expect(parsed.promptPreview).toContain("@ElenaVance");
    expect(parsed.promptPreview).toContain("35mm anamorphic film");
  });

  // Tool 5: google_flow_generate_image (Nano Banana Pro dryRun)
  it("Tool 5: google_flow_generate_image validates dry-run for Nano Banana Pro", async () => {
    const result = await client.callTool({
      name: "google_flow_generate_image",
      arguments: {
        prompt: "Elena Vance front portrait in cyberpunk trench coat",
        model: "nano-banana-pro",
        aspect_ratio: "1:1",
        upscale_4k: true,
        dry_run: true,
      },
    });

    const parsed = JSON.parse((result.content[0] as any).text);
    expect(parsed.success).toBe(true);
    expect(parsed.status).toBe("dry_run_validated");
    expect(parsed.creditCost).toBe(55); // 5 base + 50 4k upscale
  });

  // Tool 6: google_flow_generate_image (Nano Banana 2 Lite zero-credit)
  it("Tool 6: google_flow_generate_image validates zero-credit tier for Nano Banana 2 Lite", async () => {
    const result = await client.callTool({
      name: "google_flow_generate_image",
      arguments: {
        prompt: "Quick concept sketch of futuristic drone",
        model: "nano-banana-2-lite",
        aspect_ratio: "16:9",
        dry_run: true,
      },
    });

    const parsed = JSON.parse((result.content[0] as any).text);
    expect(parsed.success).toBe(true);
    expect(parsed.creditCost).toBe(0);
  });

  // Tool 7: google_flow_control_camera
  it("Tool 7: google_flow_control_camera formats camera directives", async () => {
    const result = await client.callTool({
      name: "google_flow_control_camera",
      arguments: {
        preset: "dolly_in",
        speed: "slow",
        lens_focal_length: "50mm prime",
      },
    });

    const parsed = JSON.parse((result.content[0] as any).text);
    expect(parsed.preset).toBe("dolly_in");
    expect(parsed.cameraDirective).toBe("SLOW Slow dolly forward closing distance to the subject shot on 50mm prime");
    expect(parsed.suggestedIntegration).toContain("cinematic camera movement");
  });

  // Tool 8: google_flow_manage_character
  it("Tool 8: google_flow_manage_character generates complete 5-angle Character Rig", async () => {
    const result = await client.callTool({
      name: "google_flow_manage_character",
      arguments: {
        character_name: "ElenaVance",
        physical_description: "32yo cyber detective with silver-streaked bob haircut",
        wardrobe: "Matte-black weatherproof trench coat",
      },
    });

    const parsed = JSON.parse((result.content[0] as any).text);
    expect(parsed.characterTag).toBe("@ElenaVance");
    expect(parsed.characterRig.frontView).toBeDefined();
    expect(parsed.characterRig.sideProfile).toBeDefined();
    expect(parsed.characterRig.threeQuarterView).toBeDefined();
    expect(parsed.characterRig.expressionSheet).toBeDefined();
    expect(parsed.characterRig.actionPose).toBeDefined();
  });

  // Tool 9: google_flow_storyboard_studio
  it("Tool 9: google_flow_storyboard_studio parses scene script into panels", async () => {
    const result = await client.callTool({
      name: "google_flow_storyboard_studio",
      arguments: {
        script: "A detective approaches a glowing server rack. She plugs in an encrypted drive. Red alert sirens suddenly trigger.",
        visual_style: "Cinematic Photoreal",
      },
    });

    const parsed = JSON.parse((result.content[0] as any).text);
    expect(parsed.totalPanels).toBe(3);
    expect(parsed.panels[0].prompt).toContain("detective approaches");
    expect(parsed.panels[2].prompt).toContain("Red alert");
  });

  // Tool 10: google_flow_scenebuilder
  it("Tool 10: google_flow_scenebuilder validates timeline sequence assembly", async () => {
    const result = await client.callTool({
      name: "google_flow_scenebuilder",
      arguments: {
        clip_ids: ["shot_001_intro", "shot_002_confrontation", "shot_003_climax"],
        transition_type: "cross_dissolve",
        dry_run: true,
      },
    });

    const parsed = JSON.parse((result.content[0] as any).text);
    expect(parsed.success).toBe(true);
    expect(parsed.status).toBe("dry_run_validated");
    expect(parsed.clipCount).toBe(3);
    expect(parsed.transition).toBe("cross_dissolve");
  });

  // Tool 11: google_flow_extend_clip
  it("Tool 11: google_flow_extend_clip validates narrative extension dry-run", async () => {
    const result = await client.callTool({
      name: "google_flow_extend_clip",
      arguments: {
        continuation_prompt: "The detective turns around hearing a footsteps echo behind her",
        camera_motion: "rapid 180 whip pan",
        dry_run: true,
      },
    });

    const parsed = JSON.parse((result.content[0] as any).text);
    expect(parsed.status).toBe("dry_run_validated");
    expect(parsed.prompt).toContain("rapid 180 whip pan");
    expect(parsed.creditEstimate.baseCredits).toBe(10); // Veo Lite base
  });

  // Tool 12: google_flow_edit_video
  it("Tool 12: google_flow_edit_video validates conversational video-to-video edit", async () => {
    const result = await client.callTool({
      name: "google_flow_edit_video",
      arguments: {
        instruction: "Change daytime lighting to moody twilight with neon puddles",
        segment_duration_seconds: 8,
        dry_run: true,
      },
    });

    const parsed = JSON.parse((result.content[0] as any).text);
    expect(parsed.success).toBe(true);
    expect(parsed.instruction).toContain("Change daytime lighting to moody twilight");
  });

  // Tool 13: google_flow_poll_generation (safe error / status handling)
  it("Tool 13: google_flow_poll_generation handles live status queries cleanly", async () => {
    const result = await client.callTool({
      name: "google_flow_poll_generation",
      arguments: {},
    });

    expect(result.content).toBeDefined();
    // Result should be either valid status or structured connection feedback
    expect(result.content[0]).toHaveProperty("text");
  });

  // Tool 14: google_flow_export_video (safe query handling)
  it("Tool 14: google_flow_export_video handles export queries cleanly", async () => {
    const result = await client.callTool({
      name: "google_flow_export_video",
      arguments: {},
    });

    expect(result.content).toBeDefined();
    expect(result.content[0]).toHaveProperty("text");
  });

  // Tool 15: google_flow_list_projects & google_flow_create_project
  it("Tool 15: google_flow_list_projects and create_project handle browser calls cleanly", async () => {
    const listResult = await client.callTool({
      name: "google_flow_list_projects",
      arguments: {},
    });
    expect(listResult.content).toBeDefined();

    const createResult = await client.callTool({
      name: "google_flow_create_project",
      arguments: {
        title: "Test Reel",
      },
    });
    expect(createResult.content).toBeDefined();
  });
});
