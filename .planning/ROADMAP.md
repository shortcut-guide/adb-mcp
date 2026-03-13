# ROADMAP: PSD Component Management System MVP

## Milestone 1: Core Functionality (MVP)

### Phase 1: Analysis & API Design
- [ ] Task 1.1: Design and implement PSD Analysis logic (group/layer detection).
- [ ] Task 1.2: Define data models and OpenAPI 3.1 specification.
- [ ] Task 1.3: Implement `POST /api/components/parse` and `GET /api/components/{id}/form-schema`.
- [ ] Task 1.4: Define `list_XXX` variable structure support (pseudo-code and initial implementation).

### Phase 2: Form Generation & UI
- [ ] Task 2.1: Develop dynamic form generation based on `form-schema`.
- [ ] Task 2.2: Implement text input and image upload UI components.
- [ ] Task 2.3: Integrate with management UI for form display and editing.

### Phase 3: MCP Reflection & Resilience
- [ ] Task 3.1: Implement Photoshop MCP integration for applying changes.
- [ ] Task 3.2: Develop `POST /api/components/{id}/apply` and preview/diff endpoints.
- [ ] Task 3.3: Add error handling (detailed feedback) and retry strategy (exponential backoff).
- [ ] Task 3.4: Finalize non-engineer guide and documentation.

## Future Milestones
- [ ] Milestone 2: Advanced Templating and Bulk Operations.
- [ ] Milestone 3: Multi-language Support and Automated Quality Checks.
