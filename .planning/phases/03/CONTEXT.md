# CONTEXT: Phase 3 - MCP Reflection & Resilience

## Goal
Implement the core logic to apply form changes back to Photoshop via MCP and add error handling/resilience.

## Scope
- **Task 3.1**: Implement Photoshop MCP integration for applying changes (Text content, Image replacement via path/base64).
- **Task 3.2**: Develop `POST /api/components/{id}/apply`, `preview-apply`, and `diff` endpoints in the proxy.
- **Task 3.3**: Add robust error handling (LAYER_NOT_FOUND, TYPE_MISMATCH, etc.) and a retry strategy with exponential backoff.
- **Task 3.4**: Finalize the non-engineer guide (naming conventions, rules) and completion report.

## Key Requirements (from REQUIREMENTS.md)
- Reflect text layer changes.
- Reflect image layer changes (Image replacement).
- Support variable `list_XXX` structures (adding/removing/modifying items in PSD).
- Clear error reporting: field, layer, and cause.
- Exponential backoff for MCP timeouts.

## Technical Constraints
- Integration with existing `ps-mcp.py` tools or extending it.
- Communication via `adb-proxy-socket` (Socket.io).
- Compatibility with naming convention mapping.
