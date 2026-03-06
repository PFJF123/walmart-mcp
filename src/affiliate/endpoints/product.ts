import { affiliateRequest } from "../client.js";
import type { WalmartProduct } from "../types.js";

export async function getProduct(itemId: string): Promise<WalmartProduct> {
  const items = await affiliateRequest<WalmartProduct[]>(`/items/${itemId}`);
  // The API returns an array for single items
  return Array.isArray(items) ? items[0] : items;
}

export async function getProductByUpc(upc: string): Promise<WalmartProduct> {
  const result = await affiliateRequest<{ items: WalmartProduct[] }>("/items", { upc });
  if (!result.items?.length) {
    throw new Error(`No product found for UPC: ${upc}`);
  }
  return result.items[0];
}
