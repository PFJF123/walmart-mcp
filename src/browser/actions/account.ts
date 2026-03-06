import { getPage } from "../manager.js";
import { humanDelay } from "../anti-detect.js";
import { config } from "../../config.js";

export interface AccountInfo {
  loggedIn: boolean;
  name?: string;
}

export async function getAccountInfo(): Promise<AccountInfo> {
  const page = await getPage(`${config.walmartBaseUrl}/account`);
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await humanDelay(500, 1000);

  // Check if we're on a sign-in page
  const signInVisible = await page.locator('form[action*="sign-in"], input[name="email"]').first().isVisible().catch(() => false);
  if (signInVisible) {
    return { loggedIn: false };
  }

  const name = await page.locator('[data-testid="account-name"], .account-name, h1').first().textContent().catch(() => null);
  return { loggedIn: true, name: name?.trim() };
}
