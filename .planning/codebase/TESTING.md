# Codebase Testing

This document outlines the testing strategy, existing suites, and coverage for the `adb-mcp` project.

## Current Testing Status

Based on an initial scan of the codebase, the project currently LACKS a comprehensive automated test suite. While tools are configured, no actual test files (e.g., `test_*.py`, `*.test.js`) are present in the repository.

## Python Testing Strategy (`mcp/`)

The Python components are configured for use with `pytest`.

### Framework
- **Primary Tool**: `pytest`
- **Location**: All tests SHOULD be placed in a `tests/` directory within `mcp/`.
- **Naming**: Test files should follow the `test_*.py` naming convention.

### Recommended Test Types
- **Unit Tests**: Test individual core functions in `core.py`, `fonts.py`, and `logger.py`.
- **Integration Tests**: Test the interaction between the MCP server and a mock proxy server or socket client.
- **MCP Tool Verification**: Use FastMCP's testing capabilities (if available) to verify that tool schemas and logic are correct.

### Test Command
To run tests once implemented:
```bash
pytest mcp/
```

## JavaScript Testing Strategy (`adb-proxy-socket/`, `uxp/`)

No testing framework is currently configured for the Node.js or UXP projects.

### Framework Recommendation
- **Proxy Server**: Use `Jest` or `Mocha` for testing the Socket.IO proxy logic.
- **UXP Plugins**: Testing UXP plugins typically requires specialized tools (like UXP Developer Tool) or manual verification within the Adobe application.

### Recommended Test Types
- **Proxy Logic**: Mock socket connections to verify that command packets are correctly routed between senders and receivers.
- **Schema Validation**: Verify that the JSON command structures used for communication remain consistent.

## Verification for Quality Focus

To ensure high quality, every new feature or bug fix SHOULD be accompanied by an empirical reproduction script or a new test case.

1. **Reproduction**: Create a minimal script that demonstrates a bug or a new feature.
2. **Implementation**: Apply the fix or implementation.
3. **Verification**: Run the reproduction script to confirm the success.
4. **Permanent Tests**: Integrate the script into the official test suite once established.
