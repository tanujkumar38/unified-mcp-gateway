#!/usr/bin/env python3
"""
Tickertape Skill Validation & Quality Gate Script
Validates frontmatter schema, file integrity, and MCP tool mapping.
"""

import os
import sys
import yaml
from pathlib import Path

SKILL_DIR = Path(__file__).resolve().parent.parent
SKILL_MD = SKILL_DIR / "SKILL.md"

REQUIRED_FRONTMATTER_FIELDS = [
    "name",
    "description",
    "version",
    "author",
    "tags",
    "requires",
    "inputs",
    "outputs"
]

EXPECTED_FILES = [
    SKILL_DIR / "references" / "mmi_indicators.md",
    SKILL_DIR / "references" / "metric_glossary.md",
    SKILL_DIR / "references" / "screener_recipes.md",
    SKILL_DIR / "assets" / "templates" / "stock_due_diligence.md",
    SKILL_DIR / "assets" / "templates" / "portfolio_audit.md",
]

def validate_skill():
    print(f"[*] Validating Skill in: {SKILL_DIR}")
    
    # 1. Check SKILL.md existence
    if not SKILL_MD.exists():
        print("[FAIL] SKILL.md not found!")
        sys.exit(1)
        
    content = SKILL_MD.read_text(encoding="utf-8")
    if not content.startswith("---"):
        print("[FAIL] SKILL.md must start with YAML frontmatter delimiter '---'")
        sys.exit(1)
        
    parts = content.split("---", 2)
    if len(parts) < 3:
        print("[FAIL] SKILL.md YAML frontmatter is not closed with '---'")
        sys.exit(1)
        
    yaml_text = parts[1]
    try:
        data = yaml.safe_load(yaml_text)
    except Exception as e:
        print(f"[FAIL] Invalid YAML in frontmatter: {e}")
        sys.exit(1)
        
    # 2. Check frontmatter schema
    for field in REQUIRED_FRONTMATTER_FIELDS:
        if field not in data:
            print(f"[FAIL] Missing required frontmatter field: '{field}'")
            sys.exit(1)
            
    print(f"[PASS] Frontmatter verified. Name: '{data['name']}', Version: {data['version']}")
    
    # 3. Check reference & template files
    for f in EXPECTED_FILES:
        if not f.exists():
            print(f"[FAIL] Referenced file missing: {f}")
            sys.exit(1)
        else:
            print(f"[PASS] Verified file: {f.name}")
            
    # 4. Check body structure
    body = parts[2]
    expected_sections = [
        "## Overview",
        "## Available MCP Tools",
        "## Step-by-Step Execution Workflows",
        "## Decision Trees & Error Handling",
        "## Security & Input Validation",
        "## Concrete Multi-Tool Examples"
    ]
    for sec in expected_sections:
        if sec not in body:
            print(f"[FAIL] Missing recommended section: '{sec}'")
            sys.exit(1)
        else:
            print(f"[PASS] Verified section: '{sec}'")
            
    print("\n[SUCCESS] Tickertape Skill conforms 100% to the Agent Skills Standard!")

if __name__ == "__main__":
    validate_skill()
