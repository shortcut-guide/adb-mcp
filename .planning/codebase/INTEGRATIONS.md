# Integrations

## Architecture Overview
The system follows a hub-and-spoke architecture where a central proxy server (`adb-proxy-socket`) bridges communication between multiple AI-facing MCP servers (Python) and target Adobe application plugins (UXP/CEP).

## Inter-Process Communication (IPC)
- **Socket.io (WebSockets)**: The primary communication mechanism for real-time command dispatch and response handling.
- **Protocol**: Custom JSON command packets are sent over Socket.io.
- **Workflow**:
    1. **Proxy Server Initiation**: The `adb-proxy-socket` starts as a Node.js server (typically on port 3001).
    2. **Adobe Plugin Registration**: Upon launch, the Adobe UXP/CEP plugin connects to the proxy and registers itself for a specific application (e.g., "photoshop", "illustrator").
    3. **MCP Server Command Dispatch**: When an AI model invokes an MCP tool, the Python MCP server connects to the proxy as a client and emits a `command_packet` with the target application name and command payload.
    4. **Proxy Command Forwarding**: The proxy identifies all clients registered for that application and broadcasts the command to them.
    5. **Plugin Execution**: The plugin (UXP/CEP) receives the command, routes it to the appropriate application handler, and executes the requested action.
    6. **Response Cycle**: The plugin emits a `command_packet_response` back to the proxy, which then forwards it to the original MCP server (the sender) to complete the AI tool call.

## External SDKs & APIs
- **Model Context Protocol (MCP) SDK**: Used by the Python servers to define and register tools and resources available to AI agents.
- **Adobe UXP API**: Provides high-level control over Adobe applications (Photoshop, etc.) and allows plugins to perform operations on the host application's DOM and engine.
- **Adobe CEP (ExtendScript)**: Used in older extensions for Premiere Pro and After Effects to script application behavior.
- **Express JS**: Handles standard HTTP requests if required by the proxy layer.

## Connection Endpoints
- **Proxy Server Default**: `ws://localhost:3001` or `http://localhost:3001`
- **Fallback HTTP (Optional)**: `http://localhost:3030/commands/get/{application}/` (referenced in UXP source for polling-based fallbacks).
