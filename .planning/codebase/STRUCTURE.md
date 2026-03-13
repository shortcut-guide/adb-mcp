# Structure: adb-mcp

This document provides a directory tree and the purpose of major folders in the `adb-mcp` project.

## Directory Tree

```
adb-mcp/
├── .gemini/               # Gemini configuration and internal scripts
├── .planning/             # Project planning and codebase documentation
│   └── codebase/          # Architectual and structural documentation
├── adb-proxy-socket/      # Node.js command proxy server
│   ├── node_modules/      # Node dependencies
│   ├── package.json       # Project configuration for Node proxy
│   └── proxy.js           # Main proxy server entry point
├── cep/                   # Common Extensibility Platform (CEP) plugins
│   ├── com.mikechambers.ae/ # After Effects plugin
│   └── com.mikechambers.ai/ # Illustrator plugin
├── docs/                  # Project documentation (Markdown files)
├── dxt/                   # Distribution extension/build configuration
├── images/                # Visual assets for documentation
├── mcp/                   # Model Context Protocol (MCP) server implementations
│   ├── ae-mcp.py          # After Effects MCP server
│   ├── ai-mcp.py          # Illustrator MCP server
│   ├── core.py            # Shared MCP logic (init, sendCommand)
│   ├── fonts.py           # Font management utilities
│   ├── id-mcp.py          # InDesign MCP server
│   ├── logger.py          # Project logger
│   ├── pr-mcp.py          # Premiere Pro MCP server
│   ├── ps-batch-play.py   # Photoshop-specific batchPlay utilities
│   ├── ps-mcp.py          # Photoshop MCP server
│   ├── socket_client.py   # Socket.IO client for Python MCP servers
│   └── uv.lock            # Python dependency lock file
└── uxp/                   # Unified Extensibility Platform (UXP) plugins
    ├── id/                # InDesign plugin
    ├── pr/                # Premiere Pro plugin
    └── ps/                # Photoshop plugin
        ├── commands/      # Plugin-side command handlers
        ├── index.html     # Plugin UI entry point
        ├── main.js        # Main plugin logic and Socket.IO connection
        ├── manifest.json  # UXP plugin manifest
        └── socket.io.js   # Client-side Socket.IO library
```

## Folder Purposes

### `adb-proxy-socket/`
Contains the Node.js implementation of the command proxy. This is a critical architectural component that bridges the MCP server with the Adobe app plugins.

### `cep/`
Contains legacy CEP (Chromium-based) plugins for Adobe applications that do not yet support UXP or where legacy implementations are preferred (e.g., After Effects, Illustrator).

### `mcp/`
The core logic for the MCP servers. Each application has a corresponding Python script that defines the tools available to the AI. This folder also includes shared utilities for font listing, logging, and socket communication.

### `uxp/`
Contains modern UXP (React/JavaScript) plugins for Photoshop, Premiere, and InDesign. Each sub-folder contains the manifest and source code for the respective application's plugin.

### `docs/`
Houses additional documentation for the project beyond the top-level README.

### `.planning/`
Stores the project's internal planning and research documents.
- `codebase/`: Contains analysis and mapping of the codebase (e.g., `ARCHITECTURE.md`, `STRUCTURE.md`).
