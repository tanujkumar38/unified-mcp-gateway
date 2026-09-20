import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import fs from "fs";
import path from "path";

async function run() {
  console.log("[*] Initializing MCP Stdio Client for Apex Master Intelligence...");
  const transport = new StdioClientTransport({
    command: "node",
    args: ["c:/Users/tanuj/Documents/antigravity/zealous-brahmagupta/apex-market-intelligence-mcp/build/index.js"],
    stderr: "inherit"
  });

  const client = new Client(
    { name: "apex-audit-runner", version: "1.1.0" },
    { capabilities: {} }
  );

  await client.connect(transport);
  console.log("[+] Connected to Apex Master Intelligence MCP Server.");

  const tools = await client.listTools();
  console.log(`[+] Discovered ${tools.tools.length} available MCP tools.`);

  const outputDir = path.resolve("c:/Users/tanuj/Documents/antigravity/zealous-brahmagupta/apex-reports-output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const auditParams = {
    targetIndustry: "Specialty Cafe & Student Study Lounge",
    exactMicroLocation: "Malviya Nagar, Jaipur",
    researchRadiusKm: 3.0,
    primaryObjective: "Launching a new 40-seater cafe catering to college students and remote workers",
    targetCustomerSegment: "College students, UPSC/GATE aspirants, and young working professionals",
    knownCompetitors: [
      "Roastery Coffee House",
      "Curators Specialty Coffee",
      "Town Coffee",
      "Third Wave Coffee",
      "Blue Tokai Coffee Roasters",
      "The Yellow House - Robot Cafe & Student Study Hub",
      "Café Quaint & Co.",
      "Starbucks Coffee"
    ],
    currency: "INR",
    investmentBudget: 3500000,
    storeSizeSqft: 1000,
    desiredPositioning: "premium",
    targetOpeningTimelineMonths: 4,
    preferredPropertyType: "Street-level or first-floor commercial space with high-speed fiber accessibility & dedicated scooter/car parking",
    operationalConstraints: [
      "40 ergonomic study seats with individual universal power plugs + USB-C PD",
      "Dual acoustic zoning (silent study library zone vs social espresso bar)",
      "Daily co-study pass bundles and student-friendly refill economics"
    ],
    outputDir: outputDir
  };

  console.log("[*] Executing 'run_full_market_audit' with student study lounge parameters...");
  const result = await client.callTool({
    name: "run_full_market_audit",
    arguments: auditParams
  });

  const parsed = JSON.parse(result.content[0].text);
  console.log("[+] Full Audit Execution Output:\n", JSON.stringify(parsed, null, 2));

  // Verify Markdown deliverable
  const mdFile = parsed.deliverables.deliverable1_markdown.path;
  if (fs.existsSync(mdFile)) {
    const mdContent = fs.readFileSync(mdFile, "utf-8");
    console.log(`[+] Deliverable 1 (Markdown Report) generated successfully at: ${mdFile}`);
    console.log(`    Size: ${mdContent.length} characters (${parsed.deliverables.deliverable1_markdown.sizeBytes} bytes)`);
  } else {
    throw new Error(`Markdown report file not found at: ${mdFile}`);
  }

  // Verify PDF deliverable
  const pdfFile = parsed.deliverables.deliverable2_executive_pdf.path;
  if (fs.existsSync(pdfFile)) {
    const pdfStats = fs.statSync(pdfFile);
    console.log(`[+] Deliverable 2 (Executive PDF) generated successfully at: ${pdfFile}`);
    console.log(`    Size: ${pdfStats.size} bytes (${parsed.deliverables.deliverable2_executive_pdf.pages} pages)`);
  } else {
    throw new Error(`PDF report file not found at: ${pdfFile}`);
  }

  await client.close();
  console.log("[*] Apex Market Feasibility Audit successfully finished!");
}

run().catch((err) => {
  console.error("[-] Error during audit execution:", err);
  process.exit(1);
});
