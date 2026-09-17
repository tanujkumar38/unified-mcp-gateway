import { Page } from "puppeteer-core";
import { config } from "../config.js";
import { logger } from "../utils/logger.js";

export interface CircuitBreakerStatus {
  tripped: boolean;
  reason?: string;
  timestamp?: number;
}

export class AntiBanGuardrails {
  private static lastGenerationTime: number = 0;
  private static circuitBreaker: CircuitBreakerStatus = { tripped: false };
  private static generationCount: number = 0;

  /**
   * Sleep with Gaussian-distributed humanized delay jitter.
   */
  public static async sleepWithJitter(
    minMs = config.humanDelayMinMs,
    maxMs = config.humanDelayMaxMs
  ): Promise<number> {
    // Box-Muller transform for pseudo-Gaussian distribution
    const u = Math.random();
    const v = Math.random();
    const norm = Math.sqrt(-2.0 * Math.log(u || 0.0001)) * Math.cos(2.0 * Math.PI * v);
    const mean = (minMs + maxMs) / 2;
    const stdDev = (maxMs - minMs) / 4;
    const delay = Math.max(minMs, Math.min(maxMs, Math.round(mean + norm * stdDev)));

    logger.debug(`Anti-ban kinetic pause: ${delay}ms`);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return delay;
  }

  /**
   * Verifies velocity governor cooldown. Throws or returns remaining wait time.
   */
  public static checkGenerationCooldown(): { canGenerate: boolean; remainingMs: number } {
    const now = Date.now();
    const elapsed = now - this.lastGenerationTime;
    const cooldown = config.generationCooldownMs;

    if (this.lastGenerationTime > 0 && elapsed < cooldown) {
      const remainingMs = cooldown - elapsed;
      logger.warn(`Velocity governor active: ${remainingMs}ms remaining in generation cooldown`);
      return { canGenerate: false, remainingMs };
    }

    return { canGenerate: true, remainingMs: 0 };
  }

  /**
   * Records a completed generation timestamp and increments counters.
   */
  public static recordGeneration(): void {
    this.lastGenerationTime = Date.now();
    this.generationCount++;
    logger.guardrail(
      `Generation #${this.generationCount} recorded. Cooldown timer set for ${config.generationCooldownMs}ms`
    );
  }

  /**
   * Resets the circuit breaker if manually cleared by the user.
   */
  public static resetCircuitBreaker(): void {
    this.circuitBreaker = { tripped: false };
    logger.guardrail("Circuit breaker manually reset by user");
  }

  /**
   * Gets current circuit breaker and guardrail status.
   */
  public static getStatus() {
    const { canGenerate, remainingMs } = this.checkGenerationCooldown();
    return {
      circuitBreaker: this.circuitBreaker,
      generationCount: this.generationCount,
      lastGenerationTime: this.lastGenerationTime ? new Date(this.lastGenerationTime).toISOString() : null,
      cooldownActive: !canGenerate,
      remainingCooldownMs: remainingMs,
    };
  }

  /**
   * Inspects the active page DOM for security verification challenges, CAPTCHAs, or policy strikes.
   * If detected, TRIPS the circuit breaker immediately to protect the Google account.
   */
  public static async inspectPageForChallenges(page: Page): Promise<boolean> {
    if (this.circuitBreaker.tripped) {
      logger.error(`Operation blocked: Circuit breaker already TRIPPED (${this.circuitBreaker.reason})`);
      return true;
    }

    try {
      const challengeFound = await page.evaluate(() => {
        const bodyText = document.body ? document.body.innerText.toLowerCase() : "";

        // Sign-in challenges
        if (
          bodyText.includes("verify it's you") ||
          bodyText.includes("confirm your recovery phone") ||
          bodyText.includes("unusual traffic from your computer network") ||
          bodyText.includes("our systems have detected unusual traffic") ||
          bodyText.includes("suspicious activity detected")
        ) {
          return "Google Security Challenge or Verification prompt detected";
        }

        // CAPTCHA checks - only trip on active visible challenges, not passive telemetry script tags
        const hasActiveCaptcha = !!document.querySelector(
          'iframe[src*="recaptcha/api2/bframe"], iframe[src*="recaptcha/enterprise/bframe"], .rc-imageselect, iframe[src*="challenges.cloudflare.com"]'
        );
        if (
          hasActiveCaptcha ||
          bodyText.includes("complete the captcha") ||
          bodyText.includes("solve the challenge") ||
          bodyText.includes("select all squares with") ||
          bodyText.includes("select all images with")
        ) {
          return "CAPTCHA Challenge detected on page";
        }

        // Policy strikes
        if (
          bodyText.includes("prompt violates safety guidelines") ||
          bodyText.includes("flagged for policy violation") ||
          bodyText.includes("generation blocked due to policy")
        ) {
          return "Google Labs / Flow Policy Violation warning detected";
        }

        return null;
      });

      if (challengeFound) {
        this.circuitBreaker = {
          tripped: true,
          reason: challengeFound,
          timestamp: Date.now(),
        };
        logger.error(`🚨 ANTI-BAN CIRCUIT BREAKER TRIPPED! Reason: ${challengeFound}`);
        logger.warn(
          "Automated actions are paused. Please inspect your browser window and resolve any verification manually."
        );
        return true;
      }

      return false;
    } catch (err: any) {
      logger.debug("Page challenge scan encountered non-fatal evaluation error:", err.message);
      return false;
    }
  }

  /**
   * Types text into a selector with humanized, variable character intervals and micro-pauses.
   */
  public static async humanType(
    page: Page,
    selector: string,
    text: string
  ): Promise<void> {
    await page.waitForSelector(selector, { visible: true, timeout: 10000 });
    await this.sleepWithJitter(300, 700);

    // Focus element
    await page.focus(selector);
    await this.sleepWithJitter(200, 400);

    // Clear existing content if any
    await page.evaluate((sel) => {
      const el = document.querySelector(sel) as HTMLInputElement | HTMLTextAreaElement;
      if (el) {
        el.value = "";
        el.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }, selector);

    // Fast Natural Chunk Typing: 6-12 characters at a time with random micro-delays
    // Completes 1,000-character prompts in ~2-4 seconds instead of >120s, eliminating tool timeouts
    const chunks = text.match(/.{1,12}/g) || [text];
    for (const chunk of chunks) {
      await page.keyboard.type(chunk, { delay: Math.floor(Math.random() * 12) + 6 });
      await new Promise((r) => setTimeout(r, Math.floor(Math.random() * 35) + 15));
      if (/[.,!?;:\n]/.test(chunk)) {
        await new Promise((r) => setTimeout(r, Math.floor(Math.random() * 80) + 40));
      }
    }

    await this.sleepWithJitter(250, 500);
  }

  /**
   * Smoothly hovers and clicks an element, avoiding synthetic instant jump clicks.
   */
  public static async humanClick(page: Page, selector: string): Promise<void> {
    await page.waitForSelector(selector, { visible: true, timeout: 10000 });
    
    // Natural hover pause
    await page.hover(selector);
    await this.sleepWithJitter(250, 600);

    // Click
    await page.click(selector);
    await this.sleepWithJitter(400, 900);
  }
}
