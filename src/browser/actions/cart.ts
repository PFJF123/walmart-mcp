import { getPage } from "../manager.js";
import { sel } from "../selectors.js";
import { humanClick, humanDelay } from "../anti-detect.js";
import { config } from "../../config.js";
import { BrowserError } from "../../utils/errors.js";

export interface CartItem {
  name: string;
  price: string;
  quantity: string;
}

export interface CartSummary {
  items: CartItem[];
  subtotal: string;
  itemCount: number;
}

export async function viewCart(): Promise<CartSummary> {
  const page = await getPage(`${config.walmartBaseUrl}/cart`);
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await humanDelay(500, 1000);

  const emptyEl = await page.locator(sel.cart.emptyMsg).first().isVisible().catch(() => false);
  if (emptyEl) {
    return { items: [], subtotal: "$0.00", itemCount: 0 };
  }

  const itemEls = page.locator(sel.cart.item);
  const count = await itemEls.count();
  const items: CartItem[] = [];

  for (let i = 0; i < count; i++) {
    const el = itemEls.nth(i);
    const name = await el.locator(sel.cart.itemName).first().textContent().catch(() => "Unknown") ?? "Unknown";
    const price = await el.locator(sel.cart.itemPrice).first().textContent().catch(() => "N/A") ?? "N/A";
    const qty = await el.locator(sel.cart.itemQty).first().inputValue().catch(() => "1");
    items.push({ name: name.trim(), price: price.trim(), quantity: qty });
  }

  const subtotal = await page.locator(sel.cart.subtotal).first().textContent().catch(() => "N/A") ?? "N/A";

  return { items, subtotal: subtotal.trim(), itemCount: items.length };
}

export async function addToCart(itemIdOrUrl: string, quantity = 1): Promise<{ success: boolean; message: string }> {
  const url = itemIdOrUrl.startsWith("http")
    ? itemIdOrUrl
    : `${config.walmartBaseUrl}/ip/${itemIdOrUrl}`;

  const page = await getPage(url);
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await humanDelay(500, 1000);

  // Set quantity if > 1
  if (quantity > 1) {
    const qtyEl = page.locator(sel.product.qtySelect).first();
    if (await qtyEl.isVisible().catch(() => false)) {
      await qtyEl.selectOption(String(quantity));
      await humanDelay(200, 400);
    }
  }

  // Click Add to Cart
  const addBtn = page.locator(sel.product.addToCart).first();
  if (!(await addBtn.isVisible().catch(() => false))) {
    throw new BrowserError("Add to Cart button not found — item may be out of stock or page layout changed");
  }

  await humanClick(page, sel.product.addToCart);
  await humanDelay(1000, 2000);

  // Verify it was added by checking for cart flyout or count change
  const title = await page.locator(sel.product.title).first().textContent().catch(() => "item") ?? "item";
  return { success: true, message: `Added ${quantity}x "${title.trim()}" to cart` };
}

export async function removeFromCart(itemId: string): Promise<{ success: boolean; message: string }> {
  const page = await getPage(`${config.walmartBaseUrl}/cart`);
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await humanDelay(500, 1000);

  // Find the item in the cart — look for the item ID in links or data attributes
  const items = page.locator(sel.cart.item);
  const count = await items.count();

  for (let i = 0; i < count; i++) {
    const el = items.nth(i);
    const html = await el.innerHTML();
    if (html.includes(itemId)) {
      const removeBtn = el.locator(sel.cart.removeBtn).first();
      await humanClick(page, sel.cart.removeBtn);
      await humanDelay(1000, 2000);
      return { success: true, message: `Removed item ${itemId} from cart` };
    }
  }

  throw new BrowserError(`Item ${itemId} not found in cart`);
}

export async function updateCartQuantity(itemId: string, quantity: number): Promise<{ success: boolean; message: string }> {
  const page = await getPage(`${config.walmartBaseUrl}/cart`);
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await humanDelay(500, 1000);

  const items = page.locator(sel.cart.item);
  const count = await items.count();

  for (let i = 0; i < count; i++) {
    const el = items.nth(i);
    const html = await el.innerHTML();
    if (html.includes(itemId)) {
      const qtyEl = el.locator(sel.cart.itemQty).first();
      await qtyEl.selectOption(String(quantity));
      await humanDelay(1000, 2000);
      return { success: true, message: `Updated item ${itemId} quantity to ${quantity}` };
    }
  }

  throw new BrowserError(`Item ${itemId} not found in cart`);
}
