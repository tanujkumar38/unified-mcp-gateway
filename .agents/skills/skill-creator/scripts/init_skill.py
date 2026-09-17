#!/usr/bin/env python3
"""Unified Multi-Archetype Skill Initializer for AI Agents.

Supports the open Agent Skills standard (SKILL.md) with three archetypes:
1. workflow: Procedural orchestration / workflow distillation (instruction-focused).
2. cli-tool: Programmatic / API integration (bundled Python CLI helper script).
3. hybrid: Enterprise capability with scripts, references, assets, and evals.

Usage:
    init_skill.py <skill-name> --path <target-dir> [--archetype workflow|cli-tool|hybrid]
                  [--resources scripts,references,assets,evals]
                  [--interface display_name="...",short_description="..."]
"""

import argparse
import os
import re
import sys
from pathlib import Path

try:
    from .generate_openai_yaml import write_openai_yaml
except ImportError:
    try:
        from generate_openai_yaml import write_openai_yaml
    except ImportError:
        write_openai_yaml = None

MAX_SKILL_NAME_LENGTH = 64
ALLOWED_RESOURCES = {"scripts", "references", "assets", "evals"}


def normalize_skill_name(skill_name: str) -> str:
    """Normalize a skill name to lowercase kebab-case."""
    normalized = skill_name.strip().lower()
    normalized = re.sub(r"[^a-z0-9]+", "-", normalized)
    normalized = normalized.strip("-")
    normalized = re.sub(r"-{2,}", "-", normalized)
    return normalized


def title_from_name(name: str) -> str:
    """Generate human-readable title from kebab-case name."""
    return " ".join(word.capitalize() for word in name.split("-"))


SKILL_WORKFLOW_TEMPLATE = """---
name: {skill_name}
description: "[TODO: Actionable capability description. Explain what the skill accomplishes and explicit trigger phrases/contexts when the agent should apply it.]"
metadata:
  version: "0.1.0"
  author: "User, AI Agent"
  license: "MIT"
  platforms: ["linux", "macos", "windows"]
  tags: ["workflow", "{skill_name}"]
---

# {skill_title}

## Overview
Brief 2-3 sentence overview of what this skill accomplishes and the problem it solves.

## When to Use
- Trigger scenario 1: When the user asks to...
- Trigger scenario 2: When encountering files or tasks involving...
- **Don't use for:** Scenarios where another tool or general reasoning is better suited.

## Prerequisites
- Required tools, API credentials, or environment access.
- Expected input format and preconditions.

## Procedure
1. **Step 1: Discovery & Validation**
   - Inspect input parameters and confirm preconditions.
   - *Completion criterion:* Inputs validated against expected schema.

2. **Step 2: Core Execution**
   - Perform the primary workflow task.
   - Follow systematic steps and handle known variations.

3. **Step 3: Verification & Output Delivery**
   - Verify output integrity and format response according to guidelines.

## Verification
- How to verify that the workflow succeeded (e.g. check output file, test assertion).

## Pitfalls & Common Mistakes
- Known failure mode 1 and how to avoid it.
- Known failure mode 2 and recovery procedure.
"""

SKILL_CLI_TEMPLATE = """---
name: {skill_name}
description: "[TODO: Concise capability description. Explain what CLI commands this skill provides and when to invoke it.]"
metadata:
  version: "0.1.0"
  author: "User, AI Agent"
  license: "MIT"
  platforms: ["linux", "macos", "windows"]
  tags: ["tool", "cli", "{skill_name}"]
---

# {skill_title}

## Overview
Provides deterministic CLI operations for {skill_title}.

## Quick Start
Run commands through the CLI helper script. All operations write structured JSON to `--output` files to conserve context window.

```bash
python scripts/{script_name}.py search --query "example" --output results.json
```

## Available Subcommands

### 1. `search`
Searches entities or records.
- Syntax: `python scripts/{script_name}.py search --query <str> --limit <int> --output <file.json>`
- Output format: JSON array of matching records.

### 2. `fetch`
Retrieves full details for a specific entity.
- Syntax: `python scripts/{script_name}.py fetch --id <str> --output <file.json>`

## Error Handling & Rate Limiting
- The script automatically handles HTTP 429 with exponential backoff.
- On non-zero exit code, inspect the stderr message for the detailed upstream error response.
"""

CLI_SCRIPT_BOILERPLATE = """#!/usr/bin/env python3
\"\"\"Deterministic CLI Helper for {skill_name}.
Stdlib-only, file-redirected JSON output, cross-platform rate-limiting.
\"\"\"

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


def save_output(data, output_file: str):
    out_path = Path(output_file).resolve()
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"SUCCESS: Output written to {{out_path}}")


def main():
    parser = argparse.ArgumentParser(description="{skill_title} Helper CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # Subcommand: search
    p_search = subparsers.add_parser("search", help="Execute search")
    p_search.add_argument("--query", required=True, help="Search query")
    p_search.add_argument("--limit", type=int, default=10, help="Max records")
    p_search.add_argument("--output", required=True, help="Output JSON path")

    # Subcommand: fetch
    p_fetch = subparsers.add_parser("fetch", help="Fetch record by ID")
    p_fetch.add_argument("--id", required=True, help="Record ID")
    p_fetch.add_argument("--output", required=True, help="Output JSON path")

    args = parser.parse_args()

    if args.command == "search":
        result = {{"query": args.query, "results": []}}
        save_output(result, args.output)
    elif args.command == "fetch":
        result = {{"id": args.id, "details": {{}}}}
        save_output(result, args.output)


if __name__ == "__main__":
    main()
"""

EVALS_JSON_BOILERPLATE = """{{
  "skill_name": "{skill_name}",
  "evals": [
    {{
      "id": 0,
      "name": "basic-functional-test",
      "prompt": "Test query for {skill_name}",
      "expected_output": "Expected results description",
      "files": [],
      "assertions": [
        {{
          "name": "output-file-created",
          "description": "Checks that the expected artifact was produced",
          "type": "file_exists"
        }}
      ]
    }}
  ]
}}
"""


def init_skill(
    skill_name: str,
    target_path: Path,
    archetype: str = "workflow",
    resources: set = None,
    interface_overrides: list = None,
) -> Path:
    normalized_name = normalize_skill_name(skill_name)
    if len(normalized_name) > MAX_SKILL_NAME_LENGTH:
        raise ValueError(f"Skill name '{normalized_name}' exceeds maximum length of {MAX_SKILL_NAME_LENGTH}")

    skill_dir = target_path / normalized_name
    skill_dir.mkdir(parents=True, exist_ok=True)
    skill_title = title_from_name(normalized_name)
    script_name = f"{normalized_name.replace('-', '_')}_helper"

    # Select SKILL.md template
    if archetype == "cli-tool":
        skill_content = SKILL_CLI_TEMPLATE.format(
            skill_name=normalized_name,
            skill_title=skill_title,
            script_name=script_name,
        )
    else:
        skill_content = SKILL_WORKFLOW_TEMPLATE.format(
            skill_name=normalized_name,
            skill_title=skill_title,
        )

    skill_md_path = skill_dir / "SKILL.md"
    skill_md_path.write_text(skill_content, encoding="utf-8")

    # Resource folders
    if resources is None:
        resources = set()

    if archetype in ("cli-tool", "hybrid"):
        resources.add("scripts")
        resources.add("references")
    if archetype == "hybrid":
        resources.add("assets")
        resources.add("evals")

    for res in resources:
        res_dir = skill_dir / res
        res_dir.mkdir(parents=True, exist_ok=True)

        if res == "scripts":
            script_file = res_dir / f"{script_name}.py"
            if not script_file.exists():
                script_file.write_text(
                    CLI_SCRIPT_BOILERPLATE.format(
                        skill_name=normalized_name,
                        skill_title=skill_title,
                    ),
                    encoding="utf-8",
                )
        elif res == "references":
            ref_file = res_dir / "reference.md"
            if not ref_file.exists():
                ref_file.write_text(f"# Reference Documentation for {skill_title}\n\nDetailed operational context.\n", encoding="utf-8")
        elif res == "assets":
            asset_file = res_dir / "template.md"
            if not asset_file.exists():
                asset_file.write_text(f"# Template Asset for {skill_title}\n", encoding="utf-8")
        elif res == "evals":
            evals_file = res_dir / "evals.json"
            if not evals_file.exists():
                evals_file.write_text(
                    EVALS_JSON_BOILERPLATE.format(skill_name=normalized_name),
                    encoding="utf-8",
                )

    # Optional OpenAI Codex integration
    if write_openai_yaml and interface_overrides is not None:
        try:
            write_openai_yaml(skill_dir, normalized_name, interface_overrides)
        except Exception as e:
            print(f"[WARN] Could not generate openai.yaml: {e}", file=sys.stderr)

    print(f"[OK] Successfully initialized {archetype} skill at: {skill_dir}")
    return skill_dir


def main():
    parser = argparse.ArgumentParser(description="Initialize a new Agent Skill")
    parser.add_argument("skill_name", help="Name of the skill (e.g. my-awesome-skill)")
    parser.add_argument("--path", required=True, help="Target parent directory where skill folder will be created")
    parser.add_argument(
        "--archetype",
        choices=["workflow", "cli-tool", "hybrid"],
        default="workflow",
        help="Skill archetype: workflow (procedural), cli-tool (script-backed), hybrid (full suite)",
    )
    parser.add_argument(
        "--resources",
        help="Comma-separated optional resources to include (scripts, references, assets, evals)",
    )
    parser.add_argument(
        "--interface",
        action="append",
        default=[],
        help="OpenAI interface overrides key=value (e.g. display_name='My Skill')",
    )

    args = parser.parse_args()

    resources = set()
    if args.resources:
        for r in args.resources.split(","):
            r = r.strip().lower()
            if r in ALLOWED_RESOURCES:
                resources.add(r)

    target_path = Path(args.path).resolve()
    init_skill(
        args.skill_name,
        target_path,
        archetype=args.archetype,
        resources=resources,
        interface_overrides=args.interface,
    )


if __name__ == "__main__":
    main()
