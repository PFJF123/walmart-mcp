import type { Page } from "playwright";

function gaussianRandom(mean: number, stddev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.round(mean + z * stddev);
}

export function humanDelay(minMs = 150, maxMs = 500): Promise<void> {
  const mean = (minMs + maxMs) / 2;
  const stddev = (maxMs - minMs) / 4;
  const delay = Math.max(minMs, Math.min(maxMs, gaussianRandom(mean, stddev)));
  return new Promise((r) => setTimeout(r, delay));
}

export async function humanType(page: Page, selector: string, text: string) {
  await page.click(selector);
  await humanDelay(100, 300);
  for (const char of text) {
    await page.keyboard.type(char, { delay: gaussianRandom(50, 15) });
  }
}

export async function humanClick(page: Page, selector: string) {
  const el = page.locator(selector).first();
  await el.scrollIntoViewIfNeeded();
  await humanDelay(100, 250);
  await el.click();
  await humanDelay(200, 400);
}

export async function setupAntiDetect(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
  });
}
