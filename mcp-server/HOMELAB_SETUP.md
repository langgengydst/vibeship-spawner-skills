# Homelab MCP Server Setup

This guide explains how to deploy the Spawner Skills MCP server on your homelab and connect to it from your devices.

## 1. Deployment

### Option A: Using Docker (Recommended)

1.  Build the Docker image:
    ```bash
    docker build -t spawner-skills-mcp -f mcp-server/Dockerfile .
    ```

2.  Run the container:
    ```bash
    docker run -d -p 3000:3000 --name spawner-mcp --restart unless-stopped spawner-skills-mcp
    ```

### Option B: Using Docker Compose (Easiest)

1.  From the root of the repository:
    ```bash
    docker-compose up -d --build
    ```

### Option C: Manual Setup

1.  Navigate to the `mcp-server` directory:
    ```bash
    cd mcp-server
    ```

2.  Install dependencies and build:
    ```bash
    npm install
    npm run build
    ```

3.  Start the server:
    ```bash
    npm start
    ```

The server will be available at `http://<your-server-ip>:3000`.

## 2. Client Configuration

To connect Claude Desktop or other MCP clients to your homelab server, use the SSE (Server-Sent Events) endpoint.

### Claude Desktop Configuration

Edit your `claude_desktop_config.json` (usually at `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS or `%APPDATA%\Claude\claude_desktop_config.json` on Windows):

```json
{
  "mcpServers": {
    "homelab-spawner": {
      "endpoint": "http://<your-server-ip>:3000/sse"
    }
  }
}
```

Replace `<your-server-ip>` with the actual IP address or hostname of your homelab server.

### Other Clients

Any MCP-compliant client supporting SSE transport can connect using:
- **SSE Endpoint:** `http://<your-server-ip>:3000/sse`
- **Message Endpoint:** `http://<your-server-ip>:3000/message` (handled automatically by most clients via the SSE connection)
