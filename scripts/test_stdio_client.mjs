import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, "..", "dist", "index.js");

console.log("Starting StdioClientTransport connecting to:", distPath);

const transport = new StdioClientTransport({
  command: "node",
  args: [distPath],
  env: process.env,
});

const client = new Client(
  {
    name: "test-stdio-client",
    version: "1.0.0",
  },
  {
    capabilities: {},
  }
);

try {
  await client.connect(transport);
  console.log("Connected to Google Flow MCP Server via Stdio!");

  const tools = await client.listTools();
  console.log(`Successfully listed ${tools.tools.length} MCP tools:`);
  for (const t of tools.tools) {
    console.log(` - ${t.name}: ${t.description.slice(0, 60)}...`);
  }

  // Test Tool Call 1
  console.log("\nCalling google_flow_get_status...");
  const statusRes = await client.callTool({
    name: "google_flow_get_status",
    arguments: {},
  });
  console.log("Status response received:", (statusRes.content[0]).text.slice(0, 100) + "...");

  // Test Tool Call 2
  console.log("\nCalling google_flow_estimate_credits for Veo Quality 8s...");
  const creditRes = await client.callTool({
    name: "google_flow_estimate_credits",
    arguments: {
      model: "veo-3.1-quality",
      duration_seconds: 8,
      shot_count: 1,
    },
  });
  console.log("Credit estimate response:", (creditRes.content[0]).text);

  // Test Tool Call 3
  console.log("\nCalling google_flow_generate_video (dry_run: true)...");
  const genRes = await client.callTool({
    name: "google_flow_generate_video",
    arguments: {
      prompt: "Epic drone shot over neon metropolis",
      model: "veo-3.1-quality",
      duration_seconds: 8,
      aspect_ratio: "2.39:1",
      dry_run: true,
    },
  });
  console.log("Video generation dry_run response:", (genRes.content[0]).text);

  console.log("\nAll Stdio Client E2E checks PASSED flawlessly!");
} catch (err) {
  console.error("Stdio Client Test FAILED:", err);
  process.exitCode = 1;
} finally {
  await client.close();
  await transport.close();
  process.exit(process.exitCode || 0);
}
