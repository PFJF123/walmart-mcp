import { affiliateRequest } from "../client.js";
import type { StoreResult } from "../types.js";

export async function findStores(opts: {
  zip?: string;
  lat?: number;
  lon?: number;
}): Promise<StoreResult[]> {
  const params: Record<string, string> = {};
  if (opts.zip) params.zip = opts.zip;
  if (opts.lat !== undefined) params.lat = String(opts.lat);
  if (opts.lon !== undefined) params.lon = String(opts.lon);

  return affiliateRequest<StoreResult[]>("/stores", params);
}
