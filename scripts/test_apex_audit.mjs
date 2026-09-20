import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import fs from "fs";
import path from "path";

async function run() {
  console.log("[*] Initializing MCP Stdio Client...");
  const transport = new StdioClientTransport({
    command: "node",
    args: ["c:/Users/tanuj/Documents/antigravity/zealous-brahmagupta/apex-market-intelligence-mcp/build/index.js"],
    stderr: "inherit"
  });

  const client = new Client(
    { name: "test-client", version: "1.0.0" },
    { capabilities: {} }
  );

  await client.connect(transport);
  console.log("[+] Client connected to Apex Master Intelligence MCP Server!");

  const tools = await client.listTools();
  console.log(`[+] Discovered ${tools.tools.length} tools.`);

  const outputDir = path.resolve("c:/Users/tanuj/Documents/antigravity/zealous-brahmagupta/apex-reports-output");

  console.log("[*] Calling 'run_full_market_audit' for Specialty Coffee Café in Malviya Nagar, Jaipur...");
  const result = await client.callTool({
    name: "run_full_market_audit",
    arguments: {
      targetIndustry: "Specialty Coffee Café",
      exactMicroLocation: "Malviya Nagar, Jaipur",
      researchRadiusKm: 3,
      primaryObjective: "New business launch & commercial feasibility",
      targetCustomerSegment: "Young professionals, remote knowledge workers, and upscale youth",
      currency: "INR",
      investmentBudget: 4500000,
      storeSizeSqft: 1200,
      desiredPositioning: "premium",
      outputDir: outputDir
    }
  });

  const parsed = JSON.parse(result.content[0].text);
  console.log("[+] Audit Result:", JSON.stringify(parsed, null, 2));

  // Verify Markdown deliverable
  const mdFile = parsed.deliverables.deliverable1_markdown.path;
  if (fs.existsSync(mdFile)) {
    const mdContent = fs.readFileSync(mdFile, "utf-8");
    console.log(`[+] Markdown Report verified at ${mdFile} (${mdContent.length} chars)`);
  } else {
    throw new Error(`Markdown file not found at ${mdFile}`);
  }

  // Verify PDF deliverable
  const pdfFile = parsed.deliverables.deliverable2_executive_pdf.path;
  if (fs.existsSync(pdfFile)) {
    const pdfStats = fs.statSync(pdfFile);
    console.log(`[+] Executive PDF verified at ${pdfFile} (${pdfStats.size} bytes)`);
  } else {
    throw new Error(`PDF file not found at ${pdfFile}`);
  }

  await client.close();
  console.log("[*] Verification finished successfully!");
}

run().catch(err => {
  console.error("[-] Error running test:", err);
  process.exit(1);
});
