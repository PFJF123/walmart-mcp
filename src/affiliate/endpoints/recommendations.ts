import { affiliateRequest } from "../client.js";
import type { WalmartProduct } from "../types.js";

export async function getRecommendations(itemId: string): Promise<WalmartProduct[]> {
  return affiliateRequest<WalmartProduct[]>(`/nbp`, { itemId });
}
