import { getPage } from "../manager.js";
import { sel } from "../selectors.js";
import { humanDelay } from "../anti-detect.js";
import { config } from "../../config.js";
import { BrowserError } from "../../utils/errors.js";

export interface OrderListItem {
  orderId: string;
  date: string;
  total: string;
}

export interface OrderDetails {
  orderId: string;
  date: string;
  total: string;
  items: { name: string; price: string; quantity: string }[];
  status: string;
}

export interface TrackingInfo {
  orderId: string;
  trackingNumber: string;
  status: string;
  carrier: string;
}

export async function getOrders(limit = 10): Promise<OrderListItem[]> {
  const page = await getPage(`${config.walmartBaseUrl}/orders`);
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await humanDelay(1000, 2000);

  const orderCards = page.locator(sel.orders.orderCard);
  const count = Math.min(await orderCards.count(), limit);
  const orders: OrderListItem[] = [];

  for (let i = 0; i < count; i++) {
    const card = orderCards.nth(i);
    const orderId = await card.locator(sel.orders.orderId).first().textContent().catch(() => "N/A") ?? "N/A";
    const date = await card.locator(sel.orders.orderDate).first().textContent().catch(() => "N/A") ?? "N/A";
    const total = await card.locator(sel.orders.orderTotal).first().textContent().catch(() => "N/A") ?? "N/A";
    orders.push({ orderId: orderId.trim(), date: date.trim(), total: total.trim() });
  }

  return orders;
}

export async function getOrderDetails(orderId: string): Promise<OrderDetails> {
  const page = await getPage(`${config.walmartBaseUrl}/orders`);
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await humanDelay(500, 1000);

  // Find and click the specific order
  const orderCards = page.locator(sel.orders.orderCard);
  const count = await orderCards.count();
  let found = false;

  for (let i = 0; i < count; i++) {
    const card = orderCards.nth(i);
    const id = await card.locator(sel.orders.orderId).first().textContent().catch(() => "") ?? "";
    if (id.trim().includes(orderId)) {
      const detailsLink = card.locator(sel.orders.viewDetails).first();
      if (await detailsLink.isVisible().catch(() => false)) {
        await detailsLink.click();
        found = true;
        break;
      }
    }
  }

  if (!found) throw new BrowserError(`Order ${orderId} not found`);

  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await humanDelay(500, 1000);

  // Extract details from order page
  const date = await page.locator(sel.orders.orderDate).first().textContent().catch(() => "N/A") ?? "N/A";
  const total = await page.locator(sel.orders.orderTotal).first().textContent().catch(() => "N/A") ?? "N/A";

  const itemEls = page.locator(sel.cart.item);
  const itemCount = await itemEls.count();
  const items: { name: string; price: string; quantity: string }[] = [];

  for (let i = 0; i < itemCount; i++) {
    const el = itemEls.nth(i);
    const name = await el.locator(sel.cart.itemName).first().textContent().catch(() => "Unknown") ?? "Unknown";
    const price = await el.locator(sel.cart.itemPrice).first().textContent().catch(() => "N/A") ?? "N/A";
    items.push({ name: name.trim(), price: price.trim(), quantity: "1" });
  }

  return {
    orderId,
    date: date.trim(),
    total: total.trim(),
    items,
    status: "See tracking for latest status",
  };
}

export async function trackOrder(orderId: string): Promise<TrackingInfo> {
  const page = await getPage(`${config.walmartBaseUrl}/orders`);
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await humanDelay(500, 1000);

  // Find the order and click Track
  const orderCards = page.locator(sel.orders.orderCard);
  const count = await orderCards.count();

  for (let i = 0; i < count; i++) {
    const card = orderCards.nth(i);
    const id = await card.locator(sel.orders.orderId).first().textContent().catch(() => "") ?? "";
    if (id.trim().includes(orderId)) {
      const trackBtn = card.locator(sel.orders.trackBtn).first();
      if (await trackBtn.isVisible().catch(() => false)) {
        await trackBtn.click();
        await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
        await humanDelay(500, 1000);

        const trackingNumber = await page.locator(sel.orders.trackingNumber).first().textContent().catch(() => "N/A") ?? "N/A";
        const status = await page.locator(sel.orders.trackingStatus).first().textContent().catch(() => "N/A") ?? "N/A";

        return {
          orderId,
          trackingNumber: trackingNumber.trim(),
          status: status.trim(),
          carrier: "See tracking page for carrier",
        };
      }
    }
  }

  throw new BrowserError(`Order ${orderId} not found or tracking not available`);
}
