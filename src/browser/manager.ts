import { chromium, type BrowserContext, type Page } from "playwright";
import { config, validateBrowserConfig } from "../config.js";
import { BrowserError } from "../utils/errors.js";
import { setupAntiDetect } from "./anti-detect.js";
import { existsSync } from "fs";

let context: BrowserContext | null = null;
let idleTimer: ReturnType<typeof setTimeout> | null = null;
const IDLE_TIMEOUT_MS = 5 * 60 * 1000;

function resetIdleTimer() {
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(async () => {
    await closeBrowser();
  }, IDLE_TIMEOUT_MS);
}

export async function getBrowser(): Promise<BrowserContext> {
  if (context) {
    resetIdleTimer();
    return context;
  }

  validateBrowserConfig();

  // Check for profile lock
  const lockFile = `${config.chromeProfile}/SingletonLock`;
  if (existsSync(lockFile)) {
    throw new BrowserError(
      "Chrome profile is locked — close any open Chrome instances using this profile, " +
        "or use a separate --user-data-dir for walmart-mcp.",
    );
  }

  context = await chromium.launchPersistentContext(config.chromeProfile, {
    channel: "chrome",
    headless: false,
    viewport: { width: 1366, height: 768 },
    args: [
      "--disable-blink-features=AutomationControlled",
      "--no-first-run",
      "--no-default-browser-check",
    ],
  });

  // Apply anti-detect to all new pages
  context.on("page", async (page) => {
    await setupAntiDetect(page);
  });

  resetIdleTimer();
  return context;
}

export async function getPage(url?: string): Promise<Page> {
  const ctx = await getBrowser();
  const pages = ctx.pages();
  let page = pages.find((p) => p.url().includes("walmart.com"));

  if (!page) {
    page = pages[0] ?? (await ctx.newPage());
    await setupAntiDetect(page);
  }

  if (url) {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  }

  resetIdleTimer();
  return page;
}

export async function closeBrowser() {
  if (idleTimer) clearTimeout(idleTimer);
  if (context) {
    await context.close().catch(() => {});
    context = null;
  }
}
