---
phase: 01-analysis-api-design
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [.planning/phases/01/PLAN.md]
autonomous: true
requirements: [1.1, 1.2, 1.3, 1.4]
must_haves:
  truths:
    - "PSD layer tree can be parsed into a structured JSON representation"
    - "Specific target layers (title, date, list_XXX, etc.) are correctly identified"
    - "API endpoints for parsing and schema retrieval are defined and functional"
    - "Variable list structures (list_XXX) are mapped to array-like form schemas"
  artifacts:
    - path: "mcp/ps-analysis.py"
      provides: "PSD analysis logic"
    - path: "docs/openapi.yaml"
      provides: "OpenAPI 3.1 specification"
    - path: "adb-proxy-socket/api/components.js"
      provides: "API endpoints for component management"
---

<objective>
Analyze PSD components, generate form schemas, and define the API specification for the PSD Component Management System MVP.

Purpose: To establish the foundational analysis logic and communication interface between the management UI and Photoshop.
Output: PSD analysis module, OpenAPI specification, and core API endpoints.
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
@.planning/phases/01/CONTEXT.md
</context>

<tasks>

<task type="auto">
  <name>Task 1.1: Implement PSD Analysis logic</name>
  <files>mcp/ps-analysis.py</files>
  <action>
    - Create a recursive function to traverse the PSD layer tree (retrieved via Photoshop MCP).
    - Implement name-based mapping for target groups/layers: `title`, `date`, `main_logo`, `list_XXX`, `main_text`, `sub_text`, `center_text`, `img_台`, `img_main`, `bg`.
    - Detect layer types: `TEXT` for text layers, `IMAGE` for pixel/smart object layers, `OTHER` for others.
    - Handle naming collisions by using `groupPath + layerName` as a unique identifier.
    - Return a structured JSON object containing identified components and their properties (coordinates, text content, etc.).
  </action>
  <verify>Run a script that passes a mock PSD layer tree to the analysis function and asserts the output structure.</verify>
  <done>PSD components are correctly identified and typed based on their names.</done>
</task>

<task type="auto">
  <name>Task 1.2: Define Data Models and OpenAPI 3.1 Specification</name>
  <files>docs/openapi.yaml</files>
  <action>
    - Define core data models:
      - `Component`: Metadata for the target PSD.
      - `Group`: Logical grouping of layers (e.g., `list_XXX`).
      - `Layer`: Properties (id, type, name, path).
      - `FormField`: UI schema (label, type, defaultValue, validation).
    - Create OpenAPI 3.1 specification for endpoints:
      - `POST /api/components/parse`
      - `GET /api/components/{id}/form-schema`
      - `POST /api/components/{id}/preview-apply` (placeholder)
      - `POST /api/components/{id}/apply` (placeholder)
  </action>
  <verify>Validate the `openapi.yaml` file using an OpenAPI linter (e.g., Redocly or Spectral).</verify>
  <done>OpenAPI specification is valid and covers all required endpoints and models.</done>
</task>

<task type="auto">
  <name>Task 1.3: Implement Core API Endpoints</name>
  <files>adb-proxy-socket/api/components.js</files>
  <action>
    - Implement `POST /api/components/parse`:
      - Receive PSD path or file.
      - Call the PSD analysis logic (from Task 1.1).
      - Store the component metadata and return the analysis result.
    - Implement `GET /api/components/{id}/form-schema`:
      - Retrieve analysis result for the given ID.
      - Map identified layers to `FormField` objects (Text -> Input, Image -> Upload).
      - Return the generated JSON schema for the UI.
  </action>
  <verify>Use `curl` or a test script to call the endpoints and verify the response structure and status codes.</verify>
  <done>Endpoints are functional and return correct form schemas based on PSD analysis.</done>
</task>

<task type="auto">
  <name>Task 1.4: Implement list_XXX Variable Support Logic</name>
  <files>mcp/ps-analysis.py, adb-proxy-socket/api/components.js</files>
  <action>
    - In `ps-analysis.py`, detect groups with the `list_` prefix.
    - Treat children of `list_XXX` groups as repeatable item templates.
    - In `components.js`, map `list_XXX` groups to array-type form fields.
    - Define how multiple items in a list are addressed (e.g., `list_item[0].title`, `list_item[1].title`).
  </action>
  <verify>Test with a mock PSD containing a `list_items` group and verify the generated schema contains an array field.</verify>
  <done>`list_XXX` structures are correctly parsed and represented in the form schema.</done>
</task>

</tasks>

<testing_strategy>
### Task 1.1 (Analysis)
- **Unit Tests**: Create a suite of test cases with various JSON-simulated PSD layer trees (nested groups, duplicate names, different layer types).
- **Mocking**: Use a mock MCP client to simulate Photoshop responses.

### Task 1.2 (Models/API Spec)
- **Linting**: Run `npx @redocly/cli lint docs/openapi.yaml` to ensure specification compliance.

### Task 1.3 (Endpoints)
- **Integration Tests**: Set up a local test server and use `supertest` or `curl` to verify endpoint behavior.
- **Payload Validation**: Ensure the `form-schema` output matches the requirements for the dynamic form generator (Phase 2).

### Task 1.4 (list_XXX Support)
- **Scenario Testing**: Verify that nested `list_` structures or multiple `list_` groups are handled without collision.
- **Schema Verification**: Assert that the generated schema for `list_XXX` follows a consistent array pattern.
</testing_strategy>

<verification>
- [ ] PSD Analysis logic passes all mock tree unit tests.
- [ ] OpenAPI 3.1 specification is lint-free and complete.
- [ ] `/api/components/parse` returns valid component metadata.
- [ ] `/api/components/{id}/form-schema` generates correct UI fields (Input/Upload/Array).
</verification>

<success_criteria>
- PSD components are correctly parsed into JSON schemas.
- Forms can be generated with correct field types (Text, Image, List).
- API specification is clearly defined and serves as a contract for Phase 2.
</success_criteria>

<output>
After completion, create `.planning/phases/01/01-01-SUMMARY.md`
</output>
