import { config } from "../config.js";
import { generateAuthHeaders } from "./auth.js";
import { checkRateLimit, consumeRateLimit } from "../utils/rate-limiter.js";
import { WalmartError, AuthError } from "../utils/errors.js";

export async function affiliateRequest<T>(path: string, params?: Record<string, string>): Promise<T> {
  checkRateLimit(config.rateLimitPerDay);

  const url = new URL(`${config.affiliateApiBase}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== "") url.searchParams.set(k, v);
    }
  }

  const headers = generateAuthHeaders();
  const res = await fetch(url.toString(), { headers });

  consumeRateLimit();

  if (res.status === 401 || res.status === 403) {
    throw new AuthError(`Affiliate API auth failed: ${res.status}`);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new WalmartError(
      `Affiliate API error: ${res.status} ${res.statusText} — ${body}`,
      "API_ERROR",
      res.status,
    );
  }

  return res.json() as Promise<T>;
}
