# Codebase Conventions

This document outlines the naming, style, and patterns used across the `adb-mcp` project.

## General Principles

- **License Headers**: All source files (Python, JS, CSS, etc.) MUST include the MIT License header with the copyright year 2025 Mike Chambers.
- **Project Structure**:
  - `mcp/`: Python-based MCP servers.
  - `adb-proxy-socket/`: Node.js proxy server.
  - `uxp/`: Adobe UXP plugins for Photoshop and Premiere.
  - `cep/`: Legacy Creative Cloud Extension project.
- **Language Requirements**:
  - Python: 3.10+
  - Node.js: 18+

## Python Conventions (`mcp/`)

### Naming
- **Modules**: `snake_case.py` (e.g., `ps-mcp.py`, `socket_client.py`).
- **Functions**: `snake_case` (e.g., `set_active_document`).
- **Variables**: `snake_case`.
- **Constants**: `UPPER_CASE` (e.g., `FONT_LIMIT`, `APPLICATION`).
- **Classes**: `PascalCase` (if any).

### Typing and Documentation
- **Type Hints**: Mandatory for all function signatures (e.g., `def func(arg: int) -> str:`).
- **Docstrings**: Google-style docstrings are used for all public tools and functions.
  ```python
  def example_function(param1: int, param2: str) -> bool:
      """
      Description of the function.

      Args:
          param1 (int): Description of param1.
          param2 (str): Description of param2.

      Returns:
          bool: Description of return value.
      """
  ```

### Tools and Formatting
- **Formatter**: `black` (line length 88).
- **Import Sorting**: `isort` (black profile).
- **Static Analysis**: `mypy` (strict typing).

### Logging
- Use `mcp/logger.py`'s `log` function which prints to `stderr` with a tag.
  ```python
  from logger import log
  log("Message", "TAG")
  ```

## JavaScript Conventions (`adb-proxy-socket/`, `uxp/`, `cep/`)

### Naming
- **Files**: `kebab-case.js` or `snake_case.js`.
- **Functions**: `camelCase` (e.g., `onCommandPacket`, `connectToServer`).
- **Variables**: `camelCase`.
- **Constants**: `UPPER_CASE` (e.g., `PORT`, `PROXY_URL`).

### Style
- **Indentation**: 4 spaces.
- **Semicolons**: Required.
- **Module System**: CommonJS (`require`) is predominantly used, especially in UXP and the proxy.
- **Async/Await**: Preferred for asynchronous operations.

### UXP Specifics
- Use `require("uxp")` and `require("photoshop")` for Adobe-specific APIs.
- Event handlers for socket connection and command processing are common.

## Environmental Constraints
- **Proxy Server**: Must handle large buffer sizes (50MB configured for Socket.IO).
- **Connectivity**: AI <-> MCP Server (Python) <-> Proxy (Node) <-> Plugin (UXP).
