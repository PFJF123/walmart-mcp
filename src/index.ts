import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { config } from "./config.js";
import { registerAllTools } from "./tools/index.js";
import { closeBrowser } from "./browser/manager.js";

function createServer(): McpServer {
  const server = new McpServer({
    name: "walmart-mcp",
    version: "1.0.0",
  });
  registerAllTools(server);
  return server;
}

const app = createMcpExpressApp();

// Stateless mode: each request gets a fresh server+transport
app.post("/mcp", async (req, res) => {
  const server = createServer();
  try {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
    res.on("close", () => {
      transport.close();
      server.close();
    });
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null,
      });
    }
  }
});

app.get("/mcp", (_req, res) => {
  res.writeHead(405).end(
    JSON.stringify({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Method not allowed." },
      id: null,
    }),
  );
});

app.delete("/mcp", (_req, res) => {
  res.writeHead(405).end(
    JSON.stringify({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Method not allowed." },
      id: null,
    }),
  );
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", name: "walmart-mcp", version: "1.0.0" });
});

const port = config.mcpPort;

const httpServer = app.listen(port, () => {
  console.log(`walmart-mcp server listening on http://127.0.0.1:${port}/mcp`);
});

process.on("SIGINT", async () => {
  await closeBrowser();
  httpServer.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await closeBrowser();
  httpServer.close();
  process.exit(0);
});
