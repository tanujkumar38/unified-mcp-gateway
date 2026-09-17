# Multi-Server MCP Gateway Template

This template provides two battle-tested approaches for aggregating multiple Model Context Protocol (MCP) servers into a single endpoint while preventing token-hungry context window explosion.

---

## 1. The Meta-Tool Pattern (`server.py`)

When an agent is connected to 10+ MCP servers with 100+ tools, preloading all tool definitions into prompt context can consume **30,000 to 70,000 tokens** on every message.

The **Meta-Tool Pattern** reduces this footprint by **~97%** to just **~1,200 tokens**. It exposes only 4 permanent discovery and dispatch tools:

1. **`list_plugins`**: Lists available server domains/categories.
2. **`search_tools`**: Searches across all upstream tools by keyword/intent.
3. **`get_tool_schema`**: Retrieves input parameters for ONLY the chosen tool on-demand.
4. **`call_tool`**: Dispatches execution to the upstream server and returns the result.

### Running the Python Meta-Tool Gateway:
```bash
pip install "mcp>=1.0.0" pydantic
python server.py
```

---

## 2. High-Performance Go Gateway (`aimcpgate.yaml`)

For high-throughput, low-latency multiplexing of local `stdio` subprocesses and remote SSE endpoints, use `aiMCPGate` with namespaced tool isolation:

### Running `aiMCPGate`:
```bash
aimcpgate --config aimcpgate.yaml
```

The gateway listens on `http://127.0.0.1:8080/sse` and exposes namespaced tools (e.g. `github__list_repos`, `postgres__execute_query`) to your AI client.
