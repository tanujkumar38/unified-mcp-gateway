# No-API MCP Server Strategies

When target applications, internal portals, or websites lack an official public API, MCP servers can bridge the gap using three proven architectural archetypes.

---

## 1. The Three No-API Archetypes

| Architectural Dimension | 1. Web Scraping | 2. Browser Automation | 3. Private-API Reverse Engineering |
| :--- | :--- | :--- | :--- |
| **Primary Use Case** | Public content, docs, read-only | One-off interactive flows, JS heavy | Enterprise portals, mission-critical systems |
| **Latency** | Medium (~500ms - 2s) | High (5s - 30s+) | Low (~100ms - 800ms) |
| **Reliability** | Medium (DOM selector drift) | Low (DOM changes, timing, MFA) | High (deterministic JSON endpoints) |
| **State Mutations (Writes)**| ❌ No (Read-only) | ✅ Yes (clicks, typing, uploads) | ✅ Yes (POST, PUT, DELETE) |
| **Authentication Strategy** | None (public content) | Headless session, saved storage state| Auth session tokens, refresh cookies |
| **MFA / CAPTCHA Handling** | ❌ Cannot bypass | Manual user intervention or 2Captcha| Dedicated service account / token capture |
| **Token / Resource Cost** | Low | High (DOM snapshots, screenshots) | Low |
| **Maintenance Burden** | Low | Medium | High initial setup, low operational jitter |
| **Production Readiness** | Conditional | Prototyping only | Enterprise Production Grade |

---

## 2. Archetype 1: Web Scraping Engine

### Architecture
Use when target content is accessible without login, or can be fetched via clean HTTP GET requests.

```
Client ──► Tool Call ──► Axios / Fetch ──► Target Website
                              │
                      Cheerio / Parsers
                              │
                      Markdown / Clean JSON ──► Tool Result
```

### Core Implementation Rules
1. **Always Set Realistic Headers**: Include legitimate `User-Agent`, `Accept-Language`, and `Accept` headers to avoid naive WAF blocks.
2. **Transform HTML to Markdown**: Never send raw bloated HTML (hundreds of kilobytes of inline SVGs and scripts) to the LLM. Extract the semantic content container (`article`, `main`, `#content`) and convert to Markdown via `turndown` or `cheerio`.
3. **Respect Rate Limits & robots.txt**: Add exponential backoff and concurrency limits.

---

## 3. Archetype 2: Browser Automation Engine

### Architecture
Use when the website relies on complex client-side rendering (React/Vue/Angular SPAs), dynamic canvas elements, or requires human-like interactions (clicking buttons, filling multi-step modal dialogs).

```
Client ──► Tool Call ──► Puppeteer / Playwright (Headless Chrome)
                              │
                    DOM Navigation & Actions
                              │
                    Screenshot / Evaluation ──► Tool Result
```

### Critical Implementation Guidelines:
1. **Container / Linux Sandbox Flags**: In containerized or Linux environments, Chromium requires:
   ```typescript
   const browser = await puppeteer.launch({
     headless: "new",
     args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
   });
   ```
2. **Explicit Waits, Not Arbitrary Timeouts**: Never use `sleep(5000)`. Always wait for network idle or selector presence:
   ```typescript
   await page.waitForSelector('.result-table', { timeout: 10000 });
   ```
3. **Graceful Browser Teardown**: Always wrap automation in `try...finally` to ensure `browser.close()` is executed even upon failure, preventing zombie Chrome processes from consuming RAM.
4. **Session Persistence**: Save browser `storageState` (cookies, local storage) to a protected local JSON file to avoid logging in on every invocation.

---

## 4. Archetype 3: Private-API Reverse Engineering

### Architecture
The holy grail for enterprise systems lacking public APIs (e.g. internal EHRs, billing portals, ERPs). Inspects the private JSON endpoints that the web frontend calls behind the scenes.

```
Client ──► Tool Call ──► Session Client (Axios) ──► Private JSON Endpoints
                              │
                      Bearer / Cookie Auth
                              │
                      Normalized Clean JSON ──► Tool Result
```

### Reverse Engineering Methodology:
1. **Network Reconnaissance**:
   - Open Browser DevTools (`F12` -> Network tab -> filter `Fetch/XHR`).
   - Perform the desired user action in the UI (e.g. click "Export Customers").
   - Inspect the request URL, HTTP method, query params, headers, and request payload.
2. **Authentication Flow Capture**:
   - Identify how the frontend logs in (`/api/auth/login`, `/oauth/token`, or session cookies).
   - Identify the session token (Bearer header `Authorization: Bearer ey...` or `Cookie: session_id=...`).
3. **Session Lifecycle Manager**:
   - Store credentials in environment variables (`PORTAL_USER`, `PORTAL_PASS`).
   - Implement an automated re-auth method: If any API request returns `401 Unauthorized`, clear the cached token, re-login, update the token, and retry the failed request.
4. **Data Normalization**:
   - Private endpoints often return internal database noise, unnecessary UI flags, or bloated metadata.
   - Always map the raw JSON payload to a concise, typed interface before returning it to the LLM.

---

## 5. Decision Matrix: Which Archetype to Choose?

```
Is the data publicly accessible without login?
  ├── YES ──► Does it require JavaScript rendering?
  │             ├── NO  ──► Choose ARCHETYPE 1: Web Scraping
  │             └── YES ──► Choose ARCHETYPE 2: Browser Automation (or Headless Scraping)
  └── NO (Requires Login / State Mutation)
        ├── Can you reverse-engineer the internal XHR/JSON requests?
        │     ├── YES ──► Choose ARCHETYPE 3: Private-API Engine (Fastest, Most Reliable)
        │     └── NO  ──► Choose ARCHETYPE 2: Browser Automation (Playwright / Puppeteer)
        └── Does it have severe bot detection (Cloudflare Turnstile, Arkose)?
              └── Use Headless Browser with Stealth Plugins or a managed service (Browserless / Firecrawl).
```
