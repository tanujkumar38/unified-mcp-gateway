/**
 * Resilient Session-Authenticated Private-API Client
 * 
 * Used for enterprise web applications that lack an official API.
 * Wraps reverse-engineered JSON endpoints with automated login,
 * session renewal on 401 Unauthorized, and data shape normalization.
 */

export interface PortalConfig {
  baseUrl: string;
  username?: string;
  password?: string;
}

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  accountStatus: "active" | "inactive" | "pending";
}

export class PortalClient {
  private baseUrl: string;
  private sessionToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(config: PortalConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
  }

  /**
   * Ensures a valid authenticated session exists. If expired or null, performs login.
   */
  private async ensureSession(): Promise<string> {
    const now = Date.now();
    if (this.sessionToken && now < this.tokenExpiresAt) {
      return this.sessionToken;
    }

    console.error("[PORTAL CLIENT] Session expired or uninitialized. Authenticating...");
    
    const username = process.env.PORTAL_USERNAME;
    const password = process.env.PORTAL_PASSWORD;

    if (!username || !password) {
      throw new Error("Missing PORTAL_USERNAME or PORTAL_PASSWORD environment variables");
    }

    // Call the reverse-engineered auth endpoint discovered in browser DevTools
    const response = await fetch(`${this.baseUrl}/api/v1/auth/session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error(`Authentication failed with status ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    this.sessionToken = data.token || data.accessToken || data.sessionId;
    
    // Default session validity to 55 minutes unless provided by server
    const expiresInSec = data.expiresIn || 3300;
    this.tokenExpiresAt = Date.now() + (expiresInSec * 1000);

    console.error("[PORTAL CLIENT] Successfully authenticated new session.");
    return this.sessionToken!;
  }

  /**
   * Generic request executor with automatic single-attempt re-auth on 401
   */
  public async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    let token = await this.ensureSession();
    const url = `${this.baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    const headers = new Headers(options.headers || {});
    headers.set("Authorization", `Bearer ${token}`);
    headers.set("Accept", "application/json");

    let response = await fetch(url, { ...options, headers });

    // Handle session expiration mid-workflow
    if (response.status === 401) {
      console.error("[PORTAL CLIENT] Received 401 Unauthorized. Refreshing session token...");
      this.sessionToken = null;
      token = await this.ensureSession();
      headers.set("Authorization", `Bearer ${token}`);
      response = await fetch(url, { ...options, headers });
    }

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Private API error [${response.status} ${response.statusText}]: ${errText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Example High-Level Tool Method: Fetch & Normalize Customers
   */
  public async listCustomers(query?: string): Promise<CustomerRecord[]> {
    const rawData = await this.request<{ items: any[] }>(`/api/v1/customers?search=${encodeURIComponent(query || "")}`);
    
    // Normalize raw frontend response into a clean, LLM-friendly shape
    return (rawData.items || []).map((item) => ({
      id: String(item.uuid || item.id),
      name: `${item.first_name || ""} ${item.last_name || ""}`.trim() || item.company_name || "Unknown",
      email: item.contact_email || item.email || "no-email",
      accountStatus: item.is_active ? "active" : "inactive",
    }));
  }
}
