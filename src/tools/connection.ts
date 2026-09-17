import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { BrowserManager } from "../core/browser-manager.js";
import { FlowDriver } from "../core/flow-driver.js";
import { AntiBanGuardrails } from "../core/anti-ban-guardrails.js";
import { config } from "../config.js";

export function registerConnectionTools(server: McpServer): void {
  // 1. Check Google Flow & Chrome Connection Status
  server.tool(
    "google_flow_get_status",
    "Inspects the connection status of Google Chrome, active flow.google tab, authentication state, and anti-ban guardrail metrics.",
    {},
    {
      title: "Get Google Flow Status",
      readOnlyHint: true,
    },
    async () => {
      try {
        const guardrails = AntiBanGuardrails.getStatus();
        const connected = await BrowserManager.isConnected();

        if (!connected) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    browserConnected: false,
                    message: `Chrome is not connected via CDP on port ${config.cdpPort}. Call 'google_flow_launch_chrome' or run Chrome with --remote-debugging-port=${config.cdpPort}.`,
                    guardrails,
                    config: {
                      cdpPort: config.cdpPort,
                      flowUrl: config.flowUrl,
                      generationCooldownMs: config.generationCooldownMs,
                    },
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        const page = await BrowserManager.getFlowPage();
        const auth = await FlowDriver.checkAuthStatus(page);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  browserConnected: true,
                  auth,
                  guardrails,
                  pageTitle: await page.title(),
                  pageUrl: page.url(),
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (err: any) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                browserConnected: false,
                error: err.message,
                guardrails: AntiBanGuardrails.getStatus(),
              }),
            },
          ],
          isError: true,
        };
      }
    }
  );

  // 2. Launch Google Chrome with Remote Debugging & Persistent Profile
  server.tool(
    "google_flow_launch_chrome",
    "Launches authentic Google Chrome with remote debugging (CDP port 9222) and a persistent user profile directory. Opens flow.google directly for safe Google Account authentication with ZERO risk of account ban.",
    {
      forceNew: z
        .boolean()
        .optional()
        .default(false)
        .describe("Whether to relaunch Chrome if already active"),
    },
    {
      title: "Launch Authentic Chrome for Google Flow",
      destructiveHint: false,
      openWorldHint: true,
    },
    async ({ forceNew }) => {
      try {
        const connected = await BrowserManager.isConnected();
        if (connected && !forceNew) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  status: "already_connected",
                  message: `Google Chrome is already connected on CDP port ${config.cdpPort}.`,
                }),
              },
            ],
          };
        }

        const result = await BrowserManager.launchChromeWithDebugging();
        const page = await BrowserManager.getFlowPage();
        const auth = await FlowDriver.checkAuthStatus(page);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  status: "launched",
                  pid: result.pid,
                  cdpEndpoint: result.cdpUrl,
                  flowUrl: config.flowUrl,
                  authStatus: auth,
                  guidance:
                    "Chrome is running. If you are not yet signed in, please click 'Sign In' in the Chrome window. Your session will be preserved locally without needing to re-login.",
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (err: any) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to launch Chrome: ${err.message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
