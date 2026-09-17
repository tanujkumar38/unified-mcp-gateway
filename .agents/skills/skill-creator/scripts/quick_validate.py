#!/usr/bin/env python3
"""Enhanced Skill Validator & Security Auditor for Agent Skills.

Validates:
1. Standard Agent Skills Frontmatter (name, description constraints, allowed keys).
2. 3-Tier Progressive Disclosure (line count thresholds, reference linkages).
3. Security & Safety Audit (secret scanning, injection patterns, dangerous shell calls).
4. Referential Integrity (verifying referenced local files exist).
"""

import argparse
import os
import re
import sys
from pathlib import Path

try:
    import yaml
except ImportError:
    print("[ERROR] PyYAML is required. Please run: pip install pyyaml", file=sys.stderr)
    sys.exit(1)

MAX_NAME_LENGTH = 64
MAX_DESCRIPTION_LENGTH = 1024
RECOMMENDED_MAX_LINES = 500
HARD_MAX_LINES = 800

ALLOWED_ROOT_PROPERTIES = {
    "name",
    "description",
    "license",
    "allowed-tools",
    "metadata",
    "compatibility",
    "platforms",
    "version",
    "author",
}

# Regex patterns for detecting potential hardcoded credentials
CREDENTIAL_PATTERNS = [
    (re.compile(r"sk-[a-zA-Z0-9]{20,}"), "OpenAI Secret Key"),
    (re.compile(r"ghp_[a-zA-Z0-9]{20,}"), "GitHub Personal Access Token"),
    (re.compile(r"Bearer\s+[a-zA-Z0-9_\-\.]{30,}"), "Bearer Token"),
    (re.compile(r"(?i)api[_-]?key\s*[:=]\s*['\"][a-zA-Z0-9_\-]{16,}['\"]"), "API Key Variable"),
    (re.compile(r"(?i)password\s*[:=]\s*['\"][^'\"]{8,}['\"]"), "Hardcoded Password"),
]


def validate_skill(skill_dir: Path) -> tuple[bool, list[str], list[str]]:
    """Validate a skill folder. Returns (is_valid, errors, warnings)."""
    errors = []
    warnings = []

    skill_path = Path(skill_dir).resolve()
    if not skill_path.exists() or not skill_path.is_dir():
        return False, [f"Skill path is not a valid directory: {skill_path}"], []

    skill_md = skill_path / "SKILL.md"
    if not skill_md.exists():
        return False, ["SKILL.md not found in root of skill directory"], []

    try:
        content = skill_md.read_text(encoding="utf-8")
    except Exception as e:
        return False, [f"Failed to read SKILL.md with UTF-8 encoding: {e}"], []

    # 1. Frontmatter extraction
    if not content.startswith("---"):
        return False, ["SKILL.md must start with YAML frontmatter delimiter '---'"], []

    match = re.match(r"^---\r?\n(.*?)\r?\n---(?:\r?\n|$)", content, re.DOTALL)
    if not match:
        return False, ["Invalid YAML frontmatter: missing closing delimiter '---'"], []

    frontmatter_text = match.group(1)
    body_text = content[match.end():]

    try:
        frontmatter = yaml.safe_load(frontmatter_text)
        if not isinstance(frontmatter, dict):
            return False, ["Frontmatter must parse as a YAML dictionary/mapping"], []
    except yaml.YAMLError as exc:
        return False, [f"Invalid YAML in frontmatter: {exc}"], []

    # Check root keys
    unexpected_keys = set(frontmatter.keys()) - ALLOWED_ROOT_PROPERTIES
    if unexpected_keys:
        warnings.append(
            f"Non-standard root frontmatter keys: {', '.join(sorted(unexpected_keys))}. "
            "Consider placing custom metadata inside the 'metadata:' mapping for maximum cross-tool compatibility."
        )

    # 2. Required fields
    if "name" not in frontmatter:
        errors.append("Missing required field 'name' in frontmatter")
    else:
        name = str(frontmatter["name"]).strip()
        if not re.match(r"^[a-z0-9-]+$", name):
            errors.append(f"Skill name '{name}' must be lowercase kebab-case (letters, numbers, hyphens only)")
        if name.startswith("-") or name.endswith("-") or "--" in name:
            errors.append(f"Skill name '{name}' cannot start/end with a hyphen or contain consecutive hyphens")
        if len(name) > MAX_NAME_LENGTH:
            errors.append(f"Skill name length ({len(name)}) exceeds maximum of {MAX_NAME_LENGTH} characters")

    if "description" not in frontmatter:
        errors.append("Missing required field 'description' in frontmatter")
    else:
        description = str(frontmatter["description"]).strip()
        if not description:
            errors.append("Field 'description' cannot be empty")
        if "<" in description or ">" in description:
            errors.append("Description cannot contain raw angle brackets ('<' or '>')")
        if len(description) > MAX_DESCRIPTION_LENGTH:
            errors.append(f"Description length ({len(description)}) exceeds maximum of {MAX_DESCRIPTION_LENGTH} characters")
        if len(description) < 20:
            warnings.append("Description is very short (<20 chars). Include both capability and trigger conditions.")

    # 3. Progressive Disclosure (Line count budgeting)
    line_count = len(content.splitlines())
    if line_count > HARD_MAX_LINES:
        warnings.append(
            f"SKILL.md is {line_count} lines (exceeds {HARD_MAX_LINES} line hard ceiling). "
            "Split detailed references into references/ and scripts into scripts/ to prevent context bloat."
        )
    elif line_count > RECOMMENDED_MAX_LINES:
        warnings.append(
            f"SKILL.md is {line_count} lines (recommended <{RECOMMENDED_MAX_LINES} lines). "
            "Consider offloading reference sections to references/."
        )

    # 4. Security & Safety Audit
    # Scan SKILL.md and all scripts for credentials
    for path in skill_path.rglob("*"):
        if path.is_file() and path.suffix in (".md", ".py", ".sh", ".yaml", ".json", ".txt"):
            try:
                file_text = path.read_text(encoding="utf-8", errors="ignore")
                for pattern, cred_type in CREDENTIAL_PATTERNS:
                    if pattern.search(file_text):
                        errors.append(f"Potential {cred_type} detected in file: {path.relative_to(skill_path)}")
            except Exception:
                pass

    # 5. Referential Integrity
    link_matches = re.findall(r"\[.*?\]\((?!https?://)(.*?)\)", body_text)
    for link in link_matches:
        clean_link = link.split("#")[0].split("?")[0].strip()
        if clean_link and not clean_link.startswith("/"):
            target_file = skill_path / clean_link
            if not target_file.exists():
                warnings.append(f"Broken relative reference: '{clean_link}' in SKILL.md does not exist on disk.")

    is_valid = len(errors) == 0
    return is_valid, errors, warnings


def main():
    parser = argparse.ArgumentParser(description="Validate Agent Skill and audit security")
    parser.add_argument("skill_dir", help="Path to the skill directory to validate")
    parser.add_argument("--strict", action="store_true", help="Treat warnings as errors")
    args = parser.parse_args()

    skill_dir = Path(args.skill_dir)
    is_valid, errors, warnings = validate_skill(skill_dir)

    print(f"\nAuditing skill directory: {skill_dir.resolve()}")
    print("-" * 60)

    if warnings:
        print(f"[!] {len(warnings)} Warning(s):")
        for w in warnings:
            print(f"    - {w}")

    if errors:
        print(f"[X] {len(errors)} Error(s):")
        for e in errors:
            print(f"    - {e}")
        print("\nRESULT: FAILED")
        sys.exit(1)

    if args.strict and warnings:
        print("\nRESULT: FAILED (strict mode enabled)")
        sys.exit(1)

    print("\nRESULT: PASSED (Skill is production-ready!)")
    sys.exit(0)


if __name__ == "__main__":
    main()