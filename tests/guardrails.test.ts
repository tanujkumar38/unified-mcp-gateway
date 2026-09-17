import { describe, it, expect } from "vitest";
import { AntiBanGuardrails } from "../src/core/anti-ban-guardrails.js";
import { CAMERA_PRESETS } from "../src/tools/camera-controls.js";

describe("Anti-Ban Guardrails & Kinetic Emulation", () => {
  it("delays within expected Gaussian bounds", async () => {
    const min = 50;
    const max = 150;
    const start = Date.now();
    const delay = await AntiBanGuardrails.sleepWithJitter(min, max);
    const elapsed = Date.now() - start;

    expect(delay).toBeGreaterThanOrEqual(min);
    expect(delay).toBeLessThanOrEqual(max);
    expect(elapsed).toBeGreaterThanOrEqual(min - 10);
  });

  it("manages velocity cooldown and status metrics accurately", () => {
    // Initial status
    const initialStatus = AntiBanGuardrails.getStatus();
    expect(initialStatus.circuitBreaker.tripped).toBe(false);

    // Record generation
    AntiBanGuardrails.recordGeneration();
    const activeCooldown = AntiBanGuardrails.checkGenerationCooldown();
    expect(activeCooldown.canGenerate).toBe(false);
    expect(activeCooldown.remainingMs).toBeGreaterThan(0);

    const postGenStatus = AntiBanGuardrails.getStatus();
    expect(postGenStatus.cooldownActive).toBe(true);
    expect(postGenStatus.generationCount).toBeGreaterThan(0);

    // Reset circuit breaker
    AntiBanGuardrails.resetCircuitBreaker();
    expect(AntiBanGuardrails.getStatus().circuitBreaker.tripped).toBe(false);
  });

  it("contains complete cinematic camera presets for Veo 3.1", () => {
    const expectedPresets = [
      "dolly_in",
      "dolly_out",
      "crane_up",
      "pan_horizontal",
      "orbit_360",
      "fpv_drone",
    ];

    for (const preset of expectedPresets) {
      expect(CAMERA_PRESETS[preset]).toBeDefined();
      expect(CAMERA_PRESETS[preset].motion).toBeTruthy();
      expect(CAMERA_PRESETS[preset].focalLength).toBeTruthy();
      expect(CAMERA_PRESETS[preset].samplePrompt).toBeTruthy();
    }
  });
});
