import { affiliateRequest } from "../client.js";
import type { TaxonomyResponse } from "../types.js";

export async function getTaxonomy(): Promise<TaxonomyResponse> {
  return affiliateRequest<TaxonomyResponse>("/taxonomy");
}
