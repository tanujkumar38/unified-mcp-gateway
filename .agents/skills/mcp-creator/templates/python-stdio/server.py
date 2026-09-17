#!/usr/bin/env python3
"""
Production-Grade Python Model Context Protocol (MCP) Server
Powered by FastMCP from the official MCP Python SDK.

CRITICAL RULE FOR STDIO:
STDOUT is strictly reserved for JSON-RPC 2.0 messages.
NEVER use print() without file=sys.stderr.
Configure the logging module to output to sys.stderr exclusively.
"""

import sys
import logging
import os
from typing import Optional
from dotenv import load_dotenv
from mcp.server.fastmcp import FastMCP

# Load environment variables
load_dotenv()

# Configure logging strictly to sys.stderr
logging.basicConfig(
    stream=sys.stderr,
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] %(message)s"
)
logger = logging.getLogger("mcp-python-server")

# Initialize FastMCP Server
mcp = FastMCP("production-python-server")


@mcp.tool()
def calculate_hash(text: str, algorithm: str = "sha256") -> str:
    """Computes a cryptographic hash of the input text string.

    Args:
        text: The source string to hash.
        algorithm: Hash algorithm ('sha256' or 'md5'). Defaults to 'sha256'.
    """
    import hashlib

    logger.info(f"Computing {algorithm} hash for input string of length {len(text)}")
    algo = algorithm.lower().strip()
    if algo == "sha256":
        return hashlib.sha256(text.encode("utf-8")).hexdigest()
    elif algo == "md5":
        return hashlib.md5(text.encode("utf-8")).hexdigest()
    else:
        raise ValueError(f"Unsupported hash algorithm: {algorithm}. Use 'sha256' or 'md5'.")


@mcp.resource("system://diagnostics")
def get_system_diagnostics() -> str:
    """Reads system environment diagnostics and Python runtime status."""
    import platform
    import json

    logger.info("Reading system diagnostics resource")
    diagnostics = {
        "python_version": platform.python_version(),
        "os": platform.system(),
        "release": platform.release(),
        "arch": platform.machine(),
    }
    return json.dumps(diagnostics, indent=2)


@mcp.prompt()
def summarize_text_prompt(document: str) -> str:
    """Generates an evaluation prompt for summarizing an uploaded document."""
    return f"Please provide a structured 3-bullet summary of the following document:\n\n{document}"


def main():
    logger.info("Starting Python MCP server over stdio transport...")
    mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
