# Technical Stack

## Primary Languages
- **Python**: Used for implementing Model Context Protocol (MCP) servers that interface with AI models.
- **JavaScript (Node.js)**: Powers the command proxy server and Adobe UXP/CEP extensions.
- **HTML/CSS**: Used for the user interface of Adobe UXP and CEP panels.

## Frameworks & Platforms
- **Model Context Protocol (MCP)**: The core standard used to expose Adobe application functionality as tools for AI models.
- **Adobe UXP (Unified Extensibility Platform)**: Modern extensibility platform for Adobe Photoshop, Illustrator, and InDesign plugins.
- **Adobe CEP (Common Extensibility Platform)**: Legacy extensibility platform used for some Adobe extensions (e.g., Premiere Pro, After Effects).
- **Node.js**: Runtime for the `adb-proxy-socket` which acts as an IPC bridge.
- **Express**: Minimalist web framework used within the Node.js proxy server.

## Core Libraries
### Python (MCP Servers)
- `mcp`: Official Model Context Protocol SDK.
- `python-socketio`: Socket.IO client for communicating with the proxy server.
- `requests`: For making HTTP requests.
- `websocket-client`: Low-level WebSocket support.
- `fonttools`: Manipulation of font files.

### Node.js (Proxy Server)
- `socket.io`: Server-side Socket.IO implementation for real-time IPC.
- `express`: Web server for handling potential HTTP endpoints and serving the proxy.
- `pkg`: Used to package the Node.js proxy into executable binaries for different platforms.

### Adobe Plugins (UXP/CEP)
- `socket.io-client`: Client-side Socket.IO for connecting to the command proxy.
- `uxp`: Adobe UXP internal APIs for application control.
- `photoshop`, `illustrator`, etc.: Application-specific host APIs.
