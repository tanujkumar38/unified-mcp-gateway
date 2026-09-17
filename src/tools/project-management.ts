import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { BrowserManager } from "../core/browser-manager.js";
import { FlowDriver } from "../core/flow-driver.js";

export function registerProjectTools(server: McpServer): void {
  // 1. List Projects on Google Flow
  server.tool(
    "google_flow_list_projects",
    "Retrieves the list of existing projects, storyboards, and video reels from the user's flow.google workspace.",
    {},
    {
      title: "List Google Flow Projects",
      readOnlyHint: true,
      openWorldHint: true,
    },
    async () => {
      try {
        const page = await BrowserManager.getFlowPage();
        const projects = await FlowDriver.listProjects(page);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  count: projects.length,
                  projects,
                  activePageUrl: page.url(),
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
              text: `Failed to list projects: ${err.message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // 2. Create New Project / Storyboard
  server.tool(
    "google_flow_create_project",
    "Creates a new creative project or scene storyboard on flow.google.",
    {
      title: z
        .string()
        .min(1)
        .optional()
        .describe("Title for the new project or scene storyboard"),
    },
    {
      title: "Create Google Flow Project",
      openWorldHint: true,
      destructiveHint: false,
    },
    async ({ title }) => {
      try {
        const page = await BrowserManager.getFlowPage();
        const result = await FlowDriver.createProject(page, title);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err: any) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to create project: ${err.message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
