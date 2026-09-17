#!/usr/bin/env python3
"""Cross-Platform CLI Script Template for Agent Skills.

Design Principles:
1. Standard Library Only: Zero third-party dependencies (urllib, json, argparse, sys, time, os, pathlib).
2. Subcommand Routing: Each discrete workflow step corresponds to a dedicated CLI subcommand.
3. File-Redirected Output: Stdout stays brief (<10 lines); full structured results stream to --output JSON.
4. Robust Rate Limiting: Respects upstream API ceilings, implements exponential backoff on HTTP 429/5xx.
5. Cross-Platform Concurrency: Atomic file-locking via tempfile locks ensures safe multi-agent execution on Windows, macOS, Linux.
"""

import argparse
import json
import os
import sys
import tempfile
import time
from pathlib import Path
from urllib import error as urllib_error
from urllib import parse as urllib_parse
from urllib import request as urllib_request


class RateLimitError(Exception):
    """Raised when an API rate limit is exceeded after retries."""


class CrossPlatformFileLock:
    """Simple atomic lockfile implementation working across Windows, macOS, and Linux."""

    def __init__(self, lock_name: str, timeout_seconds: float = 30.0):
        temp_dir = Path(tempfile.gettempdir())
        self.lock_path = temp_dir / f"agent_lock_{lock_name}.lock"
        self.timeout = timeout_seconds
        self._fd = None

    def acquire(self):
        start_time = time.monotonic()
        while True:
            try:
                # O_EXCL | O_CREAT is atomic on both POSIX and Windows NT
                self._fd = os.open(str(self.lock_path), os.O_CREAT | os.O_EXCL | os.O_RDWR)
                return self
            except FileExistsError:
                # Check for stale lock (older than 60 seconds)
                try:
                    mtime = self.lock_path.stat().st_mtime
                    if time.time() - mtime > 60.0:
                        try:
                            self.lock_path.unlink()
                        except OSError:
                            pass
                except OSError:
                    pass

                if time.monotonic() - start_time > self.timeout:
                    raise TimeoutError(f"Could not acquire lock on {self.lock_path} within {self.timeout}s")
                time.sleep(0.05)

    def release(self):
        if self._fd is not None:
            try:
                os.close(self._fd)
            except OSError:
                pass
            self._fd = None
        try:
            if self.lock_path.exists():
                self.lock_path.unlink()
        except OSError:
            pass

    def __enter__(self):
        return self.acquire()

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.release()


class APIClient:
    """Standardized API client with rate-limiting, error parsing, and exponential backoff."""

    BASE_URL = "https://api.example.com/v1"
    REQUESTS_PER_SECOND = 5.0

    def __init__(self, base_url: str = None, rps: float = None):
        if base_url:
            self.BASE_URL = base_url.rstrip("/")
        if rps:
            self.REQUESTS_PER_SECOND = rps
        self.delay = 1.0 / max(self.REQUESTS_PER_SECOND, 0.1)
        self.last_request_time = 0.0

    def _wait_for_rate_limit(self):
        elapsed = time.monotonic() - self.last_request_time
        if elapsed < self.delay:
            time.sleep(self.delay - elapsed)

    def request(self, path: str, params: dict = None, headers: dict = None, retries: int = 4) -> dict:
        """Execute rate-limited HTTP GET request with retries and actionable error extraction."""
        url = f"{self.BASE_URL}{path}"
        if params:
            url = f"{url}?{urllib_parse.urlencode(params)}"

        req_headers = {"Accept": "application/json", "User-Agent": "AgentSkill/1.0"}
        if headers:
            req_headers.update(headers)

        for attempt in range(retries):
            # Synchronize with lock for concurrent subagents on same machine
            with CrossPlatformFileLock("apiclient_ratelimit"):
                self._wait_for_rate_limit()
                self.last_request_time = time.monotonic()

            try:
                req = urllib_request.Request(url, headers=req_headers)
                with urllib_request.urlopen(req, timeout=30) as resp:
                    raw_data = resp.read().decode("utf-8")
                    return json.loads(raw_data)
            except urllib_error.HTTPError as e:
                if e.code == 429:
                    wait = 2 ** (attempt + 1)
                    print(
                        f"[WARN] HTTP 429 Rate limited. Retrying in {wait}s (attempt {attempt + 1}/{retries})...",
                        file=sys.stderr,
                    )
                    if attempt == retries - 1:
                        raise RateLimitError(
                            f"HTTP 429 Too Many Requests from {self.BASE_URL}. Rate limit ({self.REQUESTS_PER_SECOND} req/s) exceeded."
                        ) from e
                    time.sleep(wait)
                    continue
                elif e.code >= 500:
                    wait = 2**attempt
                    print(
                        f"[WARN] HTTP {e.code} Server error. Retrying in {wait}s (attempt {attempt + 1}/{retries})...",
                        file=sys.stderr,
                    )
                    if attempt == retries - 1:
                        raise RuntimeError(f"Server error {e.code} from {url} after {retries} retries.") from e
                    time.sleep(wait)
                    continue
                else:
                    # Client errors (400, 403, 404, etc.) - extract detailed server message
                    try:
                        err_body = e.read().decode("utf-8", errors="replace")[:1000]
                    except Exception:
                        err_body = str(e.reason)
                    raise RuntimeError(f"HTTP {e.code} client error from {url}: {err_body}") from e
            except urllib_error.URLError as e:
                if attempt == retries - 1:
                    raise RuntimeError(f"Failed to connect to {url} after {retries} attempts: {e}") from e
                time.sleep(2**attempt)

        raise RuntimeError(f"Request to {url} failed unexpectedly.")


def save_output(data, output_path: str):
    """Write structured payload to output file with safety checks."""
    path = Path(output_path).resolve()
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"SUCCESS: Output written to {path}")


def main():
    parser = argparse.ArgumentParser(description="Deterministic Helper Script for Skill")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # Subcommand: search
    p_search = subparsers.add_parser("search", help="Execute search query")
    p_search.add_argument("--query", required=True, help="Search query parameter")
    p_search.add_argument("--limit", type=int, default=20, help="Maximum number of records to return")
    p_search.add_argument("--output", required=True, help="Path to write JSON output")

    # Subcommand: fetch
    p_fetch = subparsers.add_parser("fetch", help="Fetch specific entity details")
    p_fetch.add_argument("--id", required=True, help="Unique identifier of entity")
    p_fetch.add_argument("--output", required=True, help="Path to write JSON output")

    args = parser.parse_args()
    client = APIClient()

    try:
        if args.command == "search":
            result = client.request("/search", params={"q": args.query, "limit": args.limit})
        elif args.command == "fetch":
            result = client.request(f"/items/{args.id}")
        else:
            parser.print_help()
            sys.exit(1)

        save_output(result, args.output)
    except Exception as err:
        print(f"ERROR: {err}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
