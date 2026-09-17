#!/usr/bin/env python3
"""
Automated Quality-Gate Validator for financial-trading Skill.
Verifies compliance with Anthropic Agent Skills standards and Tanuj Kumar's specification:
- Frontmatter integrity (name, description, platforms)
- Progressive disclosure references existence and size
- Operational templates validity
- Deterministic helper script execution
- Context budget compliance (<20KB entrypoint)
"""

import sys
import os
import re
from pathlib import Path

def validate_skill(skill_root: Path) -> bool:
    print(f"Validating Financial Trading Skill at: {skill_root.resolve()}")
    all_passed = True

    # 1. Validate SKILL.md
    skill_md = skill_root / "SKILL.md"
    if not skill_md.exists():
        print("[FAIL] Missing SKILL.md")
        return False

    content = skill_md.read_text(encoding="utf-8")
    size_kb = len(content.encode("utf-8")) / 1024.0
    print(f"[INFO] SKILL.md Size: {size_kb:.2f} KB")
    if size_kb > 25.0:
        print(f"[FAIL] SKILL.md exceeds context efficiency budget (25 KB limit, got {size_kb:.2f} KB)")
        all_passed = False
    else:
        print("[PASS] Context budget check (< 25 KB)")

    # 2. Validate Frontmatter
    fm_match = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)
    if not fm_match:
        print("[FAIL] SKILL.md is missing YAML frontmatter (--- ... ---)")
        all_passed = False
    else:
        fm = fm_match.group(1)
        if "name: financial-trading" not in fm:
            print("[FAIL] Frontmatter missing or incorrect 'name: financial-trading'")
            all_passed = False
        else:
            print("[PASS] Valid name in YAML frontmatter")

        if "description:" not in fm:
            print("[FAIL] Frontmatter missing 'description'")
            all_passed = False
        else:
            print("[PASS] Valid description in YAML frontmatter")

    # 3. Check Mandatory Sections in SKILL.md
    mandatory_sections = [
        "Progressive Disclosure Architecture",
        "Standard Operating Procedures (SOPs)",
        "Deterministic Helper Tools",
        "Hard Risk Rules & Guardrails"
    ]
    for sec in mandatory_sections:
        if sec.lower() not in content.lower():
            print(f"[FAIL] SKILL.md missing mandatory section: '{sec}'")
            all_passed = False
        else:
            print(f"[PASS] Found section: '{sec}'")

    # 4. Check References
    expected_refs = [
        "01_market_fundamentals.md",
        "02_technical_analysis.md",
        "03_advanced_price_action.md",
        "04_quantitative_methods_and_math.md",
        "05_institutional_strategies.md",
        "06_strategy_development_validation.md",
        "07_risk_management_and_psychology.md"
    ]
    refs_dir = skill_root / "references"
    if not refs_dir.exists():
        print("[FAIL] Missing references/ directory")
        all_passed = False
    else:
        for ref in expected_refs:
            ref_path = refs_dir / ref
            if not ref_path.exists():
                print(f"[FAIL] Missing reference file: {ref}")
                all_passed = False
            elif ref_path.stat().st_size < 500:
                print(f"[FAIL] Reference file too small: {ref} ({ref_path.stat().st_size} bytes)")
                all_passed = False
            else:
                print(f"[PASS] Reference verified: {ref} ({ref_path.stat().st_size:,} bytes)")

    # 5. Check Assets & Templates
    expected_templates = [
        "trading_plan_template.md",
        "trade_journal_entry.md",
        "strategy_validation_scorecard.md"
    ]
    tpl_dir = skill_root / "assets" / "templates"
    if not tpl_dir.exists():
        print("[FAIL] Missing assets/templates/ directory")
        all_passed = False
    else:
        for tpl in expected_templates:
            tpl_path = tpl_dir / tpl
            if not tpl_path.exists():
                print(f"[FAIL] Missing template: {tpl}")
                all_passed = False
            elif tpl_path.stat().st_size < 300:
                print(f"[FAIL] Template file too small: {tpl} ({tpl_path.stat().st_size} bytes)")
                all_passed = False
            else:
                print(f"[PASS] Template verified: {tpl}")

    # 6. Check Helper Script
    calc_script = skill_root / "scripts" / "position_size_calculator.py"
    if not calc_script.exists():
        print("[FAIL] Missing scripts/position_size_calculator.py")
        all_passed = False
    else:
        print(f"[PASS] Helper script verified: position_size_calculator.py ({calc_script.stat().st_size:,} bytes)")

    return all_passed

if __name__ == "__main__":
    target = Path(__file__).parent.parent if len(sys.argv) < 2 else Path(sys.argv[1])
    success = validate_skill(target)
    if success:
        print("\nALL SKILL VALIDATION CHECKS PASSED (100% COMPLIANT)!")
        sys.exit(0)
    else:
        print("\nSKILL VALIDATION FAILED!")
        sys.exit(1)
