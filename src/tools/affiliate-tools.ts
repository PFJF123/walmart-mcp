import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { search } from "../affiliate/endpoints/search.js";
import { getProduct, getProductByUpc } from "../affiliate/endpoints/product.js";
import { getTaxonomy } from "../affiliate/endpoints/taxonomy.js";
import { getTrending } from "../affiliate/endpoints/trending.js";
import { findStores } from "../affiliate/endpoints/stores.js";
import { getRecommendations } from "../affiliate/endpoints/recommendations.js";
import { validateAffiliateConfig } from "../config.js";

export function registerAffiliateTools(server: McpServer) {
  server.tool(
    "walmart_search",
    "Search Walmart products by keyword",
    {
      query: z.string().describe("Search query"),
      sort: z.enum(["relevance", "price", "title", "bestseller", "customerRating", "new"]).optional().describe("Sort order"),
      numItems: z.number().min(1).max(25).optional().describe("Number of results (1-25)"),
      start: z.number().min(1).optional().describe("Starting result offset"),
    },
    async (params) => {
      validateAffiliateConfig();
      const result = await search(params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "walmart_product",
    "Get Walmart product details by item ID",
    { itemId: z.string().describe("Walmart item ID") },
    async ({ itemId }) => {
      validateAffiliateConfig();
      const result = await getProduct(itemId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "walmart_product_upc",
    "Get Walmart product details by UPC barcode",
    { upc: z.string().describe("UPC barcode") },
    async ({ upc }) => {
      validateAffiliateConfig();
      const result = await getProductByUpc(upc);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "walmart_taxonomy",
    "Get Walmart product category tree",
    {},
    async () => {
      validateAffiliateConfig();
      const result = await getTaxonomy();
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "walmart_trending",
    "Get trending/bestselling Walmart products",
    { categoryId: z.string().optional().describe("Category ID to filter by") },
    async ({ categoryId }) => {
      validateAffiliateConfig();
      const result = await getTrending(categoryId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "walmart_store_locator",
    "Find nearby Walmart stores",
    {
      zip: z.string().optional().describe("ZIP code"),
      lat: z.number().optional().describe("Latitude"),
      lon: z.number().optional().describe("Longitude"),
    },
    async (params) => {
      validateAffiliateConfig();
      const result = await findStores(params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "walmart_recommendations",
    "Get product recommendations for a Walmart item",
    { itemId: z.string().describe("Walmart item ID") },
    async ({ itemId }) => {
      validateAffiliateConfig();
      const result = await getRecommendations(itemId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );
}
