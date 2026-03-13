---
phase: 03
gap_closure: true
---

# Gap Closure Plan: Phase 3 - PSD Component Management System MVP

## Overview
This plan addresses identified gaps in Phase 3 (Photoshop Reflection and UI Integration) of the PSD Component Management System. These gaps relate to adding new list items, lack of validation feedback, and missing automatic UI updates.

## Identified Gaps
- **GAP-01**: New list items are duplicated but not updated with their values in the same pass.
- **GAP-02**: Missing specific validation error codes (e.g., `INVALID_TEXT_LENGTH`).
- **GAP-03**: No direct way to refresh the form state automatically after an `apply` operation.

---

## Gap-01: Apply data to newly duplicated list items in one pass

### Implementation Steps
1.  **Refactor `mcp/ps-reflection.py`**:
    -   In `_apply_list`, when adding a new item, call `duplicateLayer` with a unique name (e.g., `list_item_new_{timestamp}`).
    -   Wait for the duplication to complete, then call `get_layers()` to find the newly created layer by name.
    -   Extract the child IDs from the returned layer structure for the newly created item.
    -   Update the IDs in the `item_metadata` for this new item.
    -   Proceed with the standard child updates using these new IDs.
2.  **Optimize tool calls**:
    -   Bundle the `duplicateLayer` and `get_layers` calls if possible, or handle them sequentially with high reliability.
    -   Ensure the unique name is deleted or renamed to the standard format after update.

### Verification Strategy
- **API Verification**: Use a mock `apply` payload containing a new list item and verify that `ps-reflection.py` produces subsequent `editTextLayer` calls with IDs not present in the original schema.
- **Photoshop Verification**: Perform an "Add Item" action in the UI and confirm the new item appears in PSD with the correct text values.

---

## Gap-02: Add validation error codes

### Implementation Steps
1.  **Standardize Error Codes**:
    -   Update `adb-proxy-socket/lib/resilience.js` to include `INVALID_TEXT_LENGTH`, `REQUIRED_FIELD_MISSING`, and `INVALID_DATA_TYPE` in `ErrorTypes`.
2.  **Implement Validation Service**:
    -   Create `adb-proxy-socket/lib/validation.js` to define validation rules (e.g., max length for `title`).
    -   Add a `validateFormData(schema, data)` function to perform validation against the generated schema.
3.  **Integrate into API**:
    -   In `adb-proxy-socket/api/components.js`, call the validation service before `applyToPSD`.
    -   If validation fails, return a `400 Bad Request` with a JSON payload containing an array of errors with their codes.
4.  **UI Feedback**:
    -   Update `adb-proxy-socket/public/js/form-generator.js` to display error messages/codes next to the respective fields upon a 400 response.

### Verification Strategy
- **Unit Test**: Create a test script that submits invalid data (e.g., 500+ character title) and asserts the presence of `INVALID_TEXT_LENGTH` in the response.
- **UI Verification**: Manually trigger a validation error in the UI and verify that the error code is displayed.

---

## Gap-03: Automatic UI re-parse/refresh after apply

### Implementation Steps
1.  **Enhance Apply Endpoint**:
    -   In `adb-proxy-socket/api/components.js`, after a successful `applyToPSD`, call the `parse` logic internally to get the new PSD state.
    -   Update the `componentsStore` with the new state.
    -   Return the new component state (schema and values) in the `apply` response.
2.  **Update Frontend Lifecycle**:
    -   Modify `adb-proxy-socket/public/js/form-generator.js` to handle the response from `/api/components/{id}/apply`.
    -   On success, call `loadSchema(id)` again to re-render the form with the new IDs and values.
    -   Implement a simple "Saved" toast notification.

### Verification Strategy
- **End-to-End Test**: Submit an update, wait for completion, and verify that the form fields now reflect the current PSD state (especially important for new list items whose internal layer IDs have changed).
- **API Verification**: Verify that the `apply` response contains the same structure as the `parse` response.

---

## Timeline & Milestones
- **Step 1**: GAP-01 Fix (Reflection logic) - Day 1
- **Step 2**: GAP-02 Fix (Validation) - Day 1
- **Step 3**: GAP-03 Fix (UI Refresh) - Day 2
- **Step 4**: Final UAT - Day 2
