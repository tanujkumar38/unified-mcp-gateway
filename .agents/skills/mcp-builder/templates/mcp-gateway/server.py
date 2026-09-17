#!/usr/bin/env python3
"""
Context-Optimized Multi-Server MCP Gateway
Implements the Meta-Tool Pattern (uni-mcp-gateway architecture)

Instead of exposing 100+ tools directly into the LLM context (which costs 30k-70k tokens),
this gateway exposes only 4 permanent meta-tools (~1,200 tokens total):
  1. list_plugins: Discover available domains / servers
  2. search_tools: Keyword / semantic discovery across all tools
  3. get_tool_schema: Fetch exact parameters on-demand for a single tool
  4. call_tool: Dispatch execution to the upstream server
"""

import sys
import json
import logging
from typing import Dict, Any, List
from mcp.server.fastmcp import FastMCP

# Strict Stderr logging - NEVER print to stdout
logging.basicConfig(
    stream=sys.stderr,
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] %(message)s"
)

gateway = FastMCP(
    "Universal-MCP-Gateway",
    instructions="Context-optimized multi-server router and aggregator"
)

# ---------------------------------------------------------------------------
# UPSTREAM TOOL CATALOG REGISTRY
# In production, this can be dynamically populated from upstream servers
# ---------------------------------------------------------------------------
UPSTREAM_CATALOG: Dict[str, Dict[str, Any]] = {
    # GitHub plugin tools
    "github__list_repositories": {
        "plugin": "github",
        "description": "Lists repositories for an authenticated user or organization",
        "parameters": {
            "org": {"type": "string", "description": "Target organization name", "required": False},
            "limit": {"type": "integer", "description": "Max repositories to return", "default": 10},
        },
        "readOnly": True,
    },
    "github__create_issue": {
        "plugin": "github",
        "description": "Creates a new issue in a GitHub repository",
        "parameters": {
            "repo": {"type": "string", "description": "Owner/repo name", "required": True},
            "title": {"type": "string", "description": "Issue title", "required": True},
            "body": {"type": "string", "description": "Issue body content", "required": False},
        },
        "readOnly": False,
    },
    # Database plugin tools
    "db__execute_query": {
        "plugin": "postgres",
        "description": "Executes a read-only SQL query against the connected database",
        "parameters": {
            "sql": {"type": "string", "description": "SQL SELECT query to execute", "required": True},
        },
        "readOnly": True,
    },
    # Slack plugin tools
    "slack__send_channel_message": {
        "plugin": "slack",
        "description": "Posts a message to a designated Slack channel",
        "parameters": {
            "channel": {"type": "string", "description": "Target channel ID or name", "required": True},
            "message": {"type": "string", "description": "Message text", "required": True},
        },
        "readOnly": False,
    },
}

# ---------------------------------------------------------------------------
# THE 4 CORE META-TOOLS (Context Preserving)
# ---------------------------------------------------------------------------

@gateway.tool(
    name="list_plugins",
    description="Lists all active upstream plugins and service categories connected to this gateway."
)
def list_plugins() -> str:
    """Returns the list of connected upstream plugins."""
    logging.info("Listing active plugins")
    plugins = sorted(list(set(tool["plugin"] for tool in UPSTREAM_CATALOG.values())))
    return json.dumps({
        "status": "success",
        "plugins": plugins,
        "total_tools_indexed": len(UPSTREAM_CATALOG),
    }, indent=2)


@gateway.tool(
    name="search_tools",
    description="Searches all upstream tools by keyword, service name, or intent. Returns candidate tool names and descriptions."
)
def search_tools(query: str) -> str:
    """Search for relevant tools across all aggregated servers."""
    logging.info(f"Searching tools with query: '{query}'")
    query_lower = query.lower()
    matches: List[Dict[str, str]] = []

    for name, meta in UPSTREAM_CATALOG.items():
        if (
            query_lower in name.lower()
            or query_lower in meta["description"].lower()
            or query_lower in meta["plugin"].lower()
        ):
            matches.append({
                "tool_name": name,
                "plugin": meta["plugin"],
                "description": meta["description"],
                "readOnly": str(meta.get("readOnly", False)),
            })

    return json.dumps({
        "query": query,
        "matches_found": len(matches),
        "results": matches,
    }, indent=2)


@gateway.tool(
    name="get_tool_schema",
    description="Retrieves the exact parameter schema and input requirements for a specific tool on-demand."
)
def get_tool_schema(tool_name: str) -> str:
    """Returns parameter details for ONLY the requested tool."""
    logging.info(f"Retrieving schema for tool: '{tool_name}'")
    if tool_name not in UPSTREAM_CATALOG:
        return json.dumps({
            "error": f"Tool '{tool_name}' not found. Call search_tools to discover valid tool names.",
        })

    return json.dumps({
        "tool_name": tool_name,
        "schema": UPSTREAM_CATALOG[tool_name],
    }, indent=2)


@gateway.tool(
    name="call_tool",
    description="Dispatches tool execution to the appropriate upstream MCP server and returns the response."
)
def call_tool(tool_name: str, arguments: Dict[str, Any]) -> str:
    """Dispatches execution to the upstream server."""
    logging.info(f"Executing tool '{tool_name}' with args: {arguments}")
    
    if tool_name not in UPSTREAM_CATALOG:
        return json.dumps({
            "error": f"Tool '{tool_name}' does not exist in registry.",
            "isError": True,
        })

    tool_meta = UPSTREAM_CATALOG[tool_name]
    plugin = tool_meta["plugin"]

    try:
        # In a production deployment, this forwards JSON-RPC requests to the upstream process or SSE URL
        mock_result = {
            "status": "success",
            "executed_tool": tool_name,
            "plugin": plugin,
            "echo_args": arguments,
            "sample_output": f"Simulated execution of {tool_name} on {plugin} succeeded.",
        }
        return json.dumps(mock_result, indent=2)
    except Exception as e:
        logging.error(f"Upstream execution failed: {e}")
        return json.dumps({
            "error": f"Upstream error: {str(e)}",
            "isError": True,
        })


if __name__ == "__main__":
    logging.info("Starting Universal MCP Meta-Tool Gateway...")
    gateway.run(transport="stdio")
