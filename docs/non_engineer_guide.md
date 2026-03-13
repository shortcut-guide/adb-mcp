# Photoshop Component Management: Designer's Guide

This guide explains how to prepare your Photoshop (PSD) files so they can be automatically managed by the system.

## 1. Naming Conventions

The system identifies components based on layer and group names. Please use the following exact names for target elements:

### Basic Components
- `title`: Main title text.
- `date`: Date or time information.
- `main_text`: Primary body text.
- `sub_text`: Supporting text.
- `center_text`: Text positioned in the center.
- `main_logo`: Primary logo image.
- `img_main`: Primary subject image.
- `img_台`: Background or platform image for subjects.
- `bg`: Background image or layer.

### Repeatable Lists (`list_XXX`)
To create a list of items (e.g., news items, product cards), group them and prefix the group name with `list_`.
- Example: `list_news`, `list_products`, `list_members`.

**Rules for Lists:**
- The first child inside a `list_XXX` group is used as the **template**.
- All items in the list should have the same structure (e.g., each item group contains a `title` and `img_main`).

## 2. Layer Types

- **Text Layers**: Use standard Photoshop Type layers. These will become text input fields in the management UI.
- **Image Layers**: Use Pixel layers or Smart Objects. These will become image upload fields.

## 3. Hierarchy and Grouping

- You can nest layers inside groups for organization. The system will traverse the hierarchy to find target names.
- If you have multiple elements with the same target name (e.g., two `title` layers), the system will use their folder path to distinguish them. Try to keep names unique within their context if possible.

## 4. Best Practices

1. **Clean Names**: Avoid default names like "Layer 1" or "Group 2 copy".
2. **Hidden Layers**: The system currently analyzes all layers, including hidden ones. If you don't want something managed, don't use a reserved name.
3. **Template First**: For `list_XXX` structures, ensure the first item is perfectly formatted, as new items added via the UI will be duplicates of this first item.
4. **Consistency**: Use the same naming across different PSDs to ensure the management UI remains consistent.

## 5. Troubleshooting

- **Field not appearing?** Check if the layer name matches one of the reserved names listed above.
- **Image not replacing?** Ensure the layer is a Pixel layer or Smart Object, not a Shape layer or Adjustment layer.
- **List items not updating?** Ensure the items are groups or layers directly inside a `list_` prefixed group.
