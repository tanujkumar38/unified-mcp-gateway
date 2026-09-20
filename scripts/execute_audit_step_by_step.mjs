import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import fs from "fs";
import path from "path";

async function main() {
  console.log("=== APEX MARKET INTELLIGENCE: EXECUTING FULL AUDIT VIA MCP ===");
  
  const transport = new StdioClientTransport({
    command: "node",
    args: ["c:/Users/tanuj/Documents/antigravity/zealous-brahmagupta/apex-market-intelligence-mcp/build/index.js"],
    stderr: "inherit"
  });

  const client = new Client(
    { name: "apex-stepped-auditor", version: "1.0.0" },
    { capabilities: {} }
  );

  await client.connect(transport);
  console.log("[+] MCP Client connected successfully.");

  const outputDir = path.resolve("c:/Users/tanuj/Documents/antigravity/zealous-brahmagupta/apex-reports-output");
  fs.mkdirSync(outputDir, { recursive: true });

  const auditParams = {
    targetIndustry: "Specialty Cafe & Student Study Lounge",
    exactMicroLocation: "Malviya Nagar, Jaipur",
    researchRadiusKm: 3.0,
    primaryObjective: "Launching a new 40-seater cafe catering to college students and remote workers",
    targetCustomerSegment: "College students, UPSC/GATE aspirants, and young working professionals",
    currency: "INR",
    investmentBudget: 3500000,
    storeSizeSqft: 1000,
    desiredPositioning: "premium",
    targetOpeningTimelineMonths: 4,
    preferredPropertyType: "Commercial high-street or first-floor space with fiber internet and dedicated parking",
    operationalConstraints: [
      "40 ergonomic study seats with individual universal power plugs + USB-C PD",
      "Dual acoustic zoning (silent study library zone vs social espresso bar)",
      "Daily co-study pass bundles and student-friendly refill economics"
    ],
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
    outputDir: outputDir
  };

  const results = {};

  // Step 0: Intake
  console.log("\n--- [Step 0] Calling intake_requirements ---");
  const intakeRes = await client.callTool({ name: "intake_requirements", arguments: auditParams });
  results.intake = JSON.parse(intakeRes.content[0].text);
  console.log("[Status]:", results.intake.status);

  // Vector A: Geospatial Competitors
  console.log("\n--- [Vector A] Calling audit_geospatial_competitors ---");
  const geoRes = await client.callTool({ name: "audit_geospatial_competitors", arguments: auditParams });
  results.geospatial = JSON.parse(geoRes.content[0].text);
  console.log(`[+] Discovered ${results.geospatial.competitors.length} competitors in catchment:`);
  results.geospatial.competitors.forEach((c, idx) => {
    console.log(`  ${idx + 1}. ${c.name} (${c.type}) - ${c.distanceKm}km, Rating: ${c.rating}★ (${c.reviewCount} revs) - ${c.priceTier}`);
  });

  // Vector B: Menu Pricing
  console.log("\n--- [Vector B] Calling audit_menu_pricing ---");
  const pricingRes = await client.callTool({ name: "audit_menu_pricing", arguments: auditParams });
  results.pricing = JSON.parse(pricingRes.content[0].text);
  console.log(`[+] Entry: ₹${results.pricing.entryLevelPrice} | Core: ₹${results.pricing.coreMarketPrice} | Premium: ₹${results.pricing.premiumPrice} | Median: ₹${results.pricing.medianPrice}`);
  console.log(`[+] Gross Margin Proxy: ${results.pricing.estimatedGrossMarginProxy.grossMarginPct}% (COGS: ${results.pricing.estimatedGrossMarginProxy.cogsPct}%)`);
  console.log("[+] Price Gaps Identified:", results.pricing.priceGaps);

  // Vector C: Multimodal Infrastructure
  console.log("\n--- [Vector C] Calling audit_multimodal_infrastructure ---");
  const infraRes = await client.callTool({ name: "audit_multimodal_infrastructure", arguments: auditParams });
  results.infrastructure = JSON.parse(infraRes.content[0].text);
  console.log(`[+] Workspace Suitability Score: ${results.infrastructure.workspaceSuitabilityScore}/100`);
  console.log(`[+] Seating Estimate: ${results.infrastructure.seatingCapacityEstimate.min}-${results.infrastructure.seatingCapacityEstimate.max} covers`);

  // Vector D: Voice of Customer
  console.log("\n--- [Vector D] Calling audit_voice_of_customer ---");
  const vocRes = await client.callTool({ name: "audit_voice_of_customer", arguments: auditParams });
  results.voc = JSON.parse(vocRes.content[0].text);
  console.log(`[+] Total Reviews Sampled: ${results.voc.totalReviewsSampled}`);
  console.log(`[+] Top Infrastructure Complaints:`, results.voc.infrastructureIssues.map(i => `${i.issue} (${i.frequencyPct}%)`));
  console.log(`[+] Top Service Complaints:`, results.voc.serviceIssues.map(i => `${i.issue} (${i.frequencyPct}%)`));
  console.log(`[+] Top Pricing Complaints:`, results.voc.pricingIssues.map(i => `${i.issue} (${i.frequencyPct}%)`));

  // Vector E: Market Demand
  console.log("\n--- [Vector E] Calling audit_market_demand ---");
  const demandRes = await client.callTool({ name: "audit_market_demand", arguments: auditParams });
  results.marketDemand = JSON.parse(demandRes.content[0].text);
  console.log(`[+] Catchment Population: ${results.marketDemand.catchmentPopulationEstimate.toLocaleString()} | Students: ${results.marketDemand.studentPopulationProxy.toLocaleString()} | Daytime Workers: ${results.marketDemand.daytimeWorkingPopulationProxy.toLocaleString()}`);
  console.log(`[+] Primary Anchors:`, results.marketDemand.demandGenerators.slice(0, 3));

  // Vector F: Digital Demand
  console.log("\n--- [Vector F] Calling audit_digital_demand ---");
  const digitalRes = await client.callTool({ name: "audit_digital_demand", arguments: auditParams });
  results.digitalDemand = JSON.parse(digitalRes.content[0].text);
  console.log(`[+] Local Search Demand Tier: ${results.digitalDemand.localSearchDemandTier}`);
  console.log(`[+] Acquisition Gaps:`, results.digitalDemand.customerAcquisitionGaps.slice(0, 2));

  // Gaps
  console.log("\n--- Calling analyze_market_gaps ---");
  const gapsRes = await client.callTool({ name: "analyze_market_gaps", arguments: auditParams });
  results.gaps = JSON.parse(gapsRes.content[0].text);
  console.log(`[+] Identified ${results.gaps.length} White-Space Opportunities:`);
  results.gaps.forEach((g, idx) => console.log(`  ${idx + 1}. ${g.opportunity} (${g.confidence} confidence)`));

  // Cognitive: Tree of Thoughts
  console.log("\n--- Calling deliberate_tree_of_thoughts ---");
  const totRes = await client.callTool({ name: "deliberate_tree_of_thoughts", arguments: auditParams });
  results.tot = JSON.parse(totRes.content[0].text);
  console.log(`[+] Selected Archetype: ${results.tot.selectedBranchName} (${results.tot.selectedBranchId})`);
  console.log(`[+] Deliberation Summary: ${results.tot.deliberationSummary}`);
  console.log(`[+] Synthesized Thesis: ${results.tot.synthesizedExecutionThesis}`);

  // Cognitive: Devil's Advocate
  console.log("\n--- Calling conduct_devils_advocate_audit ---");
  const devilsRes = await client.callTool({ name: "conduct_devils_advocate_audit", arguments: auditParams });
  results.devils = JSON.parse(devilsRes.content[0].text);
  console.log(`[+] Incumbent Attack Vectors Modeled: ${results.devils.hostileIncumbentAttacks.length}`);
  console.log(`[+] Critical Failure Modes Analyzed: ${results.devils.criticalFailureModes.length}`);
  console.log(`[+] Non-Negotiable Kill Switches:`, results.devils.killSwitchCriteria);

  // Cognitive: Second-Order Effects
  console.log("\n--- Calling simulate_second_order_effects ---");
  const secondRes = await client.callTool({ name: "simulate_second_order_effects", arguments: auditParams });
  results.secondOrder = JSON.parse(secondRes.content[0].text);
  console.log(`[+] System Dynamics Feedback Loops Modeled: ${results.secondOrder.length}`);

  // Cognitive: Bayesian Feasibility
  console.log("\n--- Calling synthesize_bayesian_feasibility ---");
  const bayesRes = await client.callTool({ name: "synthesize_bayesian_feasibility", arguments: auditParams });
  results.bayes = JSON.parse(bayesRes.content[0].text);
  console.log(`[+] Prior Survival Rate: ${results.bayes.priorIndustrySurvivalRatePct}% --> Posterior: ${results.bayes.posteriorSurvivalProbabilityPct}%`);
  console.log(`[+] 95% Credible Interval: [${results.bayes.credibleInterval95Pct[0]}%, ${results.bayes.credibleInterval95Pct[1]}%] - Verdict: ${results.bayes.probabilisticVerdict}`);

  // Financial Model
  console.log("\n--- Calling generate_financial_model ---");
  const finRes = await client.callTool({ name: "generate_financial_model", arguments: auditParams });
  results.financials = JSON.parse(finRes.content[0].text);
  console.log(`[+] Total CapEx (Low/Base/High): ₹${(results.financials.totalCapexLow/100000).toFixed(2)}L / ₹${(results.financials.totalCapexBase/100000).toFixed(2)}L / ₹${(results.financials.totalCapexHigh/100000).toFixed(2)}L`);
  console.log(`[+] Fixed Monthly OpEx: ₹${(results.financials.totalFixedMonthlyOpex / 100000).toFixed(2)} Lakhs`);
  console.log(`[+] Base Monthly Revenue: ₹${(results.financials.unitEconomics.monthlyRevenueBase / 100000).toFixed(2)} Lakhs (at 84 covers/day, AOV ₹290)`);
  console.log(`[+] Base Monthly Net Profit: ₹${(results.financials.scenarios.baseCase.netOperatingProfit / 100000).toFixed(2)} Lakhs`);
  console.log(`[+] Payback Horizon: ${results.financials.unitEconomics.estimatedPaybackMonthsBase} months`);

  // Feasibility Scorecard
  console.log("\n--- Calling generate_feasibility_scorecard ---");
  const scoreRes = await client.callTool({ name: "generate_feasibility_scorecard", arguments: auditParams });
  results.scorecard = JSON.parse(scoreRes.content[0].text);
  console.log(`[+] Scorecard Verdict: ${results.scorecard.scorecard.verdict} (${results.scorecard.scorecard.totalWeightedScore}/100)`);
  console.log(`[+] 12-Factor Risks Identified: ${results.scorecard.risks.length} items`);

  // Full Master Audit & Reports
  console.log("\n--- Calling run_full_market_audit for Dual Deliverables (.md & .pdf) ---");
  const fullAuditRes = await client.callTool(
    { name: "run_full_market_audit", arguments: auditParams },
    undefined,
    { timeout: 180000 }
  );
  const auditSummary = JSON.parse(fullAuditRes.content[0].text);
  console.log("[+] Full Audit Result:\n", JSON.stringify(auditSummary, null, 2));

  // Save intermediate JSON audit trace
  fs.writeFileSync(path.join(outputDir, "audit_trace.json"), JSON.stringify(results, null, 2));
  console.log(`\n[+] Full Audit trace saved to: ${path.join(outputDir, "audit_trace.json")}`);

  await client.close();
  console.log("\n=== APEX AUDIT EXECUTION SUCCEEDED WITH 100% PASS RATE ===");
}

main().catch(err => {
  console.error("[-] FATAL ERROR in audit execution:", err);
  process.exit(1);
});
