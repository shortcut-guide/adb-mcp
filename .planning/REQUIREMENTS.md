# REQUIREMENTS: PSD Component Management System MVP

## Overview
Develop a system to analyze PSD design components, automatically generate management forms, and reflect edits back to the PSD via Photoshop MCP.

## Functional Requirements
- **PSD Analysis**: Analyze groups and layers (including nested hierarchies).
  - Identify layer types: Text, Image, Other.
  - Determine target groups: `title`, `date`, `main_logo`, `list_XXX`, `main_text`, `sub_text`, `center_text`, `img_台`, `img_main`, `bg`.
- **Form Generation**: Automatically generate forms based on layer types.
  - Text Layer → Text Input Field.
  - Image Layer → Image Upload/Replacement Field.
- **Reflection**: Apply edited form values back to the PSD via MCP Photoshop.
  - Support `list_XXX` variable structures.
- **Error Handling**: Detailed error reporting for fields, layers, and causes.

## Technical Requirements
- **Architecture**: Management UI, PSD Analysis service, and MCP reflection interface.
- **API Design (OpenAPI 3.1)**:
  - `POST /api/components/parse`
  - `GET /api/components/{id}/form-schema`
  - `POST /api/components/{id}/preview-apply`
  - `POST /api/components/{id}/apply`
  - `POST /api/components/{id}/diff`
- **Mapping Strategy**: Name-based mapping (use `groupPath + layerName` for collisions).
- **Validation**:
  - `LAYER_NOT_FOUND`
  - `LAYER_TYPE_MISMATCH`
  - `INVALID_TEXT_LENGTH`
  - `INVALID_IMAGE_FORMAT`
  - `MCP_TIMEOUT`
  - `APPLY_PARTIAL_FAILED`
- **Resilience**: Retry strategy with exponential backoff and partial re-application.

## Data Models
- **Component**: Metadata for the target PSD.
- **Group**: Logical grouping of layers.
- **Layer**: Individual layer properties (type, path, name).
- **FormField**: Schema for the generated UI.

## Acceptance Criteria
- [ ] PSD components correctly parsed into JSON schemas.
- [ ] Forms generated with correct field types.
- [ ] Edits successfully reflected in PSD via MCP.
- [ ] Variable `list_XXX` structures handled correctly.
- [ ] Error messages are clear and actionable.

## Future Extensions
- Multi-language replacement.
- Bulk generation.
- Template management.
