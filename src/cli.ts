import { Command } from "commander";
import { config, validateAffiliateConfig, validateBrowserConfig } from "./config.js";
import { search } from "./affiliate/endpoints/search.js";
import { getProduct, getProductByUpc } from "./affiliate/endpoints/product.js";
import { getTaxonomy } from "./affiliate/endpoints/taxonomy.js";
import { getTrending } from "./affiliate/endpoints/trending.js";
import { findStores } from "./affiliate/endpoints/stores.js";
import { getRecommendations } from "./affiliate/endpoints/recommendations.js";
import { viewCart, addToCart, removeFromCart, updateCartQuantity } from "./browser/actions/cart.js";
import { startCheckout, confirmCheckout } from "./browser/actions/checkout.js";
import { getOrders, getOrderDetails, trackOrder } from "./browser/actions/orders.js";
import { getRateLimitInfo } from "./utils/rate-limiter.js";
import { closeBrowser } from "./browser/manager.js";

const program = new Command();

program
  .name("walmart-mcp")
  .description("Walmart MCP server + CLI")
  .version("1.0.0");

// Serve command
program
  .command("serve")
  .description("Start the MCP server")
  .option("-p, --port <port>", "Port number", String(config.mcpPort))
  .action(async (opts) => {
    process.env.WALMART_MCP_PORT = opts.port;
    await import("./index.js");
  });

// Search
program
  .command("search <query>")
  .description("Search Walmart products")
  .option("-s, --sort <sort>", "Sort order")
  .option("-n, --num <num>", "Number of results", "10")
  .option("--start <start>", "Starting offset")
  .action(async (query, opts) => {
    validateAffiliateConfig();
    const result = await search({
      query,
      sort: opts.sort,
      numItems: parseInt(opts.num),
      start: opts.start ? parseInt(opts.start) : undefined,
    });
    console.log(JSON.stringify(result, null, 2));
  });

// Product lookup
program
  .command("product <itemId>")
  .description("Get product details by item ID")
  .action(async (itemId) => {
    validateAffiliateConfig();
    const result = await getProduct(itemId);
    console.log(JSON.stringify(result, null, 2));
  });

program
  .command("product-upc <upc>")
  .description("Get product details by UPC")
  .action(async (upc) => {
    validateAffiliateConfig();
    const result = await getProductByUpc(upc);
    console.log(JSON.stringify(result, null, 2));
  });

// Taxonomy
program
  .command("taxonomy")
  .description("Get product category tree")
  .action(async () => {
    validateAffiliateConfig();
    const result = await getTaxonomy();
    console.log(JSON.stringify(result, null, 2));
  });

// Trending
program
  .command("trending")
  .description("Get trending products")
  .option("-c, --category <id>", "Category ID")
  .action(async (opts) => {
    validateAffiliateConfig();
    const result = await getTrending(opts.category);
    console.log(JSON.stringify(result, null, 2));
  });

// Stores
program
  .command("stores")
  .description("Find nearby stores")
  .option("-z, --zip <zip>", "ZIP code")
  .option("--lat <lat>", "Latitude")
  .option("--lon <lon>", "Longitude")
  .action(async (opts) => {
    validateAffiliateConfig();
    const result = await findStores({
      zip: opts.zip,
      lat: opts.lat ? parseFloat(opts.lat) : undefined,
      lon: opts.lon ? parseFloat(opts.lon) : undefined,
    });
    console.log(JSON.stringify(result, null, 2));
  });

// Recommendations
program
  .command("recommendations <itemId>")
  .description("Get product recommendations")
  .action(async (itemId) => {
    validateAffiliateConfig();
    const result = await getRecommendations(itemId);
    console.log(JSON.stringify(result, null, 2));
  });

// Cart commands
const cart = program.command("cart").description("Cart operations");

cart
  .command("view")
  .description("View cart contents")
  .action(async () => {
    validateBrowserConfig();
    const result = await viewCart();
    console.log(JSON.stringify(result, null, 2));
    await closeBrowser();
  });

cart
  .command("add <itemId>")
  .description("Add item to cart")
  .option("-q, --quantity <qty>", "Quantity", "1")
  .action(async (itemId, opts) => {
    validateBrowserConfig();
    const result = await addToCart(itemId, parseInt(opts.quantity));
    console.log(JSON.stringify(result, null, 2));
    await closeBrowser();
  });

cart
  .command("remove <itemId>")
  .description("Remove item from cart")
  .action(async (itemId) => {
    validateBrowserConfig();
    const result = await removeFromCart(itemId);
    console.log(JSON.stringify(result, null, 2));
    await closeBrowser();
  });

cart
  .command("update <itemId> <quantity>")
  .description("Update item quantity")
  .action(async (itemId, quantity) => {
    validateBrowserConfig();
    const result = await updateCartQuantity(itemId, parseInt(quantity));
    console.log(JSON.stringify(result, null, 2));
    await closeBrowser();
  });

// Checkout commands
const checkout = program.command("checkout").description("Checkout operations");

checkout
  .command("start")
  .description("Start checkout — returns order summary + confirmation token")
  .action(async () => {
    validateBrowserConfig();
    const result = await startCheckout();
    console.log(JSON.stringify(result, null, 2));
    console.log("\n⚠️  To place the order, run: walmart-mcp checkout confirm " + result.confirmationToken);
    // Don't close browser — user needs it for confirm
  });

checkout
  .command("confirm <token>")
  .description("Confirm and place order using token from checkout start")
  .action(async (token) => {
    validateBrowserConfig();
    const result = await confirmCheckout(token);
    console.log(JSON.stringify(result, null, 2));
    await closeBrowser();
  });

// Orders
program
  .command("orders")
  .description("List recent orders")
  .option("-n, --num <num>", "Number of orders", "10")
  .action(async (opts) => {
    validateBrowserConfig();
    const result = await getOrders(parseInt(opts.num));
    console.log(JSON.stringify(result, null, 2));
    await closeBrowser();
  });

program
  .command("order <orderId>")
  .description("Get order details")
  .action(async (orderId) => {
    validateBrowserConfig();
    const result = await getOrderDetails(orderId);
    console.log(JSON.stringify(result, null, 2));
    await closeBrowser();
  });

program
  .command("track <orderId>")
  .description("Track an order")
  .action(async (orderId) => {
    validateBrowserConfig();
    const result = await trackOrder(orderId);
    console.log(JSON.stringify(result, null, 2));
    await closeBrowser();
  });

// Rate limit info
program
  .command("rate-limit")
  .description("Show API rate limit status")
  .action(() => {
    const info = getRateLimitInfo(config.rateLimitPerDay);
    console.log(JSON.stringify(info, null, 2));
  });

// Key generation
program
  .command("keygen")
  .description("Generate RSA-2048 key pair for Affiliate API")
  .action(async () => {
    const { generateKeyPairSync } = await import("crypto");
    const { writeFileSync, mkdirSync } = await import("fs");
    const { resolve } = await import("path");
    const outputDir = "./keys";
    mkdirSync(resolve(outputDir), { recursive: true });
    const { publicKey, privateKey } = generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });
    const pubPath = resolve(outputDir, "public.pem");
    const privPath = resolve(outputDir, "private.pem");
    writeFileSync(pubPath, publicKey);
    writeFileSync(privPath, privateKey, { mode: 0o600 });
    console.log(`RSA-2048 key pair generated:`);
    console.log(`  Public:  ${pubPath}`);
    console.log(`  Private: ${privPath}`);
    console.log(`\nUpload the public key to your Walmart.io developer account.`);
    console.log(`Set WALMART_PRIVATE_KEY_PATH=${privPath} in your .env file.`);
  });

program.parseAsync().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
