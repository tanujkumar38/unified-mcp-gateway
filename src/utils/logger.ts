/**
 * Strict Stderr Logger for MCP Servers.
 * 
 * CRITICAL MCP PROTOCOL RULE:
 * Stdout is exclusively reserved for newline-delimited JSON-RPC 2.0 messages.
 * Writing any log or debug output to stdout corrupts client-server communication
 * and breaks clients like Claude Desktop, Cursor, and VS Code.
 * 
 * All logs are strictly routed to process.stderr.
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  GUARDRAIL = 2,
  WARN = 3,
  ERROR = 4,
}

const CURRENT_LOG_LEVEL = process.env.DEBUG ? LogLevel.DEBUG : LogLevel.INFO;

function formatMessage(tag: string, message: string, data?: any): string {
  const timestamp = new Date().toISOString().split("T")[1].slice(0, -1);
  const dataStr = data !== undefined ? ` | ${typeof data === "object" ? JSON.stringify(data) : data}` : "";
  return `[${timestamp}] [${tag}] ${message}${dataStr}\n`;
}

export const logger = {
  debug(message: string, data?: any): void {
    if (CURRENT_LOG_LEVEL <= LogLevel.DEBUG) {
      process.stderr.write(formatMessage("DEBUG", message, data));
    }
  },

  info(message: string, data?: any): void {
    if (CURRENT_LOG_LEVEL <= LogLevel.INFO) {
      process.stderr.write(formatMessage("INFO", message, data));
    }
  },

  guardrail(message: string, data?: any): void {
    if (CURRENT_LOG_LEVEL <= LogLevel.GUARDRAIL) {
      process.stderr.write(formatMessage("ANTI-BAN", message, data));
    }
  },

  warn(message: string, data?: any): void {
    if (CURRENT_LOG_LEVEL <= LogLevel.WARN) {
      process.stderr.write(formatMessage("WARN", message, data));
    }
  },

  error(message: string, error?: any): void {
    if (CURRENT_LOG_LEVEL <= LogLevel.ERROR) {
      const errDetail = error instanceof Error ? `${error.message}\n${error.stack}` : error;
      process.stderr.write(formatMessage("ERROR", message, errDetail));
    }
  },
};
