import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";

dotenvConfig();

export const config = {
  consumerId: process.env.WALMART_CONSUMER_ID ?? "",
  privateKeyPath: resolve(process.env.WALMART_PRIVATE_KEY_PATH ?? "./keys/private.pem"),
  keyVersion: process.env.WALMART_KEY_VERSION ?? "1",
  chromeProfile: process.env.WALMART_CHROME_PROFILE ?? "",
  mcpPort: parseInt(process.env.WALMART_MCP_PORT ?? "8020", 10),
  affiliateApiBase: "https://developer.api.walmart.com/api-proxy/service/affil/product/v2",
  walmartBaseUrl: "https://www.walmart.com",
  rateLimitPerDay: 5000,
};

export function validateAffiliateConfig() {
  if (!config.consumerId) throw new Error("WALMART_CONSUMER_ID is required");
  if (!config.privateKeyPath) throw new Error("WALMART_PRIVATE_KEY_PATH is required");
}

export function validateBrowserConfig() {
  if (!config.chromeProfile) throw new Error("WALMART_CHROME_PROFILE is required");
}
