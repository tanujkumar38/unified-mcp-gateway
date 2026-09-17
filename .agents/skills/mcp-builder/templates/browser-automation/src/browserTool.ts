/**
 * Resilient Browser Automation Tool Handler
 * 
 * Uses Puppeteer/Playwright for websites requiring JavaScript execution,
 * dynamic single-page interactions, or complex UI clicks.
 */

import puppeteer, { Browser, Page } from "puppeteer";

export interface BrowserAction {
  type: "navigate" | "click" | "type" | "wait_for_selector" | "extract_text" | "screenshot";
  selector?: string;
  value?: string;
}

export interface AutomationResult {
  success: boolean;
  extractedText?: string;
  screenshotBase64?: string;
  currentUrl: string;
  error?: string;
}

export async function executeBrowserWorkflow(
  initialUrl: string,
  actions: BrowserAction[]
): Promise<AutomationResult> {
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    console.error("[BROWSER TOOL] Launching headless browser instance...");
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
      ],
    });

    page = await browser.newPage();
    
    // Set a modern desktop viewport and realistic User-Agent to avoid immediate bot detection
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    );

    console.error(`[BROWSER TOOL] Navigating to ${initialUrl}...`);
    await page.goto(initialUrl, { waitUntil: "networkidle2", timeout: 30000 });

    let extractedContent = "";

    for (const [index, action] of actions.entries()) {
      console.error(`[BROWSER TOOL] Executing step ${index + 1}: ${action.type}`);

      switch (action.type) {
        case "navigate":
          if (action.value) {
            await page.goto(action.value, { waitUntil: "networkidle2", timeout: 30000 });
          }
          break;

        case "wait_for_selector":
          if (action.selector) {
            await page.waitForSelector(action.selector, { timeout: 15000 });
          }
          break;

        case "click":
          if (action.selector) {
            await page.waitForSelector(action.selector, { timeout: 10000 });
            await page.click(action.selector);
          }
          break;

        case "type":
          if (action.selector && action.value) {
            await page.waitForSelector(action.selector, { timeout: 10000 });
            await page.type(action.selector, action.value, { delay: 50 });
          }
          break;

        case "extract_text":
          if (action.selector) {
            await page.waitForSelector(action.selector, { timeout: 10000 });
            const text = await page.$eval(action.selector, (el) => el.textContent || "");
            extractedContent += (extractedContent ? "\n" : "") + text.trim();
          } else {
            // Default to extracting body text
            const fullBodyText = await page.$eval("body", (el) => (el as HTMLElement).innerText);
            extractedContent = fullBodyText.substring(0, 8000); // Limit length
          }
          break;

        case "screenshot":
          // Captures page screenshot as base64
          const screenshotBuffer = await page.screenshot({ encoding: "base64", fullPage: false });
          return {
            success: true,
            currentUrl: page.url(),
            extractedText: extractedContent,
            screenshotBase64: screenshotBuffer as string,
          };
      }
    }

    return {
      success: true,
      currentUrl: page.url(),
      extractedText: extractedContent,
    };
  } catch (error: any) {
    console.error("[BROWSER TOOL ERROR]", error);
    return {
      success: false,
      currentUrl: page ? page.url() : initialUrl,
      error: error.message,
    };
  } finally {
    // CRITICAL: Always shut down the browser process to prevent zombie Chrome memory leaks
    if (browser) {
      console.error("[BROWSER TOOL] Closing browser instance...");
      await browser.close().catch(() => {});
    }
  }
}
