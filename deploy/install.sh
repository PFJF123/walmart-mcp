#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== Walmart MCP Server Installation ==="

# Build
echo "Building..."
cd "$PROJECT_DIR"
pnpm install --frozen-lockfile
pnpm build

# Install Playwright browsers (chromium only)
echo "Installing Playwright Chromium..."
npx playwright install chromium

# Install systemd service
echo "Installing systemd service..."
sudo cp "$SCRIPT_DIR/walmart-mcp.service" /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable walmart-mcp
sudo systemctl start walmart-mcp

# Add to mcporter config
MCPORTER_CONFIG="$HOME/.openclaw/config/mcporter.json"
if [ -f "$MCPORTER_CONFIG" ]; then
  if ! grep -q '"walmart"' "$MCPORTER_CONFIG"; then
    echo "Adding walmart to mcporter config..."
    # Use node to safely merge JSON
    node -e "
      const fs = require('fs');
      const config = JSON.parse(fs.readFileSync('$MCPORTER_CONFIG', 'utf-8'));
      config.mcpServers.walmart = {
        description: 'Walmart MCP - product search (Affiliate API) + cart/checkout/orders (browser automation)',
        url: 'http://127.0.0.1:8020/mcp'
      };
      fs.writeFileSync('$MCPORTER_CONFIG', JSON.stringify(config, null, 2) + '\n');
    "
    echo "Added to mcporter config."
  else
    echo "walmart already in mcporter config."
  fi
fi

# Copy helper script
echo "Installing walmart helper script..."
cp "$SCRIPT_DIR/../scripts/walmart" "$HOME/.openclaw/scripts/walmart" 2>/dev/null || true

echo ""
echo "=== Installation complete ==="
echo "Service: sudo systemctl status walmart-mcp"
echo "Logs:    journalctl -u walmart-mcp -f"
echo ""
echo "Don't forget to:"
echo "  1. Copy .env.example to .env and fill in credentials"
echo "  2. Run 'walmart-mcp keygen' if you need RSA keys"
echo "  3. Log into walmart.com in Chrome first"
