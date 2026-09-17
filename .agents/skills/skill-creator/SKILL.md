---
name: skill-creator
description: End-to-end engineering, authoring, benchmarking, and optimization for AI Agent Skills. Use whenever the user asks to create a new skill, turn a completed session or workflow into a skill, optimize an existing skill, benchmark with-skill vs baseline runs, generate eval review viewers, harden skill security, or tune skill trigger descriptions.
metadata:
  version: "2.0.0"
  author: "Tanuj Kumar, AI Agent"
  license: "Apache-2.0"
  platforms: ["linux", "macos", "windows"]
  tags: ["skill-creator", "agent-skills", "evals", "benchmarks", "authoring"]
---

# AI Agent Skill Creator

The canonical system for authoring, evaluating, and optimizing production-grade AI Agent Skills across Claude Code, OpenAI Codex, Antigravity 2.0, Gemini CLI, Cursor, Hermes, Trae, and Windsurf.

```
[1. Intent / Distill] ──> [2. Architecture] ──> [3. Scaffold] ──> [4. Implement & Secure]
                                                                          │
[8. Deploy & Package] <── [7. Trigger Loop] <── [6. Review]   <── [5. Parallel Evals]
```

---

## Phase 1: Intent Capture & Distillation

Determine where the user is starting from:

### Path A: Workflow Distillation (Extracting from Active Conversation)
When the user says "turn this into a skill", "make what we did a skill", or "distill this workflow":
1. Extract observed tool calls, sequence of steps, parameter conventions, and user corrections from the current transcript.
2. Confirm understanding with the user in one concise summary:
   - Workflow purpose and boundaries.
   - Expected input arguments and output artifacts.
   - Any steps where an external API, script, or deterministic transformation was used.

### Path B: Authoring from Scratch (Interactive Interview)
Ask 2-3 focused questions at a time:
1. **Purpose & Scope:** What specific capability should this skill grant the agent? What tasks are out of scope?
2. **Execution Medium:** Does this require programmatic data processing/API calls (requires CLI script) or purely orchestrating existing agent tools and reasoning (instruction-only)?
3. **Trigger Scenarios:** Under what user prompts or file types should this skill trigger automatically?
4. **Target Environment:** Personal (`~/.agents/skills/`), project-local (`.agents/skills/`), or specific platform directories?

---

## Phase 2: Architectural Scope & Degrees of Freedom

Match specificity to operational risk:

| Freedom Level | When to Use | Archetype Pattern | Example |
|---|---|---|---|
| **High** (Pure Instructions) | Subjective, multiple valid paths, creative | `workflow` | Code review, writing style, architecture design |
| **Medium** (Templates / Structured) | Consistent output schema with variance | `hybrid` | Documentation generation, research synthesis |
| **Low** (Deterministic Code) | Fragile operations, APIs, migrations, schemas | `cli-tool` | Data conversion, REST APIs, PDF manipulation |

### The Core Rule on Programmatic Work:
If **any** step involves external APIs, complex data parsing, regex transformations, or file conversion, **produce a deterministic CLI helper script**. Never force the model to hallucinate or repeatedly write ad-hoc scripts.

---

## Phase 3: 3-Tier Progressive Disclosure

To maximize context window efficiency and prevent token degradation, enforce the 3-tier hierarchy:

1. **Tier 1: Metadata (Always in Context)**: `name` (≤64 chars) and `description` (≤1024 chars, concise capability statement with triggers). Keep footprint ~100 tokens.
2. **Tier 2: SKILL.md Body (Loaded on Trigger)**: Procedural instructions kept under **500 lines**. Focus exclusively on execution discipline, checklists, and subcommand references.
3. **Tier 3: Bundled Resources (Loaded as Needed)**:
   - `scripts/`: Executable code for deterministic actions (`uv run` or stdlib Python).
   - `references/`: Deep documentation, domain schemas, API specs loaded on demand.
   - `assets/`: Boilerplate templates, schemas, and icons used in generated output.

---

## Phase 4: Scaffolding with `init_skill.py`

Generate a standardized skill scaffold using the bundled initializer:

```bash
python <skill-creator-path>/scripts/init_skill.py <skill-name> \
  --path <parent-directory> \
  --archetype <workflow|cli-tool|hybrid>
```

### Generated Layout:
```
my-skill/
├── SKILL.md                          # Frontmatter + instructions (<500 lines)
├── agents/openai.yaml                # Optional Codex interface manifest
├── scripts/my_skill_helper.py        # Subcommand CLI (for cli-tool/hybrid)
├── references/reference.md           # Deep domain reference (loaded on demand)
├── assets/template.md                # Output templates and boilerplate
└── evals/evals.json                  # Objective evaluation test cases
```

---

## Phase 5: Security Hardening & Zero-Secrets Rule

Every skill must be audited against the security criteria before deployment (see `references/security_and_anti_patterns.md`):

1. **Zero Embedded Secrets**: Never hardcode API tokens or credentials. Always source credentials via environment variables or safe secret stores.
2. **File Output Redirection**: All data-producing scripts MUST write to `--output <file.json>`. Stdout must stay <10 lines to conserve agent context.
3. **Rate Limiting & Concurrency**: API scripts must use `CrossPlatformFileLock` and exponential backoff on HTTP 429/5xx (see `references/cli_script_template.py`).
4. **Prompt Injection Defense**: User-supplied input strings must be quarantined within designated input blocks and never concatenated directly as raw instructions.
5. **Cross-Platform Compatibility**: Audit scripts to run seamlessly on Windows, macOS, and Linux (`pathlib.Path`, `tempfile.gettempdir()`, no Unix-only `fcntl` or `pty`).

Validate compliance with the built-in validator:
```bash
python <skill-creator-path>/scripts/quick_validate.py <path/to/skill-folder>
```

---

## Phase 6: Multi-Agent Parallel Evals

For skills with verifiable outputs, create an evaluation suite in `evals/evals.json`:

```json
{
  "skill_name": "my-skill",
  "evals": [
    {
      "id": 0,
      "name": "basic-conversion-test",
      "prompt": "Convert input.csv to clean json using my-skill",
      "files": ["input.csv"],
      "assertions": [
        {"name": "output-exists", "type": "file_exists", "path": "output.json"},
        {"name": "valid-schema", "type": "schema_match", "key": "status"}
      ]
    }
  ]
}
```

### Parallel Run Strategy
For each eval case, spawn **both** the with-skill and baseline subagents simultaneously in the same turn:
- **With-Skill Run**: Pass the skill path; save outputs to `<workspace>/iteration-<N>/eval-<ID>/with_skill/outputs/`.
- **Baseline Run**: For new skills, run without any skill; for upgraded skills, run against snapshot of old version. Save to `<workspace>/iteration-<N>/eval-<ID>/without_skill/outputs/`.
- **Record Timings**: Immediately capture duration and token consumption in `timing.json` upon completion.

---

## Phase 7: Automated Grading & Benchmark Analysis

1. **Grade Runs**: Spawn grader subagents using `agents/grader.md` to grade each assertion against the produced outputs, outputting `grading.json`.
2. **Aggregate Benchmark**: Run statistical aggregation:
   ```bash
   python -m scripts.aggregate_benchmark <workspace>/iteration-N --skill-name <name>
   ```
   Generates `benchmark.json` and `benchmark.md` calculating pass rate delta, mean duration, token consumption, and variance.
3. **Analyst Pass**: Check `agents/analyzer.md` to identify non-discriminating assertions, flaky tests, and token/time trade-offs.

---

## Phase 8: Human Review Loop

Launch the evaluation viewer to review outputs side-by-side:

```bash
# In desktop environments:
python <skill-creator-path>/eval-viewer/generate_review.py \
  <workspace>/iteration-N \
  --skill-name "my-skill" \
  --benchmark <workspace>/iteration-N/benchmark.json

# In headless, remote, or Cowork environments:
python <skill-creator-path>/eval-viewer/generate_review.py \
  <workspace>/iteration-N \
  --skill-name "my-skill" \
  --benchmark <workspace>/iteration-N/benchmark.json \
  --static <workspace>/iteration-N/review.html
```

Review feedback in `feedback.json`, apply improvements, and iterate until pass rates and user satisfaction are maximized.

---

## Phase 9: Description Trigger Optimization

Skill discovery relies on metadata semantic matching. Optimize trigger sensitivity:

1. **Curate 20 Queries**: Draft 8-10 positive queries (including messy edge cases and typos) and 8-10 negative near-miss queries. Review in `assets/eval_review.html`.
2. **Execute Optimization Loop**:
   ```bash
   python -m scripts.run_loop \
     --eval-set <path-to-eval.json> \
     --skill-path <path-to-skill> \
     --max-iterations 5 \
     --verbose
   ```
   Splits queries into 60% train / 40% test, evaluates triggering accuracy, and mutates frontmatter description to minimize false positives and false negatives.
3. Apply `best_description` to `SKILL.md`.

---

## Phase 10: Packaging & Cross-Agent Deployment

### Packaging
Package the skill into a portable `.skill` archive:
```bash
python -m scripts.package_skill <path/to/skill-folder>
```

### Standard Skill Installation Paths:
- **Global Agent Skills (Standard / Antigravity / Open Tools)**: `~/.agents/skills/<skill-name>/`
- **Claude Code**: `~/.claude/skills/<skill-name>/`
- **OpenAI Codex**: `~/.codex/skills/<skill-name>/`
- **Cursor**: `~/.cursor/skills/<skill-name>/`
- **Google Antigravity & Gemini CLI**: `~/.gemini/config/skills/<skill-name>/`
- **Hermes Agent Desktop**: `~/.hermes/skills/<skill-name>/`
- **ByteDance Trae**: `~/.trae/skills/<skill-name>/`
- **Codeium Windsurf**: `~/.windsurf/skills/<skill-name>/`
- **Continue.dev**: `~/.continue/skills/<skill-name>/`
- **Project Workspace**: `.agents/skills/<skill-name>/`

---

## Reference Guides

- [cli_script_template.py](references/cli_script_template.py): Standard library rate-limited CLI with cross-platform atomic locking.
- [schemas.md](references/schemas.md): JSON schemas for evals, timing, grading, and benchmark data.
- [security_and_anti_patterns.md](references/security_and_anti_patterns.md): Complete guide to the 18 anti-patterns, 24 failure modes, and threat mitigations.
- [evaluation_and_lifecycle.md](references/evaluation_and_lifecycle.md): Complete guide to the 9 testing levels and 18-point production checklist.
- [openai_yaml.md](references/openai_yaml.md): OpenAI Codex UI and tool dependency manifest specification.
