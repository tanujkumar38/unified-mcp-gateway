#!/data/data/com.termux/files/usr/bin/bash
# ==============================================================================
# Unified MCP Gateway Hub - Termux Android Auto Setup Script
# ==============================================================================

set -e

echo "🚀 Starting Unified MCP Gateway setup on Termux Android..."

# 1. Update Termux Package Repositories
echo "📦 Updating Termux packages..."
pkg update -y

# 2. Install Required Packages (Node.js LTS, Git, Python, cURL)
echo "📥 Installing Node.js LTS, Git, and dependencies..."
pkg install -y nodejs-lts git curl

# 3. Verify Node and NPM
echo "✅ Node version: $(node -v)"
echo "✅ NPM version: $(npm -v)"

# 4. Install Project Dependencies
echo "📦 Installing npm dependencies (including tickertape-mcp workspace)..."
npm install

# 5. Build TypeScript Sources
echo "⚙️ Compiling TypeScript gateway..."
npm run build

# 6. Create mobile-friendly .env if not present
if [ ! -f .env ]; then
  echo "📝 Creating initial .env configuration..."
  cat <<EOT > .env
PORT=3000
NODE_ENV=production
RENDER_API_KEY=rnd_yx4s2e1NuiCqanJ9mKpImVlu4U0X
EOT
  echo "✅ .env created with Render API key configured."
fi

echo ""
echo "=================================================================="
echo "🎉 Termux Setup Completed Successfully!"
echo "=================================================================="
echo "To start the Gateway on your phone:"
echo "  npm run gateway"
echo ""
echo "To keep it running in the background on your phone:"
echo "  nohup npm run gateway > gateway.log 2>&1 &"
echo ""
echo "Your local mobile endpoints:"
echo "  Web Dashboard: http://localhost:3000"
echo "  SSE Endpoint:  http://localhost:3000/sse"
echo ""
echo "To expose to ChatGPT Web / Claude Web from mobile, run:"
echo "  pkg install cloudflared -y"
echo "  cloudflared tunnel --url http://localhost:3000"
echo "=================================================================="
