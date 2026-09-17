#!/usr/bin/env python3
"""
Universal MCP Project Scaffolding Tool
Automates the generation of production-ready Model Context Protocol (MCP) servers,
supporting platform-specific builds (Claude, ChatGPT, Vibe, Cursor, VS Code),
universal cross-platform servers, and multi-server aggregation gateways.

Usage:
    python mcp_scaffold.py --name my-server --type universal --out ./my-server
    python mcp_scaffold.py --name chatgpt-mcp --type ts-http --platform chatgpt --out ./chatgpt-mcp
    python mcp_scaffold.py --name central-hub --type gateway --out ./central-gateway
    python mcp_scaffold.py --name local-agent --type ts-stdio --platform claude --out ./local-agent
    python mcp_scaffold.py --name enterprise-portal --type private-api --out ./portal-mcp
"""

import os
import sys
import argparse
import shutil
from pathlib import Path

TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "templates"

VALID_TYPES = {
    "universal": "Universal Cross-Platform Server (Dual Stdio/HTTP, ChatGPT Connectors search/fetch, Claude/Cursor)",
    "gateway": "Multi-Server MCP Gateway (Meta-Tool Pattern, Context Window Optimization, Upstream Aggregator)",
    "ts-stdio": "TypeScript Stdio Server (Local Agents, Claude Desktop, Cursor)",
    "ts-http": "TypeScript Streamable HTTP Server (SSE, Remote Clients, ChatGPT)",
    "py-stdio": "Python FastMCP Server (FastMCP, Python Agents)",
    "private-api": "Reverse-Engineered Private API Server (Enterprise Portals without APIs)",
    "browser": "Browser Automation Server (Puppeteer, Interactive Portals)",
}

PLATFORMS = ["universal", "claude", "chatgpt", "vibe", "cursor", "vscode"]


def scaffold_universal(target_dir: Path, server_name: str, platform: str):
    src_dir = target_dir / "src"
    src_dir.mkdir(parents=True, exist_ok=True)

    # 1. package.json
    pkg_template = (TEMPLATES_DIR / "universal-adapter" / "package.json").read_text(encoding="utf-8")
    pkg_content = pkg_template.replace("mcp-server-template-universal", server_name)
    (target_dir / "package.json").write_text(pkg_content, encoding="utf-8")

    # 2. tsconfig.json
    shutil.copyfile(TEMPLATES_DIR / "universal-adapter" / "tsconfig.json", target_dir / "tsconfig.json")

    # 3. .env.example
    shutil.copyfile(TEMPLATES_DIR / "universal-adapter" / ".env.example", target_dir / ".env.example")
    shutil.copyfile(TEMPLATES_DIR / "universal-adapter" / ".env.example", target_dir / ".env")

    # 4. .gitignore
    (target_dir / ".gitignore").write_text("node_modules/\nbuild/\ndist/\n.env\n*.log\n", encoding="utf-8")

    # 5. src/index.ts
    index_template = (TEMPLATES_DIR / "universal-adapter" / "src" / "index.ts").read_text(encoding="utf-8")
    index_content = index_template.replace("universal-mcp-server", server_name)
    (src_dir / "index.ts").write_text(index_content, encoding="utf-8")

    # 6. README.md with Multi-Platform Host Configurations
    build_path_fwd = str(target_dir.resolve() / "build" / "index.js").replace(os.sep, "/")
    readme_content = f"""# {server_name} (Universal MCP Server)

Universal cross-platform Model Context Protocol (MCP) server built with TypeScript.
Supports **Claude Desktop**, **OpenAI ChatGPT (Connectors & Developer Mode)**, **Cursor**, **Windsurf**, and **VS Code**.

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build TypeScript:
   ```bash
   npm run build
   ```

3. Run locally:
   - **Stdio Mode (Claude Desktop, Cursor)**:
     ```bash
     npm start
     ```
   - **Streamable HTTP SSE Mode (ChatGPT, Remote Gateways)**:
     ```bash
     npm run start:http
     ```

## Platform Host Configurations

### 1. Anthropic Claude Desktop (`claude_desktop_config.json`)
```json
{{
  "mcpServers": {{
    "{server_name}": {{
      "command": "node",
      "args": ["{build_path_fwd}"],
      "env": {{}}
    }}
  }}
}}
```

### 2. Cursor / Windsurf (`mcp.json`)
```json
{{
  "mcpServers": {{
    "{server_name}": {{
      "command": "node",
      "args": ["{build_path_fwd}"]
    }}
  }}
}}
```

### 3. OpenAI ChatGPT (Developer Mode / Connectors)
ChatGPT **requires remote HTTPS** (no local stdio).
1. Start server in HTTP mode: `npm run start:http`
2. Expose via Cloudflare Tunnel or ngrok:
   ```bash
   ngrok http 3000
   ```
3. Register the public SSE URL in ChatGPT:
   ```
   https://<your-ngrok-subdomain>.ngrok-free.app/sse
   ```
*Note: This server includes `readOnlyHint: true` to suppress ChatGPT manual confirmation dialogs, and includes standard `search` & `fetch` tools for Deep Research / Connectors.*
"""
    (target_dir / "README.md").write_text(readme_content, encoding="utf-8")


def scaffold_gateway(target_dir: Path, server_name: str):
    target_dir.mkdir(parents=True, exist_ok=True)

    # 1. pyproject.toml
    pkg_template = (TEMPLATES_DIR / "mcp-gateway" / "pyproject.toml").read_text(encoding="utf-8")
    pkg_content = pkg_template.replace("mcp-server-template-gateway", server_name)
    (target_dir / "pyproject.toml").write_text(pkg_content, encoding="utf-8")

    # 2. server.py (Meta-Tool Pattern implementation)
    shutil.copyfile(TEMPLATES_DIR / "mcp-gateway" / "server.py", target_dir / "server.py")

    # 3. aimcpgate.yaml
    shutil.copyfile(TEMPLATES_DIR / "mcp-gateway" / "aimcpgate.yaml", target_dir / "aimcpgate.yaml")

    # 4. README.md
    shutil.copyfile(TEMPLATES_DIR / "mcp-gateway" / "README.md", target_dir / "README.md")

    # 5. .gitignore
    (target_dir / ".gitignore").write_text("__pycache__/\n.venv/\n*.pyc\n.env\n*.log\n", encoding="utf-8")


def scaffold_ts_stdio(target_dir: Path, server_name: str, platform: str):
    src_dir = target_dir / "src"
    src_dir.mkdir(parents=True, exist_ok=True)

    pkg_template = (TEMPLATES_DIR / "typescript-stdio" / "package.json").read_text(encoding="utf-8")
    pkg_content = pkg_template.replace("mcp-server-template-stdio", server_name)
    (target_dir / "package.json").write_text(pkg_content, encoding="utf-8")

    shutil.copyfile(TEMPLATES_DIR / "typescript-stdio" / "tsconfig.json", target_dir / "tsconfig.json")
    shutil.copyfile(TEMPLATES_DIR / "typescript-stdio" / ".env.example", target_dir / ".env.example")
    shutil.copyfile(TEMPLATES_DIR / "typescript-stdio" / ".env.example", target_dir / ".env")
    (target_dir / ".gitignore").write_text("node_modules/\nbuild/\ndist/\n.env\n*.log\n", encoding="utf-8")

    index_template = (TEMPLATES_DIR / "typescript-stdio" / "src" / "index.ts").read_text(encoding="utf-8")
    index_content = index_template.replace("production-stdio-server", server_name)
    (src_dir / "index.ts").write_text(index_content, encoding="utf-8")

    build_path_fwd = str(target_dir.resolve() / 'build' / 'index.js').replace(os.sep, '/')
    readme_content = f"""# {server_name} (MCP Server)

Production-grade Model Context Protocol (MCP) server built with TypeScript and Stdio transport.
Target Platform: {platform.capitalize()}

## Quick Start

1. Install dependencies: `npm install`
2. Build TypeScript: `npm run build`
3. Test with MCP Inspector: `npm run inspector`

## Host Configuration

### Claude Desktop (`claude_desktop_config.json`)
```json
{{
  "mcpServers": {{
    "{server_name}": {{
      "command": "node",
      "args": ["{build_path_fwd}"],
      "env": {{}}
    }}
  }}
}}
```
"""
    (target_dir / "README.md").write_text(readme_content, encoding="utf-8")


def scaffold_ts_http(target_dir: Path, server_name: str, platform: str):
    src_dir = target_dir / "src"
    src_dir.mkdir(parents=True, exist_ok=True)

    pkg_template = (TEMPLATES_DIR / "typescript-http" / "package.json").read_text(encoding="utf-8")
    pkg_content = pkg_template.replace("mcp-server-template-http", server_name)
    (target_dir / "package.json").write_text(pkg_content, encoding="utf-8")

    shutil.copyfile(TEMPLATES_DIR / "typescript-http" / "tsconfig.json", target_dir / "tsconfig.json")
    shutil.copyfile(TEMPLATES_DIR / "typescript-http" / ".env.example", target_dir / ".env.example")
    shutil.copyfile(TEMPLATES_DIR / "typescript-http" / ".env.example", target_dir / ".env")
    (target_dir / ".gitignore").write_text("node_modules/\nbuild/\ndist/\n.env\n*.log\n", encoding="utf-8")

    index_template = (TEMPLATES_DIR / "typescript-http" / "src" / "index.ts").read_text(encoding="utf-8")
    index_content = index_template.replace("production-http-server", server_name)
    (src_dir / "index.ts").write_text(index_content, encoding="utf-8")


def scaffold_py_stdio(target_dir: Path, server_name: str):
    target_dir.mkdir(parents=True, exist_ok=True)

    pyproject_template = (TEMPLATES_DIR / "python-stdio" / "pyproject.toml").read_text(encoding="utf-8")
    pyproject_content = pyproject_template.replace("mcp-server-template-python", server_name)
    (target_dir / "pyproject.toml").write_text(pyproject_content, encoding="utf-8")

    server_template = (TEMPLATES_DIR / "python-stdio" / "server.py").read_text(encoding="utf-8")
    server_content = server_template.replace("production-python-server", server_name)
    (target_dir / "server.py").write_text(server_content, encoding="utf-8")

    (target_dir / ".gitignore").write_text("__pycache__/\n.venv/\n*.pyc\n.env\n*.log\n", encoding="utf-8")
    (target_dir / ".env.example").write_text("LOG_LEVEL=INFO\n", encoding="utf-8")
    (target_dir / ".env").write_text("LOG_LEVEL=INFO\n", encoding="utf-8")


def scaffold_private_api(target_dir: Path, server_name: str):
    scaffold_ts_stdio(target_dir, server_name, "universal")
    src_dir = target_dir / "src"
    shutil.copyfile(TEMPLATES_DIR / "private-api" / "src" / "portalClient.ts", src_dir / "portalClient.ts")
    
    env_extra = "\nPORTAL_BASE_URL=https://portal.example.com\nPORTAL_USERNAME=admin\nPORTAL_PASSWORD=secret\n"
    with open(target_dir / ".env.example", "a", encoding="utf-8") as f:
        f.write(env_extra)
    with open(target_dir / ".env", "a", encoding="utf-8") as f:
        f.write(env_extra)


def scaffold_browser(target_dir: Path, server_name: str):
    scaffold_ts_stdio(target_dir, server_name, "universal")
    src_dir = target_dir / "src"
    shutil.copyfile(TEMPLATES_DIR / "browser-automation" / "src" / "browserTool.ts", src_dir / "browserTool.ts")
    
    pkg_path = target_dir / "package.json"
    content = pkg_path.read_text(encoding="utf-8")
    content = content.replace('"zod": "^3.24.2"', '"zod": "^3.24.2",\n    "puppeteer": "^22.0.0"')
    pkg_path.write_text(content, encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description="Scaffold a production-ready MCP Server project")
    parser.add_argument("--name", required=True, help="Name of the MCP server (e.g. weather-mcp)")
    parser.add_argument("--type", required=True, choices=list(VALID_TYPES.keys()), help="Server architecture archetype")
    parser.add_argument("--platform", default="universal", choices=PLATFORMS, help="Target AI platform (claude, chatgpt, vibe, cursor, universal, etc.)")
    parser.add_argument("--out", required=True, help="Target output directory")

    args = parser.parse_args()
    target = Path(args.out).resolve()

    print(f"[+] Scaffolding MCP Server: '{args.name}'")
    print(f"[+] Archetype: {VALID_TYPES[args.type]}")
    print(f"[+] Target Platform: {args.platform.capitalize()}")
    print(f"[+] Target Directory: {target}")

    if args.type == "universal":
        scaffold_universal(target, args.name, args.platform)
    elif args.type == "gateway":
        scaffold_gateway(target, args.name)
    elif args.type == "ts-stdio":
        scaffold_ts_stdio(target, args.name, args.platform)
    elif args.type == "ts-http":
        scaffold_ts_http(target, args.name, args.platform)
    elif args.type == "py-stdio":
        scaffold_py_stdio(target, args.name)
    elif args.type == "private-api":
        scaffold_private_api(target, args.name)
    elif args.type == "browser":
        scaffold_browser(target, args.name)

    print(f"\n[SUCCESS] Project '{args.name}' generated at {target}")
    print("\nNext steps:")
    if args.type in ("universal", "ts-stdio", "ts-http", "private-api", "browser"):
        print(f"  cd {target}")
        print("  npm install")
        print("  npm run build")
        if args.type == "universal":
            print("  npm start        # For Claude Desktop / Cursor (Stdio)")
            print("  npm run start:http # For ChatGPT / Remote (HTTP SSE)")
        else:
            print("  npm run inspector")
    elif args.type in ("py-stdio", "gateway"):
        print(f"  cd {target}")
        print("  pip install -e .")
        print("  python server.py")


if __name__ == "__main__":
    main()
