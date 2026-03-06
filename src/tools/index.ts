import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAffiliateTools } from "./affiliate-tools.js";
import { registerBrowserTools } from "./browser-tools.js";

export function registerAllTools(server: McpServer) {
  registerAffiliateTools(server);
  registerBrowserTools(server);
}
