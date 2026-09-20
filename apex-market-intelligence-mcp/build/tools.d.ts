import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { IntakeRequirements, MasterMarketAuditResult } from "./types.js";
/**
 * Registers all 13 specialized tools on the MCP server instance
 */
export declare function registerApexTools(server: McpServer): void;
/**
 * Internal helper to run the full audit pipeline
 */
export declare function runCompleteAuditInternal(params: Partial<IntakeRequirements>): MasterMarketAuditResult;
