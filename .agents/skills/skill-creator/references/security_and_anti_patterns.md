# Security Threat Model, Anti-Patterns, and Failure Mode Mitigations

This reference guide provides operational defense standards, anti-pattern detection criteria, and failure mode mitigation protocols for AI Agent Skills.

---

## Part 1: Security Threat Model & Safeguards

### 1.1 Core Security Principles
1. **Least Privilege**: Skills must only declare and execute the minimum necessary permissions and tool access. Never grant blanket shell execution or root access when structured subcommands or dedicated APIs suffice.
2. **Defense in Depth**: Implement multi-layered protection: strict schema validation on input, parameterized prompt interpolation, sandboxed subprocess isolation, and output sanitization.
3. **Secure by Default**: Default to read-only access, explicit confirmation for state mutations or external network egress, and strict execution timeouts.
4. **Fail Securely**: When any precondition, tool invocation, or assertion fails, terminate the operation gracefully without disclosing internal credentials, tokens, or system configurations.
5. **No Embedded Secrets**: Never hardcode API keys, personal access tokens, passwords, or internal endpoints in `SKILL.md` or scripts. Always source from environment variables or safe secret stores.

### 1.2 Threat Vectors & Mitigations

| Threat Vector | Mechanism | Impact | Architectural Mitigation |
|---|---|---|---|
| **Prompt Injection** | Malicious payload disguised as user data alters agent instructions | Hijacking of execution flow, unauthorized tool calls | Delimit untrusted data with clear XML/markdown boundaries; use structured data formats (JSON) rather than concatenating text into instructions. |
| **Tool Injection** | Adversary injects malicious parameters into tool arguments | Arbitrary command execution, filesystem deletion | Validate and sanitize all CLI parameters against strict regex; avoid `shell=True` in subprocesses; use argument lists. |
| **Privilege Escalation** | Skill requests or acquires elevated permissions | System compromise | Enforce per-skill permission manifests; audit `allowed-tools` in frontmatter. |
| **Data Leakage / Exfiltration** | Sensitive context printed to stdout or transmitted externally | Privacy violations, compliance breach | Enforce `--output` file redirection; strip credentials from logs; sanitize stdout; restrict external network calls. |
| **Credential Exposure** | Hardcoded secrets committed to skill repository | Secret harvesting | Implement static credential scanners (`quick_validate.py`); reject strings matching JWT, Bearer tokens, or API keys. |
| **Supply Chain Risks** | Compromised third-party packages or remote scripts | Backdoor execution | Enforce Python standard library usage (`urllib`, `json`, `argparse`); lock and verify dependencies if external packages are required. |
| **Cross-Skill Contamination** | Shared state modified unsafely across concurrent skills | Race conditions, data corruption | Use isolated per-task workspaces and atomic cross-platform file locking (`CrossPlatformFileLock`). |

---

## Part 2: The 18 Common Anti-Patterns

1. **Overly Broad / Monolithic Skills**: Trying to do everything in one skill (e.g. data fetching, cleaning, training, visualization, web server). *Fix:* Decompose into focused single-responsibility skills.
2. **Overly Narrow Skills**: Skills hardcoded for one specific date or single file instance. *Fix:* Parameterize inputs and support generalized workflows.
3. **Duplicate / Overlapping Skills**: Multiple skills implementing near-identical workflows causing routing confusion. *Fix:* Maintain a single canonical skill and deprecate duplicates.
4. **Ambiguous Descriptions**: Vague descriptions like "Helps with code". *Fix:* Use third-person, capability-first language with explicit trigger contexts and negative boundaries.
5. **Excessive Instructions / Context Bloat**: 2000-line markdown files explaining common knowledge. *Fix:* Adhere to 3-tier progressive disclosure; keep `SKILL.md` under 500 lines and offload references.
6. **Poor Tool Definitions & Unbounded Stdout**: Printing megabytes of JSON to stdout, blowing the context window. *Fix:* Require `--output <file.json>` and write only brief summaries to stdout.
7. **Hidden Dependencies**: Depending on uninstalled tools or OS-specific binaries without documentation. *Fix:* Document all requirements in `Prerequisites` and validate dynamically in code.
8. **Excessive Context Loading**: Reading large reference documents on every turn. *Fix:* Load reference files lazily only when specific sub-branches trigger.
9. **Missing Error Handling**: Crashing silently or halting with unhelpful tracebacks. *Fix:* Catch exceptions, report actionable HTTP bodies, and provide self-correction advice.
10. **Unclear Inputs and Outputs**: Missing formal schema definitions for inputs and expected artifacts. *Fix:* Explicitly define input parameters and output schemas.
11. **Skill State Conflicts**: Concurrent subagents overwriting the same temporary file. *Fix:* Use unique UUIDs or iteration workspace subdirectories (`workspace/iteration-N/eval-X/`).
12. **Infinite Loops / Unbounded Chaining**: Skill A calling Skill B which invokes Skill A. *Fix:* Enforce execution recursion depth limits (max depth 3) and track visited states.
13. **Unnecessary Tool Calls / Redundant Polling**: Repeatedly querying APIs without caching. *Fix:* Implement file caching and precondition checking before making external calls.
14. **Prompt Injection Susceptibility**: Interpolating raw user text into instructions without shielding. *Fix:* Enclose inputs in `<user_input>` blocks and treat contents strictly as data.
15. **Unbounded Permissions**: Requesting full filesystem and network access without justification. *Fix:* Enforce least-privilege scoping in `allowed-tools`.
16. **Missing Versioning**: Modifying instructions destructively without changelogs. *Fix:* Use Semantic Versioning (`0.1.0`, `1.0.0`) and document modifications in changelogs.
17. **Lack of Objective Evals**: Deploying skills based purely on "vibe checks". *Fix:* Maintain an `evals/evals.json` suite with automated assertions and baseline comparisons.
18. **Poor Observability**: No metrics on execution duration or token consumption. *Fix:* Capture `timing.json` on task completions and log benchmark deltas.

---

## Part 3: The 24 Failure Modes & Recovery Strategies

| # | Failure Mode | Root Cause | Immediate Recovery | Long-Term Architectural Fix |
|---|---|---|---|---|
| 1 | **Execution Crash** | Missing package / syntax error | Fail with informative stderr | Unit test scripts via CI / pre-commit hooks |
| 2 | **Skill Timeout** | Unbounded loops or hanging API | Abort at timeout threshold | Set explicit request timeouts (e.g. `timeout=30`) |
| 3 | **Resource Exhaustion** | Memory leak / large dataset in RAM | Terminate subprocess | Stream data / chunk large files |
| 4 | **Hallucinated Output** | Ambiguous instructions | Reject output against schema | Provide concrete input/output examples in skill |
| 5 | **Confabulated Facts** | Missing grounding sources | Surface uncertainty flag | Require citations / direct API references |
| 6 | **Tool Unavailable** | Tool not in environment PATH | Fall back to alternative tool | Check tool existence before invocation |
| 7 | **Tool Runtime Error** | Invalid argument or schema drift | Inspect error body and retry | Validate arguments against tool schema |
| 8 | **API Rate Limit (429)** | Exceeded provider queries/sec | Exponential backoff retry | Enforce client-side rate limiting (`APIClient`) |
| 9 | **API Breaking Change** | Upstream API deprecation | Alert maintainer with payload | Version-pin API endpoints; create adapter layers |
| 10 | **Malformed Input** | Bad user format | Prompt user with valid schema | Validate inputs upfront before processing |
| 11 | **Unexpected Output** | Model non-determinism | Re-run or prompt with correction | Tighten degrees of freedom / provide template |
| 12 | **Missing Context** | Pruned conversation history | Prompt user for missing params | Declare required inputs explicitly in metadata |
| 13 | **Context Overload** | Exceeded context window | Prune non-essential logs | Move reference docs out of primary `SKILL.md` |
| 14 | **Permission Denied** | Insufficient filesystem rights | Fall back to user temporary dir | Use `tempfile.gettempdir()` for scratch files |
| 15 | **Excessive Rights** | Root/admin permissions used | Drop privileges immediately | Enforce sandboxing and non-root execution |
| 16 | **Prompt Injection** | Adversarial text in input file | Quarantine input; flag security | Sanitize input; escape special prompt delimiters |
| 17 | **Data Leakage** | API keys printed in tracebacks | Scrub output buffers | Filter regex patterns for secrets in logging |
| 18 | **Credential Expiry** | Expired bearer token | Notify user to refresh credentials | Integrate with environment credential providers |
| 19 | **High Execution Latency**| Sequential processing | Execute parallel subtasks | Use batching and parallel execution |
| 20 | **High Token Cost** | Verbose instructions | Compress prompt instructions | Eliminate conversational filler; use concise bullet points |
| 21 | **Skill Proliferation**| Too many redundant skills | Hide or archive redundant skills | Deduplicate and register in unified skill index |
| 22 | **Concurrency Contention**| Race conditions in shared state| Lock files atomically | Use `CrossPlatformFileLock` with timeout |
| 23 | **Emergent Misalignment**| Unintended multi-agent dynamics| Terminate run; isolate agents | Specify explicit agent contracts & responsibilities |
| 24 | **Non-Deterministic Flake**| High temperature / loose prompts| Run repeated evals (N=3) | Set deterministic seeds or constrain structure |
