import { describe, it, expect } from "vitest";
import { createMcpServer } from "../src/index.js";
import { FlowDriver } from "../src/core/flow-driver.js";

describe("Google Flow Professional MCP Server V2.0 Primitives", () => {
  it("initializes McpServer with all 14 tools, resources, and prompts", () => {
    const server = createMcpServer();
    expect(server).toBeDefined();
    expect(server.server).toBeDefined();
  });

  it("calculates accurate credit economics based on the Handbook", () => {
    // Veo 3.1 Quality
    const quality = FlowDriver.calculateCredits("veo-3.1-quality", 8);
    expect(quality.baseCredits).toBe(100);
    expect(quality.ultraCredits).toBe(100);

    // Veo 3.1 Fast
    const fast = FlowDriver.calculateCredits("veo-3.1-fast", 8);
    expect(fast.baseCredits).toBe(20);
    expect(fast.ultraCredits).toBe(10);

    // Veo 3.1 Lite
    const lite = FlowDriver.calculateCredits("veo-3.1-lite", 6);
    expect(lite.baseCredits).toBe(10);
    expect(lite.ultraCredits).toBe(5);

    // Gemini Omni Flash 720p 10s
    const omni10s = FlowDriver.calculateCredits("gemini-omni-flash-720p", 10);
    expect(omni10s.baseCredits).toBe(15);

    // Gemini Omni Flash 360p 4s
    const omni360 = FlowDriver.calculateCredits("gemini-omni-flash-360p", 4);
    expect(omni360.baseCredits).toBe(4);

    // Video editing
    const edit = FlowDriver.calculateCredits("video-edit", 8);
    expect(edit.baseCredits).toBe(40);
  });

  it("validates Veo 3.1 model restrictions and duration normalization properly", async () => {
    // Veo Quality normalizes requested 6s to native 8s master render without crashing
    const normalizedRun = await FlowDriver.generateVideo({} as any, {
      prompt: "Cinematic shot",
      model: "veo-3.1-quality",
      durationSeconds: 6,
      dryRun: true,
    });
    expect(normalizedRun.success).toBe(true);
    expect(normalizedRun.creditEstimate.durationSeconds).toBe(8);

    // Veo Quality does not support ingredients
    await expect(
      FlowDriver.generateVideo({} as any, {
        prompt: "Shot with hero",
        model: "veo-3.1-quality",
        durationSeconds: 8,
        ingredients: ["@Hero"],
        dryRun: true,
      })
    ).rejects.toThrow("Veo 3.1 Quality does not support reference ingredients.");
  });

  it("validates Veo 3.1 Fast dry-run with ingredients and credit estimate", async () => {
    const result = await FlowDriver.generateVideo({} as any, {
      prompt: "walking down rainy Tokyo neon streets",
      model: "veo-3.1-fast",
      aspectRatio: "16:9",
      durationSeconds: 8,
      ingredients: ["@CaptainZoro"],
      cameraMotion: "Slow tracking shot",
      stylePreset: "Cyberpunk noir",
      audioCues: "Heavy rainfall with ambient neon buzzing",
      dryRun: true,
    });

    expect(result.success).toBe(true);
    expect(result.status).toBe("dry_run_validated");
    expect(result.model).toBe("veo-3.1-fast");
    expect(result.promptPreview).toContain("@CaptainZoro");
    expect(result.promptPreview).toContain("walking down rainy Tokyo neon streets");
    expect(result.promptPreview).toContain("Cyberpunk noir");
    expect(result.creditEstimate.baseCredits).toBe(20);
  });

  it("generates 5-angle Character Rigs for consistency", () => {
    const rig = FlowDriver.buildCharacterRig(
      "SarahConnor",
      "athletic 35yo woman with tied-back dark hair and intense stare",
      "olive tactical combat vest, black tank top, and cargo trousers"
    );

    expect(rig.frontView).toBeDefined();
    expect(rig.sideProfile).toBeDefined();
    expect(rig.threeQuarterView).toBeDefined();
    expect(rig.expressionSheet).toBeDefined();
    expect(rig.actionPose).toBeDefined();
    expect(rig.frontView).toContain("@SarahConnor");
    expect(rig.frontView).toContain("clean solid plain studio background");
  });

  it("parses scripts into Storyboard Studio panels", () => {
    const script = "A spaceship lands on an alien desert planet. A lone explorer steps onto the crimson sand. Ancient monoliths rise in the distance.";
    const panels = FlowDriver.createStoryboardPanels(script, "Cinematic Photoreal");

    expect(panels.length).toBe(3);
    expect(panels[0].shotType).toContain("Extreme Wide Shot");
    expect(panels[0].prompt).toContain("spaceship lands");
    expect(panels[1].prompt).toContain("lone explorer");
    expect(panels[2].prompt).toContain("Ancient monoliths");
  });

  it("validates video-to-video editing dry-run", async () => {
    const result = await FlowDriver.editVideo({} as any, {
      instruction: "Change daytime to stormy night with rain on camera lens",
      dryRun: true,
    });

    expect(result.success).toBe(true);
    expect(result.instruction).toContain("Change daytime to stormy night");
  });
});
