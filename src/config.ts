import path from "path";
import os from "os";
import dotenv from "dotenv";

dotenv.config();

export interface ServerConfig {
  chromePath: string;
  cdpPort: number;
  userDataDir: string;
  flowUrl: string;
  generationCooldownMs: number;
  humanDelayMinMs: number;
  humanDelayMaxMs: number;
  httpPort: number;
  httpHost: string;
  enableHttpTransport: boolean;
}

function getDefaultChromePath(): string {
  if (process.platform === "win32") {
    return (
      process.env.CHROME_PATH ||
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    );
  } else if (process.platform === "darwin") {
    return (
      process.env.CHROME_PATH ||
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    );
  } else {
    return process.env.CHROME_PATH || "/usr/bin/google-chrome";
  }
}

function getDefaultUserDataDir(): string {
  if (process.env.FLOW_USER_DATA_DIR) {
    return process.env.FLOW_USER_DATA_DIR;
  }
  const appData =
    process.env.LOCALAPPDATA ||
    path.join(os.homedir(), ".config");
  return path.join(appData, "google-flow-mcp", "chrome-profile");
}

export const config: ServerConfig = {
  chromePath: getDefaultChromePath(),
  cdpPort: parseInt(process.env.CHROME_CDP_PORT || "9222", 10),
  userDataDir: getDefaultUserDataDir(),
  flowUrl: process.env.GOOGLE_FLOW_URL || "https://flow.google",
  generationCooldownMs: parseInt(
    process.env.FLOW_GENERATION_COOLDOWN_MS || "20000",
    10
  ),
  humanDelayMinMs: parseInt(process.env.FLOW_DELAY_MIN_MS || "1200", 10),
  humanDelayMaxMs: parseInt(process.env.FLOW_DELAY_MAX_MS || "3200", 10),
  httpPort: parseInt(process.env.PORT || "3000", 10),
  httpHost: process.env.HOST || "127.0.0.1",
  enableHttpTransport: process.env.ENABLE_HTTP === "true",
};
