#!/usr/bin/env python3
"""
MCP Server Stdio Protocol Verification Runner

Automates the validation of an MCP server process over stdio:
1. Spawns the server binary
2. Executes JSON-RPC 2.0 Handshake (initialize -> notifications/initialized)
3. Tests 'ping' utility
4. Tests 'tools/list' retrieval
5. Detects Stdout Pollution (checks if non-JSON log messages corrupt stdout)
6. Reports full diagnostics and error classification

Usage:
    python verify_mcp_server.py --command "node build/index.js"
    python verify_mcp_server.py --command "python server.py" --cwd "C:/path/to/server"
"""

import sys
import json
import time
import argparse
import subprocess
from typing import Optional, Dict, Any

class MCPVerifier:
    def __init__(self, command: str, cwd: Optional[str] = None, timeout_sec: float = 10.0):
        self.command = command
        self.cwd = cwd
        self.timeout_sec = timeout_sec
        self.process: Optional[subprocess.Popen] = None
        self.errors = []
        self.warnings = []

    def start_process(self):
        print(f"[*] Spawning process: '{self.command}' in cwd='{self.cwd or '.'}'")
        self.process = subprocess.Popen(
            self.command,
            cwd=self.cwd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1, # Line buffered
            shell=True
        )

    def send_line(self, data: Dict[str, Any]):
        line = json.dumps(data) + "\n"
        if not self.process or not self.process.stdin:
            raise RuntimeError("Process stdin unavailable")
        self.process.stdin.write(line)
        self.process.stdin.flush()

    def read_response(self, expected_id: Optional[int] = None) -> Dict[str, Any]:
        start = time.time()
        while time.time() - start < self.timeout_sec:
            if not self.process or not self.process.stdout:
                raise RuntimeError("Process stdout unavailable")
            
            # Check if process died
            if self.process.poll() is not None:
                stderr_out = self.process.stderr.read() if self.process.stderr else ""
                raise RuntimeError(f"Server process terminated prematurely with exit code {self.process.returncode}.\nStderr:\n{stderr_out}")

            raw_line = self.process.stdout.readline()
            if not raw_line:
                time.sleep(0.05)
                continue

            stripped = raw_line.strip()
            if not stripped:
                continue

            # Stdout pollution check: Is this valid JSON?
            try:
                parsed = json.loads(stripped)
            except json.JSONDecodeError:
                self.errors.append(f"STDOUT POLLUTION DETECTED! Non-JSON output on stdout: '{stripped}'")
                continue

            if expected_id is not None:
                if parsed.get("id") == expected_id:
                    return parsed
            else:
                return parsed

        raise TimeoutError(f"Timed out waiting for server response after {self.timeout_sec}s")

    def run_handshake(self) -> bool:
        print("[1/4] Sending JSON-RPC 'initialize' request...")
        init_req = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {
                    "tools": {},
                    "resources": {}
                },
                "clientInfo": {
                    "name": "mcp-verifier",
                    "version": "1.0.0"
                }
            }
        }
        self.send_line(init_req)
        resp = self.read_response(expected_id=1)

        if "error" in resp:
            self.errors.append(f"Initialize returned error: {resp['error']}")
            return False

        result = resp.get("result", {})
        server_info = result.get("serverInfo", {})
        capabilities = result.get("capabilities", {})
        proto_version = result.get("protocolVersion")

        print(f"    [+] Negotiated Protocol Version: {proto_version}")
        print(f"    [+] Server Name: {server_info.get('name')}, Version: {server_info.get('version')}")
        print(f"    [+] Capabilities: {list(capabilities.keys())}")

        print("[2/4] Sending 'notifications/initialized' notification...")
        self.send_line({
            "jsonrpc": "2.0",
            "method": "notifications/initialized",
            "params": {}
        })
        time.sleep(0.1)
        return True

    def test_ping(self) -> bool:
        print("[3/4] Sending 'ping' request...")
        self.send_line({
            "jsonrpc": "2.0",
            "id": 2,
            "method": "ping",
            "params": {}
        })
        resp = self.read_response(expected_id=2)
        if "error" in resp:
            self.errors.append(f"Ping returned error: {resp['error']}")
            return False
        print("    [+] Server responded to ping successfully.")
        return True

    def test_tools_list(self) -> bool:
        print("[4/4] Sending 'tools/list' request...")
        self.send_line({
            "jsonrpc": "2.0",
            "id": 3,
            "method": "tools/list",
            "params": {}
        })
        resp = self.read_response(expected_id=3)
        if "error" in resp:
            self.errors.append(f"tools/list returned error: {resp['error']}")
            return False

        tools = resp.get("result", {}).get("tools", [])
        print(f"    [+] Discovered {len(tools)} tool(s):")
        for t in tools:
            name = t.get("name")
            desc = t.get("description", "No description")
            print(f"        - {name}: {desc[:60]}...")
        return True

    def stop(self):
        if self.process:
            try:
                self.process.terminate()
                self.process.wait(timeout=2)
            except Exception:
                self.process.kill()

    def run(self) -> bool:
        try:
            self.start_process()
            if not self.run_handshake():
                return False
            if not self.test_ping():
                return False
            if not self.test_tools_list():
                return False
            return len(self.errors) == 0
        except Exception as e:
            self.errors.append(str(e))
            return False
        finally:
            self.stop()


def main():
    parser = argparse.ArgumentParser(description="Verify MCP Server Protocol Compliance over Stdio")
    parser.add_argument("--command", required=True, help="Command to run the MCP server (e.g. 'node build/index.js')")
    parser.add_argument("--cwd", default=None, help="Working directory for the server process")
    parser.add_argument("--timeout", type=float, default=10.0, help="Timeout in seconds for responses")

    args = parser.parse_args()

    print("=" * 65)
    print("      MCP SERVER STDIO PROTOCOL VERIFICATION TEST")
    print("=" * 65)

    verifier = MCPVerifier(command=args.command, cwd=args.cwd, timeout_sec=args.timeout)
    success = verifier.run()

    print("\n" + "=" * 65)
    print("                     TEST RESULTS")
    print("=" * 65)

    if sys.platform == "win32":
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass

    if success:
        print("\n[PASSED] ALL PROTOCOL CHECKS SUCCEEDED!")
        print("  [OK] Handshake (initialize -> initialized) verified")
        print("  [OK] Ping acknowledged")
        print("  [OK] Tools list received")
        print("  [OK] No stdout pollution detected (stderr logging hygiene verified)")
        sys.exit(0)
    else:
        print("\n[FAILED] PROTOCOL VERIFICATION FAILED!")
        for idx, err in enumerate(verifier.errors, 1):
            print(f"  {idx}. {err}")
        sys.exit(1)


if __name__ == "__main__":
    main()
