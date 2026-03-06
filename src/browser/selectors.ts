// Centralized selectors for walmart.com — update here when site changes

export const sel = {
  // Cart page
  cart: {
    container: '[data-testid="cart-root"], [data-automation-id="cart-root"], .cart-container',
    item: '[data-testid="cartItem"], [data-automation-id="cart-item"], .cart-item',
    itemName: '[data-testid="cartItemName"], .cart-item-name, [role="heading"]',
    itemPrice: '[data-testid="cartItemPrice"], .cart-item-price, [data-automation-id="item-price"]',
    itemQty: '[data-testid="cartItemQty"] select, .cart-item-qty select, [data-automation-id="quantity-picker"]',
    removeBtn: '[data-testid="cartItemRemove"], button[aria-label*="Remove"], [data-automation-id="cart-item-remove"]',
    subtotal: '[data-testid="cart-subtotal"], [data-automation-id="cart-subtotal"], .cart-subtotal',
    emptyMsg: '[data-testid="empty-cart"], .empty-cart-message',
  },

  // Product page
  product: {
    addToCart: '[data-testid="add-to-cart-btn"], button[data-tl-id*="add-to-cart"], #add-to-cart-btn, button:has-text("Add to cart")',
    qtySelect: '[data-testid="quantity-selector"], select[name="quantity"]',
    price: '[data-testid="price-wrap"] [itemprop="price"], [data-automation-id="product-price"]',
    title: '[data-testid="product-title"], h1[itemprop="name"], #product-title',
  },

  // Checkout
  checkout: {
    continueBtn: 'button:has-text("Continue"), [data-testid="checkout-continue"]',
    placeOrderBtn: 'button:has-text("Place order"), [data-testid="place-order-btn"]',
    orderTotal: '[data-testid="order-total"], [data-automation-id="order-total"], .order-summary-total',
    shippingAddress: '[data-testid="shipping-address"], [data-automation-id="fulfillment-address"]',
    paymentMethod: '[data-testid="payment-method"], [data-automation-id="payment-section"]',
    orderConfirmation: '[data-testid="order-confirmation"], .order-confirmation, .thank-you-page',
    orderId: '[data-testid="order-id"], .order-number',
  },

  // Orders page
  orders: {
    orderCard: '[data-testid="order-card"], .order-card, [data-automation-id="order-card"]',
    orderId: '[data-testid="order-id"], .order-number',
    orderDate: '[data-testid="order-date"], .order-date',
    orderTotal: '[data-testid="order-total"], .order-total',
    trackBtn: 'a:has-text("Track"), button:has-text("Track"), [data-testid="track-order"]',
    viewDetails: 'a:has-text("View details"), [data-testid="view-order-details"]',
    trackingNumber: '[data-testid="tracking-number"], .tracking-number',
    trackingStatus: '[data-testid="tracking-status"], .tracking-status',
  },

  // Global
  global: {
    cartIcon: '[data-testid="cart-icon"], a[href*="/cart"], [data-automation-id="cart-count"]',
    signInLink: 'a:has-text("Sign in"), [data-testid="sign-in"]',
    accountMenu: '[data-testid="account-menu"], [data-automation-id="account"]',
  },
} as const;
