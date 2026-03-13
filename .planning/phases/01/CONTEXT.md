# CONTEXT: Phase 1 - Analysis & API Design

## Goal
Design and implement the core PSD analysis logic and define the API specification for the PSD Component Management System MVP.

## Scope
- **Task 1.1**: PSD Analysis logic (group/layer detection for specific names: `title`, `date`, `main_logo`, `list_XXX`, etc.).
- **Task 1.2**: Data models and OpenAPI 3.1 specification for the management system.
- **Task 1.3**: Implementation of `/api/components/parse` and `/api/components/{id}/form-schema` endpoints.
- **Task 1.4**: Define `list_XXX` variable structure support (pseudo-code and initial logic).

## Key Requirements (from REQUIREMENTS.md)
- Identify layer types: Text, Image, Other.
- Mapping strategy: Name-based mapping (use `groupPath + layerName` for collisions).
- Error handling for `LAYER_NOT_FOUND`, `LAYER_TYPE_MISMATCH`, etc.
- Support for variable `list_XXX` structures.

## Technical Constraints
- Integration with existing Python-based MCP servers (mcp/ps-mcp.py).
- Use Node.js for the API/Proxy if consistent with existing `adb-proxy-socket`.
- OpenAPI 3.1 for API documentation.
