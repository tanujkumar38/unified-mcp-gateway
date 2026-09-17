import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

interface RenderOwner {
  id: string;
  name: string;
  email: string;
  type: string;
}

interface RenderService {
  service: {
    id: string;
    name: string;
    serviceDetails: {
      url: string;
    };
  };
}

async function renderRequest(endpoint: string, apiKey: string, options: RequestInit = {}) {
  const url = `https://api.render.com/v1${endpoint}`;
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Render API [${res.status} ${res.statusText}] at ${endpoint}: ${errorText}`);
  }
  return res.json();
}

async function main() {
  console.log("==================================================================");
  console.log("🚀 Render Cloud MCP & API Deployment Orchestrator");
  console.log("==================================================================");

  // 1. Resolve API Key
  let apiKey = process.env.RENDER_API_KEY;
  const keyArgIdx = process.argv.indexOf("--api-key");
  if (keyArgIdx !== -1 && process.argv[keyArgIdx + 1]) {
    apiKey = process.argv[keyArgIdx + 1];
  }

  if (!apiKey || !apiKey.startsWith("rnd_")) {
    console.error("\n❌ Error: Missing or invalid RENDER_API_KEY.");
    console.error("Please get your API key from: https://dashboard.render.com/u/settings?add-api-key");
    console.error("Usage:");
    console.error("  npx tsx scripts/render-deploy.ts --api-key <YOUR_RENDER_API_KEY> [options]");
    console.error("  Or set RENDER_API_KEY=rnd_... in your .env file.\n");
    process.exit(1);
  }

  console.log("🔑 Authenticating with Render Cloud API...");

  // 2. Fetch Workspaces (Owners)
  let owners: Array<{ owner: RenderOwner }> = [];
  try {
    owners = await renderRequest("/owners", apiKey);
  } catch (err: any) {
    console.error(`❌ Authentication failed: ${err.message}`);
    process.exit(1);
  }

  if (!owners || owners.length === 0) {
    console.error("❌ No Render workspaces found for this API Key.");
    process.exit(1);
  }

  console.log(`✅ Authenticated successfully! Accessible workspaces (${owners.length}):`);
  owners.forEach((o, i) => {
    console.log(`   [${i + 1}] ${o.owner.name} (${o.owner.email}) - ID: ${o.owner.id} [${o.owner.type}]`);
  });

  const activeOwner = owners[0].owner;
  console.log(`👉 Using default workspace: "${activeOwner.name}" (${activeOwner.id})\n`);

  // 3. Resolve Target Repository
  let repoUrl = "";
  const repoArgIdx = process.argv.indexOf("--repo");
  if (repoArgIdx !== -1 && process.argv[repoArgIdx + 1]) {
    repoUrl = process.argv[repoArgIdx + 1];
  } else {
    const urlArg = process.argv.find((a) => a.includes("github.com") || a.startsWith("http"));
    repoUrl = urlArg || "https://github.com/tanujkumar38/unified-mcp-gateway";
  }

  const serviceName = "unified-mcp-gateway";

  // 4. Check Existing Services
  console.log(`🔍 Checking existing services in workspace "${activeOwner.name}"...`);
  const services: RenderService[] = await renderRequest(`/services?ownerId=${activeOwner.id}&limit=50`, apiKey);
  const existing = services.find((s) => s.service.name === serviceName);

  if (existing) {
    console.log(`\n📦 Found existing service: "${serviceName}" (ID: ${existing.service.id})`);
    console.log(`🌐 Live URL: ${existing.service.serviceDetails?.url || "Pending URL assignment"}`);
    console.log("⚡ Triggering new deployment with cleared build cache...");

    const deployRes = await renderRequest(`/services/${existing.service.id}/deploys`, apiKey, {
      method: "POST",
      body: JSON.stringify({ clearCache: "clear" }),
    });

    console.log(`🚀 Deployment triggered! Deploy ID: ${deployRes.id}`);
    await monitorDeploy(existing.service.id, deployRes.id, apiKey);
    return;
  }

  // 5. Create New Service if not found
  console.log(`\n📦 Service "${serviceName}" not found. Creating new Web Service on Render...`);

  if (!repoUrl) {
    console.log("ℹ️  To automatically create and deploy a Web Service, specify your GitHub repo:");
    console.log("   npx tsx scripts/render-deploy.ts --repo https://github.com/TanujK-Tech/unified-mcp-gateway\n");
    console.log("Alternatively, deploy via Render Blueprint in 1-Click:");
    console.log("1. Push this repository to GitHub.");
    console.log("2. Open: https://dashboard.render.com/blueprints/new");
    console.log("3. Connect your repository. Render will automatically read 'render.yaml' and configure the service!");
    return;
  }

  console.log(`🔗 Connecting repository: ${repoUrl}`);
  const branch = "main";

  const createPayload = {
    type: "web_service",
    name: serviceName,
    ownerId: activeOwner.id,
    repo: repoUrl,
    branch,
    autoDeploy: "yes",
    serviceDetails: {
      env: "node",
      plan: "free",
      region: "oregon",
      healthCheckPath: "/health",
      envSpecificDetails: {
        buildCommand: "npm install && npm run build",
        startCommand: "npm start",
      },
      envVars: [
        { key: "NODE_ENV", value: "production" },
        { key: "PORT", value: "10000" },
      ],
    },
  };

  try {
    const created = await renderRequest("/services", apiKey, {
      method: "POST",
      body: JSON.stringify(createPayload),
    });

    const serviceId = created.service?.id || created.id;
    const assignedUrl = created.service?.serviceDetails?.url || created.serviceDetails?.url || `https://${serviceName}.onrender.com`;
    console.log(`✅ Web Service created successfully! Service ID: ${serviceId}`);
    console.log(`🌐 Assigned URL: ${assignedUrl}`);
    console.log("⚡ Initial build and deployment started...");

    // Fetch initial deploy ID
    const deploys = await renderRequest(`/services/${serviceId}/deploys?limit=1`, apiKey);
    if (deploys && deploys[0]) {
      const deployId = deploys[0].deploy?.id || deploys[0].id;
      await monitorDeploy(serviceId, deployId, apiKey);
    }
  } catch (err: any) {
    console.error(`❌ Failed to create web service: ${err.message}`);
  }
}

async function monitorDeploy(serviceId: string, deployId: string, apiKey: string) {
  console.log("⏳ Monitoring deployment status...");
  let attempts = 0;
  const maxAttempts = 60; // 5 minutes max

  while (attempts < maxAttempts) {
    attempts++;
    await new Promise((r) => setTimeout(r, 5000));

    try {
      const deploy = await renderRequest(`/services/${serviceId}/deploys/${deployId}`, apiKey);
      const status = deploy.status;
      process.stdout.write(`   [${attempts * 5}s] Deploy status: ${status}\r`);

      if (status === "live") {
        console.log(`\n\n🎉 DEPLOYMENT SUCCESSFUL! Service is now LIVE!`);
        const service = await renderRequest(`/services/${serviceId}`, apiKey);
        console.log(`🌐 Public Endpoint: ${service.serviceDetails?.url}`);
        console.log(`📡 MCP SSE URL:     ${service.serviceDetails?.url}/sse`);
        console.log(`🩺 Health Check:    ${service.serviceDetails?.url}/health\n`);
        return;
      }

      if (status === "build_failed" || status === "update_failed" || status === "canceled") {
        console.log(`\n\n❌ Deployment finished with status: ${status}`);
        return;
      }
    } catch (err: any) {
      console.warn(`\nWarning checking deploy status: ${err.message}`);
    }
  }
}

main().catch(console.error);
