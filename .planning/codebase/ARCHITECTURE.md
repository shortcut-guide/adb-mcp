# Architecture: adb-mcp

This document outlines the system-level patterns and communication architecture for the `adb-mcp` project, which enables AI control of Adobe applications via the Model Context Protocol (MCP).

## System Overview

The project follows a multi-tier communication architecture that bridges modern LLMs with Adobe's internal application APIs.

```
AI Client (e.g., Claude Desktop)
  |
  | (Model Context Protocol / stdio)
  v
MCP Server (Python)
  |
  | (Socket.IO / WebSocket)
  v
Command Proxy Server (Node.js)
  |
  | (Socket.IO / WebSocket)
  v
Adobe App Plugin (UXP / CEP)
  |
  | (Internal Adobe APIs)
  v
Adobe Application (Photoshop, Premiere, etc.)
```

## Key Components

### 1. MCP Servers (`mcp/`)
Implemented in Python using the `FastMCP` framework. These servers expose Adobe application functionalities as "tools" to the LLM.
- **Tools**: Each tool corresponds to a specific action (e.g., `create_pixel_layer`, `add_drop_shadow`).
- **Communication**: Uses `socket_client.py` to send command packets to the Proxy Server. These are blocking calls that wait for a response from the Adobe plugin.
- **Application Specific**: Separate servers exist for Photoshop (`ps-mcp.py`), Premiere (`pr-mcp.py`), etc.

### 2. Command Proxy Server (`adb-proxy-socket/`)
A Node.js application (`proxy.js`) that acts as a central hub for communication.
- **Purpose**: UXP plugins in Adobe applications cannot act as servers; they can only initiate client connections. The proxy provides a stable endpoint for both MCP servers and plugins to connect to.
- **Routing**: Routes `command_packet` messages from MCP servers to the appropriate Adobe application plugin based on registration.
- **Scalability**: Supports multiple concurrent Adobe application connections.

### 3. Adobe App Plugins (`uxp/` and `cep/`)
Plugins that run directly within Adobe applications to execute commands.
- **UXP (Unified Extensibility Platform)**: Modern plugin standard used for Photoshop, Premiere, and InDesign.
- **CEP (Common Extensibility Platform)**: Chromium-based legacy standard used for After Effects and Illustrator.
- **Command Handling**: Receives command packets, parses the action and options, and calls the relevant internal Adobe API (e.g., `batchPlay` in Photoshop).
- **Feedback Loop**: Returns success/failure status and updated application state (e.g., layer lists, document info) back to the MCP server.

## Communication Patterns

### Blocking Command-Response
The communication is inherently synchronous from the MCP server's perspective. When a tool is called:
1. The MCP server sends a `command_packet`.
2. It blocks, waiting for a `packet_response`.
3. The Adobe plugin executes the command and returns the response.
4. The MCP server receives the response and returns the result to the AI client.

### Registration Pattern
Adobe plugins register themselves with the proxy upon connection (e.g., `socket.emit("register", { application: "photoshop" })`). This allows the proxy to correctly route commands from the application-specific MCP servers.
