import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerConnectionTools } from "./connection.js";
import { registerProjectTools } from "./project-management.js";
import { registerVideoTools } from "./video-generation.js";
import { registerVideoEditingTools } from "./video-editing.js";
import { registerImageTools } from "./image-generation.js";
import { registerCameraTools } from "./camera-controls.js";
import { registerExportTools } from "./export-tools.js";
import { registerStudioTools } from "./studio-tools.js";
import { registerSearchFetchTools } from "./search-fetch.js";
import { logger } from "../utils/logger.js";

export function registerAllTools(server: McpServer): void {
  logger.info("Registering Google Flow Professional MCP tools...");
  registerConnectionTools(server);
  registerProjectTools(server);
  registerVideoTools(server);
  registerVideoEditingTools(server);
  registerImageTools(server);
  registerCameraTools(server);
  registerExportTools(server);
  registerStudioTools(server);
  registerSearchFetchTools(server);
  logger.info("Google Flow Professional MCP tools registered successfully (with ChatGPT Search & Fetch compliance)");
}
