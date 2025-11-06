#!/bin/sh
# Gemini AI MCP Server Startup Script
# Compatible with smithery.ai and local development

set -e

# Change to script directory
cd "$(dirname "$0")"

echo "🚀 Starting Gemini AI MCP Server..." >&2
echo "📡 Compatible with smithery.ai and MCP protocol" >&2
echo "🔧 Demo mode - Using mock functionality for testing" >&2

# Check if demo server exists
if [ -f "demo-server.js" ]; then
    echo "📦 Starting demo server with mock functionality..." >&2
    exec node demo-server.js
else
    echo "❌ Demo server not found" >&2
    exit 1
fi