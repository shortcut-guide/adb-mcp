---
phase: 02-form-generation-ui
plan: 02
type: execute
wave: 1
depends_on: [01-analysis-api-design]
files_modified: [
  .planning/phases/02/PLAN.md,
  adb-proxy-socket/proxy.js,
  adb-proxy-socket/public/index.html,
  adb-proxy-socket/public/js/form-generator.js,
  adb-proxy-socket/public/css/style.css
]
autonomous: true
requirements: [2.1, 2.2, 2.3]
must_haves:
  truths:
    - "UI dynamically renders form fields based on the JSON schema provided by the API"
    - "Text fields and Image upload placeholders are functional in the UI"
    - "Repeatable 'list_XXX' structures are correctly represented and manageable (add/remove items)"
    - "The UI can communicate with the Phase 1 API endpoints"
  artifacts:
    - path: "adb-proxy-socket/public/index.html"
      provides: "Main Management UI entry point"
    - path: "adb-proxy-socket/public/js/form-generator.js"
      provides: "Dynamic form generation logic"
    - path: "adb-proxy-socket/public/css/style.css"
      provides: "UI styling"
---

<objective>
Build a dynamic UI that generates management forms from PSD schemas, enabling non-technical users to edit PSD components.

Purpose: To provide an intuitive interface for interacting with the PSD Component Management System.
Output: A static web UI integrated into the adb-proxy-socket server.
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
@.planning/phases/02/CONTEXT.md
</context>

<tasks>

<task type="auto">
  <name>Task 2.1: Implement Dynamic Form Generation from JSON Schema</name>
  <files>adb-proxy-socket/public/js/form-generator.js</files>
  <action>
    - Create a `FormGenerator` module that takes a JSON schema (as defined in Phase 1) and returns a DOM structure.
    - Map schema types to UI elements:
      - `type: "text"` -> `<input type="text">` or `<textarea>`.
      - `type: "image"` -> `<div class="image-upload">` with a file input and preview.
      - `type: "array"` (for `list_XXX`) -> A container that can hold multiple instances of a sub-schema.
    - Implement a recursive rendering strategy to handle nested groups/structures.
    - Add a method to serialize the current form state back into a JSON object matching the component structure.
  </action>
  <verify>Call `FormGenerator.render()` with various mock schemas and assert that the generated DOM contains the expected input elements.</verify>
  <done>Forms are dynamically generated correctly from any valid PSD component schema.</done>
</task>

<task type="auto">
  <name>Task 2.2: Implement Text and Image UI Components</name>
  <files>adb-proxy-socket/public/css/style.css, adb-proxy-socket/public/index.html</files>
  <action>
    - Design and implement the visual styling for form fields (labels, inputs, buttons).
    - Enhance the `IMAGE` component with:
      - A "Placeholder" state showing the original layer's name or a generic icon.
      - A "Preview" state if a file is selected (for future Phase 3 implementation).
    - Implement the "List Management" UI for `list_XXX`:
      - "Add Item" button to append a new item based on the template.
      - "Remove" button on each item.
      - Visual grouping/indentation for list items.
  </action>
  <verify>Manually verify the UI layout and responsiveness. Test the "Add/Remove" functionality for lists in the browser.</verify>
  <done>UI components are visually clear, user-friendly, and support all required interaction patterns.</done>
</task>

<task type="auto">
  <name>Task 2.3: Management UI Integration</name>
  <files>adb-proxy-socket/proxy.js, adb-proxy-socket/public/index.html</files>
  <action>
    - Update `adb-proxy-socket/proxy.js` to serve static files from the `public` directory using `express.static`.
    - Create the main `index.html` dashboard:
      - Header with project name.
      - Sidebar or top bar for "Parsing" a PSD (input field for PSD path).
      - Main area for the generated form.
      - Action footer with "Preview" and "Apply" buttons.
    - Wire up the frontend logic:
      - Handle the "Parse" button click by calling `POST /api/components/parse`.
      - On success, call `GET /api/components/{id}/form-schema` and pass the result to `FormGenerator`.
      - Implement a global event handler for "Apply" that collects data and logs it (prepping for Phase 3).
  </action>
  <verify>Run the proxy server, navigate to `http://localhost:3001`, and perform a full "Parse to Form" workflow using a mock PSD path.</verify>
  <done>The Management UI is fully integrated with the server and provides a complete flow for form generation.</done>
</task>

</tasks>

<testing_strategy>
### Task 2.1 (Form Generation)
- **Unit Tests**: Use a lightweight test runner or a simple HTML test page to verify `FormGenerator` against complex/nested schemas.
- **Serialization Check**: Verify that `serialize()` returns a JSON object that exactly matches the expected structure for the `apply` API.

### Task 2.2 (UI Components)
- **Visual Regression**: Manual check of the UI in different screen sizes.
- **Interaction Tests**: Ensure clicking "Add" in a list correctly clones the template and maintains input values of existing items.

### Task 2.3 (Integration)
- **End-to-End Flow**: Start `adb-proxy-socket`, use the UI to parse a PSD, modify values in the generated form, and verify that the "Apply" payload is correctly constructed in the console/network tab.
- **Error Handling**: Verify the UI displays an error message if the API returns a 404 or 500 (e.g., PSD not found).
</testing_strategy>

<verification>
- [ ] `FormGenerator` renders all field types (Text, Image, Array).
- [ ] `serialize()` produces the correct JSON structure for the API.
- [ ] List items can be added and removed dynamically.
- [ ] `proxy.js` successfully serves the static UI.
- [ ] The UI can fetch a schema and render a form from end-to-end.
</verification>

<success_criteria>
- A functional web dashboard is accessible at the proxy server's URL.
- Forms are automatically and correctly generated from any parsed PSD.
- Users can manage variable-length lists (`list_XXX`) through the UI.
- The UI is ready to be connected to the "Reflection" logic in Phase 3.
</success_criteria>

<output>
After completion, create `.planning/phases/02/02-01-SUMMARY.md`
</output>
