import { affiliateRequest } from "../client.js";
import type { SearchResponse } from "../types.js";

export async function search(opts: {
  query: string;
  sort?: string;
  numItems?: number;
  start?: number;
}): Promise<SearchResponse> {
  const params: Record<string, string> = { query: opts.query };
  if (opts.sort) params.sort = opts.sort;
  if (opts.numItems) params.numItems = String(opts.numItems);
  if (opts.start) params.start = String(opts.start);

  return affiliateRequest<SearchResponse>("/search", params);
}
