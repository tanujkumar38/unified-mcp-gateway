# MCP Troubleshooting, Pitfalls & Debugging Guide

Based on empirical production data, MCP server failures cluster into five well-defined categories. This guide details symptoms, root causes, and verified fixes.

---

## 1. Problem Breakdown by Frequency

```
┌─────────────────────────────────────────────────────────────┐
│ 50% Configuration Errors (Paths, Environment, JSON Syntax)  │
├─────────────────────────────────────────────┬───────────────┤
│ 20% Connection Failures (Startup, Ports)    │ 15% Protocol  │
├─────────────────────────────┬───────────────┴───────────────┤
│ 10% Tool Execution Failures │ 5% Transport Misconfigurations│
└─────────────────────────────┴───────────────────────────────┘
```

---

## 2. Category 1: Configuration Issues (50%)

### A. Relative vs. Absolute Binary Paths
- **Symptom**: Host reports `Command not found`, `spawn ENOENT`, or server never launches.
- **Root Cause**: Host processes (Claude Desktop, Cursor) execute from an arbitrary working directory (e.g. system root or user home). Relative paths like `./build/index.js` or `build/index.js` fail to resolve.
- **Fix**: ALWAYS configure absolute paths in client JSON configs:
  ```json
  {
    "command": "node",
    "args": ["C:/Users/tanuj/my-mcp/build/index.js"]
  }
  ```
- **Windows Path Pitfall**: In JSON, backslashes must be escaped (`C:\\path\\to\\bin`) or use forward slashes (`C:/path/to/bin`).

### B. Environment Variable Starvation
- **Symptom**: Server starts, but immediately crashes or fails tool calls with `API_KEY is undefined`.
- **Root Cause**: Unlike interactive terminals, GUI host apps launch subprocesses with an isolated, stripped-down environment. Shell `.bashrc`, `.zshrc`, or system env variables are not automatically inherited.
- **Fix**: Declare required environment variables explicitly in the client configuration:
  ```json
  {
    "command": "node",
    "args": ["/absolute/path/index.js"],
    "env": {
      "API_KEY": "sk-proj-...",
      "DATABASE_URL": "postgresql://user:pass@localhost:5432/db"
    }
  }
  ```
  And inside TypeScript/JavaScript, validate with dotenv on entry:
  ```typescript
  import * as dotenv from "dotenv";
  dotenv.config();
  if (!process.env.API_KEY) {
    console.error("[FATAL] Missing required API_KEY environment variable");
    process.exit(1);
  }
  ```

---

## 3. Category 2: Protocol Errors (15%)

### The #1 Protocol Killer: Stdout Pollution
- **Symptom**: Client drops connection with `SyntaxError: Unexpected token in JSON at position 0`, or `Invalid JSON-RPC message`.
- **Root Cause**: In `stdio` transport, standard output (`stdout`) is the sacred wire for JSON-RPC 2.0 messages. Any `console.log("Starting server...")`, third-party library log, or child process output written to `stdout` corrupts the JSON-RPC packet stream.
- **Strict Rule**: **NEVER USE `console.log()` IN STDIO MCP SERVERS.**
- **Fix**:
  ```typescript
  // ❌ FATAL ERROR - Corrupts JSON-RPC stream:
  console.log("Fetching weather data...");
  process.stdout.write("Connected\n");

  // ✅ CORRECT - Stderr is safe for debugging:
  console.error("[DEBUG] Fetching weather data...");
  process.stderr.write("[INFO] Connected\n");
  ```

### Requests Before Initialization
- **Symptom**: Server responds with error `-32600: Request forbidden before initialization`.
- **Root Cause**: The MCP specification forbids sending requests before the handshake completes (`initialize` request -> `initialize` response -> `notifications/initialized`). Only `ping` and logging notifications are permitted during handshake.

---

## 4. Category 3: Connection & Startup Errors (20%)

### Startup Deadlocks & Hanging
- **Symptom**: Client hangs indefinitely on startup; timeout errors after 30-60 seconds.
- **Root Cause**: Unhandled asynchronous promises, unclosed database connection pools during startup, or waiting for standard input synchronously before connecting the transport.
- **Fix**:
  - Connect the transport immediately after defining tools.
  - Implement top-level error trapping:
  ```typescript
  main().catch((err) => {
    console.error("[FATAL] Unhandled startup exception:", err);
    process.exit(1);
  });
  ```

---

## 5. Category 4: Tool Execution Failures (10%)

### Schema Validation Mismatches
- **Symptom**: Tool appears in host list, but LLM invocations fail with `Invalid params: Expected number, received string`.
- **Root Cause**: LLMs frequently supply numeric parameters as strings (e.g. `"50"` instead of `50`), or omit optional fields.
- **Fix**: Use `z.coerce` in Zod schemas when flexibility is desired:
  ```typescript
  const schema = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(10).describe("Number of items to fetch"),
    query: z.string().min(1).describe("Search search query")
  });
  ```
- **Always Shield Tool Exceptions**:
  ```typescript
  server.tool("search", schema, async (args) => {
    try {
      const results = await performSearch(args);
      return {
        content: [{ type: "text", text: JSON.stringify(results) }]
      };
    } catch (error: any) {
      console.error(`[TOOL ERROR] search failed:`, error);
      return {
        content: [{ type: "text", text: `Search failed: ${error.message}` }],
        isError: true
      };
    }
  });
  ```

---

## 6. The Debugging Holy Trinity

When troubleshooting any failing MCP server, follow this three-step diagnostic sequence:

### Step 1: Check the Stderr Log Files
- **Claude Desktop (Windows)**: `%LOCALAPPDATA%\Claude\logs\mcp*.log`
- **Claude Desktop (macOS)**: `~/Library/Logs/Claude Desktop/mcp*.log`
- **VS Code**: `Output` panel -> dropdown -> `MCP Server` or `Extension Host`.

### Step 2: Test with MCP Inspector
The official MCP Inspector bypasses the host app and directly executes your server in an interactive browser UI:
```bash
# Test a TypeScript stdio server
npx @modelcontextprotocol/inspector node build/index.js

# Test a Python stdio server
npx @modelcontextprotocol/inspector python server.py
```
This UI displays raw JSON-RPC messages, lets you invoke each tool manually, and highlights schema errors instantly.

### Step 3: Raw Pipe Handshake Test
Pipe a raw JSON-RPC initialization packet directly through the CLI:
```bash
# Windows PowerShell
'{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}' | node build/index.js
```
If the server is healthy, it will output a single valid JSON response line with `serverInfo` and `capabilities`. If non-JSON text appears before or after, you have stdout pollution!
