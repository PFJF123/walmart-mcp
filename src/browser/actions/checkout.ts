import { v4 as uuidv4 } from "uuid";
import { getPage } from "../manager.js";
import { sel } from "../selectors.js";
import { humanClick, humanDelay } from "../anti-detect.js";
import { config } from "../../config.js";
import { CheckoutError } from "../../utils/errors.js";

interface PendingCheckout {
  token: string;
  createdAt: number;
  summary: OrderSummary;
}

export interface OrderSummary {
  items: { name: string; price: string; quantity: string }[];
  shippingAddress: string;
  paymentMethod: string;
  orderTotal: string;
  confirmationToken: string;
}

const TOKEN_TTL_MS = 5 * 60 * 1000;
const pendingCheckouts = new Map<string, PendingCheckout>();

// Cleanup expired tokens periodically
setInterval(() => {
  const now = Date.now();
  for (const [token, checkout] of pendingCheckouts) {
    if (now - checkout.createdAt > TOKEN_TTL_MS) {
      pendingCheckouts.delete(token);
    }
  }
}, 60_000);

export async function startCheckout(): Promise<OrderSummary> {
  const page = await getPage(`${config.walmartBaseUrl}/cart`);
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await humanDelay(500, 1000);

  // Navigate through checkout flow
  const checkoutBtn = page.locator('button:has-text("Check out"), a:has-text("Check out"), [data-testid="checkout-btn"]').first();
  if (!(await checkoutBtn.isVisible().catch(() => false))) {
    throw new CheckoutError("Checkout button not found — cart may be empty");
  }

  await humanClick(page, 'button:has-text("Check out"), a:has-text("Check out"), [data-testid="checkout-btn"]');
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
  await humanDelay(1000, 2000);

  // Click continue through any intermediate steps
  for (let i = 0; i < 3; i++) {
    const continueBtn = page.locator(sel.checkout.continueBtn).first();
    if (await continueBtn.isVisible().catch(() => false)) {
      await humanClick(page, sel.checkout.continueBtn);
      await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
      await humanDelay(1000, 2000);
    } else {
      break;
    }
  }

  // Extract order summary
  const items = await extractCheckoutItems(page);
  const shippingAddress = await page.locator(sel.checkout.shippingAddress).first().textContent().catch(() => "N/A") ?? "N/A";
  const paymentMethod = await page.locator(sel.checkout.paymentMethod).first().textContent().catch(() => "N/A") ?? "N/A";
  const orderTotal = await page.locator(sel.checkout.orderTotal).first().textContent().catch(() => "N/A") ?? "N/A";

  const token = uuidv4();
  const summary: OrderSummary = {
    items,
    shippingAddress: shippingAddress.trim(),
    paymentMethod: paymentMethod.trim(),
    orderTotal: orderTotal.trim(),
    confirmationToken: token,
  };

  pendingCheckouts.set(token, { token, createdAt: Date.now(), summary });

  return summary;
}

export async function confirmCheckout(confirmationToken: string): Promise<{ success: boolean; orderId: string; message: string }> {
  const pending = pendingCheckouts.get(confirmationToken);
  if (!pending) {
    throw new CheckoutError("Invalid or expired confirmation token. Run checkout_start again.");
  }

  if (Date.now() - pending.createdAt > TOKEN_TTL_MS) {
    pendingCheckouts.delete(confirmationToken);
    throw new CheckoutError("Confirmation token expired (5 minute TTL). Run checkout_start again.");
  }

  pendingCheckouts.delete(confirmationToken);

  const page = await getPage();

  // Look for the Place Order button
  const placeOrderBtn = page.locator(sel.checkout.placeOrderBtn).first();
  if (!(await placeOrderBtn.isVisible().catch(() => false))) {
    throw new CheckoutError(
      "Place Order button not found — the checkout page may have changed. " +
        "Browser is still open for manual completion.",
    );
  }

  await humanClick(page, sel.checkout.placeOrderBtn);

  // Wait for confirmation
  try {
    await page.waitForSelector(sel.checkout.orderConfirmation, { timeout: 30000 });
  } catch {
    throw new CheckoutError(
      "Order confirmation page did not appear within 30s. " +
        "Check browser — the order may still be processing.",
    );
  }

  const orderId = await page.locator(sel.checkout.orderId).first().textContent().catch(() => "unknown") ?? "unknown";

  return {
    success: true,
    orderId: orderId.trim(),
    message: `Order placed successfully! Order ID: ${orderId.trim()}`,
  };
}

async function extractCheckoutItems(page: import("playwright").Page) {
  const items: { name: string; price: string; quantity: string }[] = [];
  const cartItems = page.locator(sel.cart.item);
  const count = await cartItems.count().catch(() => 0);

  for (let i = 0; i < count; i++) {
    const el = cartItems.nth(i);
    const name = await el.locator(sel.cart.itemName).first().textContent().catch(() => "Unknown") ?? "Unknown";
    const price = await el.locator(sel.cart.itemPrice).first().textContent().catch(() => "N/A") ?? "N/A";
    const qty = await el.locator(sel.cart.itemQty).first().inputValue().catch(() => "1");
    items.push({ name: name.trim(), price: price.trim(), quantity: qty });
  }

  return items;
}
