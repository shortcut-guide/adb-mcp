# Codebase Concerns

**Analysis Date:** 2025-01-24

## Tech Debt

**Socket Client Connect-per-Command Pattern:**
- Issue: `socket_client.py` connects, sends a message, and disconnects for every single command.
- Files: `mcp/socket_client.py`
- Why: Simple to implement as a synchronous, blocking call for MCP tools.
- Impact: High latency for tool calls, significant IPC overhead, and increased risk of handshake failures.
- Fix approach: Implement a persistent socket connection in `socket_client.py` and reuse it across multiple tool calls.

**Redundant Layer List in Responses:**
- Issue: `onCommandPacket` in the UXP plugin returns the entire layer list and document info for every command, even simple ones.
- Files: `uxp/ps/main.js`, `uxp/ai/main.js` (presumably)
- Why: Ensures the MCP server always has the latest state, but is very inefficient.
- Impact: Large payload sizes for every response, leading to performance degradation in documents with hundreds of layers.
- Fix approach: Implement a more granular state update mechanism or only return the layer list when explicitly requested.

**Code Duplication across MCP Servers:**
- Issue: `ae-mcp.py`, `ai-mcp.py`, `id-mcp.py`, `pr-mcp.py`, and `ps-mcp.py` share similar initialization and tool definition patterns that are copy-pasted.
- Files: `mcp/*.py`
- Why: Independent development of different app servers.
- Impact: Hard to maintain; a change in common logic (like socket configuration) must be applied to all files.
- Fix approach: Refactor common MCP server logic into `mcp/core.py` or a base class.

## Known Bugs

**Race Condition with Multiple App Instances:**
- Symptoms: `socket_client.py` might receive a response from a different instance of the application than the one intended if multiple panels or apps are open.
- Trigger: Multiple UXP panels or multiple Adobe applications registered under the same application string (e.g., "photoshop").
- Files: `adb-proxy-socket/proxy.js`, `mcp/socket_client.py`
- Workaround: Ensure only one instance of the app/plugin is running.
- Root cause: `proxy.js` broadcasts `command_packet` to all registered clients for an application, and `socket_client.py` takes the first response it receives.
- Fix: Use unique session IDs or application instances to route commands to specific clients.

## Security Considerations

**Unauthenticated Proxy Server:**
- Risk: `adb-proxy-socket` has no authentication mechanism. Any client on the network could send commands to any registered Adobe application.
- Files: `adb-proxy-socket/proxy.js`
- Current mitigation: None.
- Recommendations: Add a shared secret or token-based authentication between the MCP server, proxy, and UXP plugin. Restrict listener to `localhost` by default.

## Performance Bottlenecks

**Layer List Serialization:**
- Problem: Serializing and transferring the entire layer tree from Photoshop to Python.
- File: `uxp/ps/main.js` (line ~49), `mcp/ps-mcp.py`
- Measurement: Not measured, but payload can easily exceed several megabytes for complex documents.
- Cause: `getLayers()` is called on every command packet.
- Improvement path: Only return layers if they have changed (checksum/versioning) or if the specific tool requires it.

**Python Client Threading Overhead:**
- Problem: A new thread is spawned for every `send_message_blocking` call.
- File: `mcp/socket_client.py` (line ~99)
- Cause: Attempting to handle the asynchronous `socketio.Client` in a synchronous tool call.
- Improvement path: Use a persistent background thread for the socket client and a thread-safe queue/event for response handling.

## Fragile Areas

**Socket Handshake:**
- Why fragile: The connect-per-command pattern makes every tool call dependent on a successful WebSocket handshake.
- Common failures: `Connection Timed Out`, `Could not connect to application`.
- Safe modification: Move to a persistent connection with robust reconnection logic.
- Test coverage: None.

## Scaling Limits

**WebSocket Buffer Size:**
- Current capacity: `maxHttpBufferSize` is 50MB.
- Limit: Commands returning massive amounts of data (e.g., raw pixel data for high-res images) might hit this limit or cause memory issues in the proxy/client.
- Symptoms at limit: Disconnections or failed message transfers.

## Dependencies at Risk

**python-socketio / socket.io:**
- Risk: Potential version mismatches between the Python client and the Node.js server.
- Impact: Handshake failures or protocol errors.
- Migration plan: Ensure consistent versioning across the stack.

## Missing Critical Features

**Version Checking:**
- Problem: No mechanism to verify that the Adobe app version or UXP plugin version is compatible with the MCP server.
- Current workaround: None.
- Blocks: Ensuring reliability across different user environments.

## Test Coverage Gaps

**Total Lack of Automated Tests:**
- What's not tested: Everything.
- Risk: Regressions are easy to introduce; difficult to verify fixes across multiple Adobe apps.
- Priority: High.
- Difficulty to test: Requires mocking Adobe app responses and socket communication.

---

*Concerns audit: 2025-01-24*
