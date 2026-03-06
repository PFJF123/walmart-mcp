import { affiliateRequest } from "../client.js";
import type { WalmartProduct } from "../types.js";

export async function getTrending(categoryId?: string): Promise<WalmartProduct[]> {
  const params: Record<string, string> = {};
  if (categoryId) params.categoryId = categoryId;
  const result = await affiliateRequest<{ items: WalmartProduct[] }>("/trends", params);
  return result.items ?? [];
}
