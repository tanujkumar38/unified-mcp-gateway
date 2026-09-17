import puppeteer, { Browser, Page } from "puppeteer-core";
import { spawn, exec } from "child_process";
import fs from "fs";
import { config } from "../config.js";
import { logger } from "../utils/logger.js";
import { AntiBanGuardrails } from "./anti-ban-guardrails.js";

export class BrowserManager {
  private static browser: Browser | null = null;
  private static activePage: Page | null = null;

  /**
   * Connects to an existing running Chrome instance on remote debugging port (default: 9222).
   */
  public static async connectToExistingChrome(): Promise<Browser> {
    const cdpUrl = `http://127.0.0.1:${config.cdpPort}`;
    logger.info(`Attempting CDP connection to existing Chrome at ${cdpUrl}...`);

    try {
      this.browser = await puppeteer.connect({
        browserURL: cdpUrl,
        defaultViewport: null,
      });

      this.browser.on("disconnected", () => {
        logger.warn("Chrome browser disconnected");
        this.browser = null;
        this.activePage = null;
      });

      logger.info("Successfully connected to authentic Chrome via CDP");
      return this.browser;
    } catch (err: any) {
      logger.warn(`Could not attach to existing Chrome on port ${config.cdpPort}: ${err.message}`);
      throw new Error(
        `Chrome remote debugging not detected on port ${config.cdpPort}. Please launch Chrome with --remote-debugging-port=${config.cdpPort} or call google_flow_launch_chrome.`
      );
    }
  }

  /**
   * Launches authentic Chrome with remote debugging enabled and persistent user data directory.
   */
  public static async launchChromeWithDebugging(): Promise<{ pid: number; cdpUrl: string }> {
    if (!fs.existsSync(config.chromePath)) {
      throw new Error(
        `Google Chrome executable not found at "${config.chromePath}". Please set CHROME_PATH environment variable.`
      );
    }

    if (!fs.existsSync(config.userDataDir)) {
      fs.mkdirSync(config.userDataDir, { recursive: true });
    }

    const args = [
      `--remote-debugging-port=${config.cdpPort}`,
      `--user-data-dir=${config.userDataDir}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-blink-features=AutomationControlled",
      config.flowUrl,
    ];

    logger.info(`Launching Chrome from ${config.chromePath} with CDP port ${config.cdpPort}...`);

    let pid = 0;
    if (process.platform === "win32") {
      const escapedPath = config.chromePath.replace(/'/g, "''");
      const escapedArgs = args.map((a) => a.replace(/'/g, "''")).join("','");
      const psCmd = `powershell -NoProfile -Command "Start-Process '${escapedPath}' -ArgumentList @('${escapedArgs}')"`;
      logger.info("Executing detached Windows daemon launch to decouple from Job Object");
      exec(psCmd, (err) => {
        if (err) logger.warn("Windows daemon spawn notice:", err.message);
      });
    } else {
      const child = spawn(config.chromePath, args, {
        detached: true,
        stdio: "ignore",
      });
      child.unref();
      pid = child.pid || 0;
    }

    // Wait up to 10 seconds for CDP endpoint to become ready
    const cdpUrl = `http://127.0.0.1:${config.cdpPort}/json/version`;
    let ready = false;
    for (let attempt = 0; attempt < 20; attempt++) {
      await new Promise((r) => setTimeout(r, 500));
      try {
        const res = await fetch(cdpUrl);
        if (res.ok) {
          ready = true;
          break;
        }
      } catch {
        // Retry
      }
    }

    if (!ready) {
      throw new Error(
        `Chrome was launched on CDP port ${config.cdpPort}, but the CDP endpoint did not respond within 10 seconds.`
      );
    }

    logger.info(`Chrome successfully verified and listening on CDP port ${config.cdpPort}`);
    return { pid, cdpUrl: `http://127.0.0.1:${config.cdpPort}` };
  }

  /**
   * Ensures a connected browser and returns the active Google Flow tab.
   */
  public static async getFlowPage(): Promise<Page> {
    if (!this.browser || !this.browser.connected) {
      await this.connectToExistingChrome();
    }

    if (!this.browser) {
      throw new Error("Browser instance unavailable");
    }

    const pages = await this.browser.pages();
    
    // Look for existing tab on flow.google
    let flowPage = pages.find((p) => {
      const url = p.url();
      return url.includes("flow.google") || url.includes("labs.google/flow");
    });

    if (!flowPage) {
      logger.info(`No active Google Flow tab found. Navigating to ${config.flowUrl}...`);
      flowPage = pages.length > 0 && pages[0].url() === "about:blank" ? pages[0] : await this.browser.newPage();
      
      // Inject anti-detection evasions
      await flowPage.evaluateOnNewDocument(() => {
        // Mask navigator.webdriver
        Object.defineProperty(navigator, "webdriver", {
          get: () => undefined,
        });

        // Mock chrome.runtime
        if (!(window as any).chrome) {
          (window as any).chrome = { runtime: {} };
        }
      });

      await flowPage.goto(config.flowUrl, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      await AntiBanGuardrails.sleepWithJitter(1500, 3000);
    }

    this.activePage = flowPage;
    return this.activePage;
  }

  /**
   * Check connection status.
   */
  public static async isConnected(): Promise<boolean> {
    if (!this.browser) {
      return false;
    }
    return this.browser.connected;
  }
}
