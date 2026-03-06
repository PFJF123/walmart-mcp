import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { viewCart, addToCart, removeFromCart, updateCartQuantity } from "../browser/actions/cart.js";
import { startCheckout, confirmCheckout } from "../browser/actions/checkout.js";
import { getOrders, getOrderDetails, trackOrder } from "../browser/actions/orders.js";
import { validateBrowserConfig } from "../config.js";

export function registerBrowserTools(server: McpServer) {
  server.tool(
    "walmart_cart_view",
    "View current Walmart cart contents",
    {},
    async () => {
      validateBrowserConfig();
      const result = await viewCart();
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "walmart_cart_add",
    "Add a product to Walmart cart",
    {
      itemId: z.string().optional().describe("Walmart item ID"),
      url: z.string().optional().describe("Product URL"),
      quantity: z.number().min(1).optional().describe("Quantity (default 1)"),
    },
    async ({ itemId, url, quantity }) => {
      validateBrowserConfig();
      const target = url ?? itemId;
      if (!target) throw new Error("Either itemId or url is required");
      const result = await addToCart(target, quantity ?? 1);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "walmart_cart_remove",
    "Remove a product from Walmart cart",
    { itemId: z.string().describe("Walmart item ID to remove") },
    async ({ itemId }) => {
      validateBrowserConfig();
      const result = await removeFromCart(itemId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "walmart_cart_update_qty",
    "Update quantity of an item in Walmart cart",
    {
      itemId: z.string().describe("Walmart item ID"),
      quantity: z.number().min(1).describe("New quantity"),
    },
    async ({ itemId, quantity }) => {
      validateBrowserConfig();
      const result = await updateCartQuantity(itemId, quantity);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "walmart_checkout_start",
    "Start checkout — returns order summary and confirmation token (5 min TTL). Browser will be visible.",
    {},
    async () => {
      validateBrowserConfig();
      const result = await startCheckout();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2) +
              "\n\n⚠️ Review the summary above. To place the order, call walmart_checkout_confirm with the confirmationToken. Token expires in 5 minutes.",
          },
        ],
      };
    },
  );

  server.tool(
    "walmart_checkout_confirm",
    "Confirm and place the order using the token from checkout_start",
    { confirmationToken: z.string().describe("Token from walmart_checkout_start") },
    async ({ confirmationToken }) => {
      validateBrowserConfig();
      const result = await confirmCheckout(confirmationToken);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "walmart_orders",
    "List recent Walmart orders",
    { limit: z.number().min(1).max(50).optional().describe("Number of orders (default 10)") },
    async ({ limit }) => {
      validateBrowserConfig();
      const result = await getOrders(limit ?? 10);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "walmart_order_details",
    "Get details for a specific Walmart order",
    { orderId: z.string().describe("Order ID") },
    async ({ orderId }) => {
      validateBrowserConfig();
      const result = await getOrderDetails(orderId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "walmart_order_track",
    "Track shipment for a Walmart order",
    { orderId: z.string().describe("Order ID") },
    async ({ orderId }) => {
      validateBrowserConfig();
      const result = await trackOrder(orderId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );
}
