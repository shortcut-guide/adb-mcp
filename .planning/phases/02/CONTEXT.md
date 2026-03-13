# CONTEXT: Phase 2 - Form Generation & UI

## Goal
Develop a dynamic form generation system that transforms PSD-derived schemas into an interactive management UI.

## Scope
- **Task 2.1**: Implement dynamic form generation logic based on the `form-schema` (JSON Schema) produced in Phase 1.
- **Task 2.2**: Develop UI components for Text Input and Image Upload (placeholder for actual file handling).
- **Task 2.3**: Integrate the form into a management dashboard for viewing and editing component values.

## Key Requirements (from REQUIREMENTS.md)
- Text Layer → Text Input.
- Image Layer → Image Upload/Replacement UI.
- Support for `list_XXX` variable structures (array-based forms).
- Clean, non-engineer-friendly UI.

## Technical Constraints
- The UI should be compatible with the `adb-proxy-socket` API.
- Prefer a lightweight frontend approach (Vanilla JS or a simple React/Vue setup if already present, otherwise keep it simple within the proxy server's static files).
- Must handle the specific target groups: `title`, `date`, `main_logo`, `list_XXX`, etc.
