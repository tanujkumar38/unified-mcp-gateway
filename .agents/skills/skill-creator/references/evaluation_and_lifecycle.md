# Skill Lifecycle, Evaluation Framework, and Production-Readiness Scorecard

This guide provides the complete evaluation methodology, testing pyramid, lifecycle stage governance, and verification scorecard for production AI Agent Skills.

---

## Part 1: The 9 Testing Levels for Agent Skills

```
                     ┌───────────────────────┐
                     │ Level 9: Behavior      │ (Reasoning & Adaptability)
                     ├───────────────────────┤
                     │ Level 8: Reliability   │ (MTBF, MTTR, Stability)
                     ├───────────────────────┤
                     │ Level 7: Security      │ (Injection, Secrets, Least-Priv)
                     ├───────────────────────┤
                     │ Level 6: Load / Concurr│ (Multi-agent race conditions)
                     ├───────────────────────┤
                     │ Level 5: Regression    │ (Backward compatibility)
                     ├───────────────────────┤
                     │ Level 4: Adversarial   │ (Red-teaming edge cases)
                     ├───────────────────────┤
                     │ Level 3: End-to-End    │ (Full user task workflows)
                     ├───────────────────────┤
                     │ Level 2: Integration   │ (Tool / API / Script calls)
                     ├───────────────────────┤
                     │ Level 1: Unit Tests    │ (Instruction syntax & scripts)
                     └───────────────────────┘
```

1. **Level 1: Unit Testing**: Validate helper scripts in `scripts/` using Python `unittest` or `pytest` with mocked API responses. Verify that individual subcommands return valid status codes and valid JSON files.
2. **Level 2: Integration Testing**: Test interaction between the agent instructions and local tools/scripts. Verify that the agent correctly parses script CLI arguments and handles file redirection.
3. **Level 3: End-to-End Testing**: Run complete realistic user queries with the skill active. Verify that user requests translate into finished artifacts without manual intervention.
4. **Level 4: Adversarial Testing**: Test with ambiguous, messy, or adversarial inputs (e.g. malformed CSVs, partial paths, prompt injections). Verify that the skill fails safely and prompts for clarification.
5. **Level 5: Regression Testing**: Re-run the baseline test suite (`evals/evals.json`) whenever `SKILL.md` or scripts are modified to guarantee no existing capabilities were degraded.
6. **Level 6: Load & Concurrency Testing**: Run multiple instances of the skill simultaneously across parallel subagents. Verify that atomic file locks prevent race conditions and rate limits are respected.
7. **Level 7: Security Testing**: Run static secret scanning, permission audits, and input boundary verification. Ensure no sensitive data leaks into logs or stdout.
8. **Level 8: Reliability Testing**: Measure consistency across multiple runs of identical prompts (N=3 to N=5). Calculate variance in pass rates, execution times, and token costs.
9. **Level 9: Agent Behavior Evaluation**: Evaluate whether the agent chooses the skill appropriately when competing against general reasoning or alternative skills (evaluating False Positives and False Negatives).

---

## Part 2: The 10 Lifecycle Stages

```
[1. Design] ──> [2. Spec] ──> [3. Implementation] ──> [4. Testing] ──> [5. Evaluation]
                                                                            │
[10. Deprecate] <── [9. Optimize] <── [8. Version] <── [7. Monitor] <── [6. Deploy]
```

1. **Design**: Capture intent through interactive interview or session distillation. Identify input/output contracts, prerequisites, degrees of freedom, and tool requirements.
2. **Spec**: Produce draft `SKILL.md` frontmatter, section structure, and identify whether code is needed (CLI pattern) or instruction-only pattern suffices.
3. **Implementation**: Scaffold the directory layout using `scripts/init_skill.py`. Write concise instructions (<500 lines) and implement robust helper scripts in `scripts/`.
4. **Testing**: Run Level 1 and Level 2 unit/integration tests on scripts and frontmatter validation with `scripts/quick_validate.py`.
5. **Evaluation**: Run parallel with-skill vs. baseline runs (`scripts/run_eval.py`), grade outputs with `agents/grader.md`, and aggregate statistical metrics via `scripts/aggregate_benchmark.py`.
6. **Deploy**: Package portable `.skill` bundles with `scripts/package_skill.py` and install to user/project skill directories (`.agents/skills`, `~/.claude/skills`, etc.).
7. **Monitor**: Track execution metrics in production: duration, token consumption, error rates, and user corrections.
8. **Version**: Tag semantic versions (`0.1.0` -> `1.0.0`). Document breaking changes and keep changelogs.
9. **Optimize**: Optimize trigger descriptions (`scripts/run_loop.py`) against held-out queries. Prune unnecessary instructions and cache repetitive operations.
10. **Deprecate**: When replaced by a better skill or native tool, provide migration notices and mark `deprecated: true` in metadata.

---

## Part 3: Production-Readiness Scorecard (18 Areas)

Before releasing a skill to production, verify compliance across all 18 quality gates:

- [ ] **1. Purpose & Scope**: Single responsibility clearly defined; boundaries and counter-triggers established.
- [ ] **2. Naming & Frontmatter**: Kebab-case `name` ≤64 chars; `description` ≤1024 chars (and ≤60 chars summary for compact platforms); valid YAML syntax.
- [ ] **3. Progressive Disclosure**: `SKILL.md` body ≤500 lines; large reference documentation split into `references/`; assets separated.
- [ ] **4. Degrees of Freedom**: Freedom level matches task risk: High for creative tasks, Medium for reports, Low for fragile ops (database/API).
- [ ] **5. Script Standards**: Python scripts use stdlib only (zero unexpected dependencies); executable directly via CLI.
- [ ] **6. Output Redirection**: All data-producing scripts support `--output <file.json>`; stdout reserved for brief status messages.
- [ ] **7. Rate Limiting**: All API interactions enforce client-side delays, handle HTTP 429 with exponential backoff, and use atomic file locks.
- [ ] **8. Security Sanitization**: No hardcoded API keys, tokens, or credentials; static validator passes without security warnings.
- [ ] **9. Injection Defense**: User inputs treated as untrusted data; clear delimiter tags used when formatting prompt context.
- [ ] **10. Cross-Platform Compatibility**: Code and instructions audited for Windows, macOS, and Linux; `pathlib.Path` and `tempfile.gettempdir()` used instead of hardcoded `/tmp`.
- [ ] **11. Error Recovery**: Non-zero exit codes on failure; actionable error messages including HTTP response bodies for self-correction.
- [ ] **12. Multi-Agent Evaluation**: Benchmark suite defined in `evals/evals.json` with objectively verifiable assertions.
- [ ] **13. Statistical Benchmark**: Run with-skill vs. baseline; pass rate delta positive; latency and token usage documented.
- [ ] **14. Human Review**: Outputs visually or qualitatively verified in `eval-viewer` dashboard.
- [ ] **15. Trigger Precision**: Tested against 20 edge-case queries (should-trigger vs. should-not-trigger); near-miss queries verified.
- [ ] **16. Semantic Versioning**: `version` field present in metadata; breaking changes documented.
- [ ] **17. Examples Included**: At least 2 concrete input/output examples provided in `SKILL.md`.
- [ ] **18. Packaging & Portability**: Verified with `scripts/quick_validate.py` and packagable via `scripts/package_skill.py`.
