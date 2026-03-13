---
phase: 03-mcp-reflection-resilience
plan: 03
type: execute
wave: 3
depends_on: [02]
files_modified: [.planning/phases/03/PLAN.md]
autonomous: true
requirements: [3.1, 3.2, 3.3, 3.4]
must_haves:
  truths:
    - "Photoshop MCP integration can reflect text and image changes back to the PSD"
    - "API endpoints for applying changes, previewing, and diffing are functional"
    - "Robust error handling and retry logic are implemented for MCP communication"
    - "Variable list structures (list_XXX) are correctly updated in the PSD"
  artifacts:
    - path: "adb-proxy-socket/api/components.js"
      provides: "Reflection API endpoints"
    - path: "adb-proxy-socket/lib/resilience.js"
      provides: "Retry and error handling logic"
    - path: "docs/naming-conventions.md"
      provides: "Guide for non-engineers"
---

<objective>
Implement the logic to reflect form changes back to Photoshop via MCP, develop the necessary API endpoints, add resilience through error handling and retry strategies, and document the system for non-engineers.

Purpose: To close the loop between the management UI and Photoshop, ensuring edits are accurately and reliably applied to the design.
Output: Reflection logic, apply/preview/diff endpoints, resilience module, and naming convention guide.
</objective>

<execution_context>
@./.gemini/get-shit-done/workflows/execute-plan.md
@./.gemini/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/REQUIREMENTS.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/03/CONTEXT.md
</context>

<tasks>

<task type="auto">
  <name>Task 3.1: Implement Photoshop MCP integration for applying changes</name>
  <files>adb-proxy-socket/api/components.js, mcp/ps-mcp.py</files>
  <action>
    - Implement a mapping function in the proxy to translate form field updates to MCP tool calls.
    - Use `edit_text_layer` for updating text content in Photoshop.
    - Use `place_image` for replacing image layers (supporting local paths or base64 if possible).
    - Implement the logic for `list_XXX` variable structures:
      - Compare the new list state from the form with the current PSD state.
      - If an item is added: Duplicate the "template" group (first child of `list_XXX`) and update its children.
      - If an item is removed: Delete the corresponding group/layer in Photoshop.
      - If an item is modified: Update its nested children (text/image) using their relative paths/IDs.
  </action>
  <verify>Use a test script to send an 'apply' payload to the proxy and verify that the corresponding layers in a mock Photoshop environment (or via tool call logs) are updated correctly.</verify>
  <done>Text, image, and list changes are successfully translated into MCP tool calls.</done>
</task>

<task type="auto">
  <name>Task 3.2: Develop API endpoints: apply, preview-apply, diff</name>
  <files>adb-proxy-socket/api/components.js</files>
  <action>
    - Implement `POST /api/components/{id}/apply`:
      - Retrieve the current form data and the component metadata.
      - Execute the reflection logic (Task 3.1) sequentially or in parallel (where safe).
      - Return a summary of applied changes and any errors encountered.
    - Implement `POST /api/components/{id}/preview-apply`:
      - Execute the changes without "finalizing" (e.g., without saving the PSD).
      - This allows the user to see the result in Photoshop before committing.
    - Implement `POST /api/components/{id}/diff`:
      - Calculate the difference between the current form state and the last known PSD state (or original state).
      - Return a structured JSON of changed fields and values.
  </action>
  <verify>Call each endpoint with valid/invalid payloads and assert the response codes and data structures.</verify>
  <done>Apply, preview, and diff endpoints are functional and correctly manage the state transition.</done>
</task>

<task type="auto">
  <name>Task 3.3: Detailed error handling and resilience logic</name>
  <files>adb-proxy-socket/lib/resilience.js, adb-proxy-socket/api/components.js</files>
  <action>
    - Create a `resilience.js` module to wrap MCP tool calls with retry logic.
    - Implement exponential backoff for `MCP_TIMEOUT` errors (e.g., max 3 retries, starting at 1s).
    - Implement detailed error reporting for common failure modes:
      - `LAYER_NOT_FOUND`: If a target layer name or path is missing.
      - `TYPE_MISMATCH`: If a text tool is used on an image layer.
      - `APPLY_PARTIAL_FAILED`: If some changes in a batch were successful but others failed.
    - Integrate this logic into the `apply` and `preview-apply` endpoints.
  </action>
  <verify>Simulate MCP failures (timeout, network error) and verify that the retry logic kicks in and the error responses are descriptive.</verify>
  <done>The system reliably handles transient failures and provides clear feedback on errors.</done>
</task>

<task type="auto">
  <name>Task 3.4: Finalize Non-engineer Guide</name>
  <files>docs/naming-conventions.md</files>
  <action>
    - Write a detailed guide for designers on how to prepare PSDs for the system.
    - Define naming conventions:
      - `list_XXX` prefix for repeatable groups.
      - Specific target names: `title`, `date`, `main_logo`, etc.
    - Explain the mapping between layer types (Text, Image) and form fields.
    - Document rules for grouping and hierarchy to ensure correct parsing and reflection.
  </action>
  <verify>Review the guide for clarity and completeness with a non-technical perspective.</verify>
  <done>Documentation is complete and provides actionable instructions for designers.</done>
</task>

</tasks>

<testing_strategy>
### Task 3.1 & 3.2 (Reflection & API)
- **End-to-End Test**: Use the dynamic UI (from Phase 2) to edit a mock component and click "Apply". Assert that the proxy receives the correct payload and issues the expected tool calls.
- **Payload Validation**: Ensure the `diff` endpoint correctly identifies added/removed/modified items in a `list_XXX` structure.

### Task 3.3 (Resilience)
- **Chaos Testing**: Manually disconnect the MCP server or inject delays to trigger timeouts and verify exponential backoff behavior.
- **Unit Tests**: Test the `resilience.js` wrapper with a mock function that fails a specific number of times.

### Task 3.4 (Documentation)
- **Peer Review**: Verify that the naming convention guide matches the implementation in `ps-analysis.py`.
</testing_strategy>

<verification>
- [ ] Text edits are reflected in Photoshop via `edit_text_layer`.
- [ ] Image replacements are reflected via `place_image`.
- [ ] `list_XXX` additions/deletions are handled correctly.
- [ ] Retry logic successfully recovers from a simulated 1-second delay.
- [ ] Error responses include `fieldId` and `errorMessage`.
</verification>

<success_criteria>
- Edits in the management UI are accurately reflected in the PSD.
- The system handles communication errors gracefully without crashing.
- Designers have a clear set of rules to follow for PSD preparation.
- All Phase 3 endpoints are functional and return valid OpenAPI-compliant responses.
</success_criteria>

<output>
After completion, create `.planning/phases/03/03-01-SUMMARY.md`
</output>
