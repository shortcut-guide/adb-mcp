/**
 * FormGenerator - Handles dynamic form rendering and serialization for PSD components
 */
const FormGenerator = {
    /**
     * Renders a full form based on schema fields
     * @param {Array} fields - Array of field objects from the API
     * @returns {HTMLElement} - The container with rendered fields
     */
    render(fields) {
        const container = document.createElement('div');
        container.className = 'rendered-fields';

        fields.forEach(field => {
            container.appendChild(this.renderField(field));
        });

        return container;
    },

    /**
     * Renders an individual field
     * @param {Object} field - Field definition
     * @returns {HTMLElement}
     */
    renderField(field) {
        const wrapper = document.createElement('div');
        wrapper.className = `form-field ${field.type}-field`;
        wrapper.dataset.id = field.id;
        wrapper.dataset.type = field.type;

        const label = document.createElement('label');
        label.innerText = field.label;
        wrapper.appendChild(label);

        // Error message container
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-msg hidden';
        wrapper.appendChild(errorMsg);

        if (field.type === 'text') {
            const input = document.createElement('input');
            input.type = 'text';
            input.value = field.defaultValue || '';
            input.name = field.id;
            wrapper.appendChild(input);
        } else if (field.type === 'image') {
            const placeholder = document.createElement('div');
            placeholder.className = 'image-placeholder';
            placeholder.innerText = 'Image Layer: ' + field.id;
            wrapper.appendChild(placeholder);

            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => this.handleImagePreview(e, wrapper);
            wrapper.appendChild(input);

            const preview = document.createElement('div');
            preview.className = 'image-preview hidden';
            wrapper.appendChild(preview);
        } else if (field.type === 'list') {
            const listContainer = document.createElement('div');
            listContainer.className = 'list-items';
            wrapper.appendChild(listContainer);

            const addButton = document.createElement('button');
            addButton.type = 'button';
            addButton.className = 'btn-add-item';
            addButton.innerText = '+ Add Item';
            addButton.onclick = () => this.addListItem(listContainer, field.itemSchema);
            wrapper.appendChild(addButton);

            // Populate existing items if present
            if (field.defaultValue && Array.isArray(field.defaultValue)) {
                field.defaultValue.forEach(itemData => {
                    this.addListItem(listContainer, field.itemSchema, itemData);
                });
            }
        }

        return wrapper;
    },

    /**
     * Adds an item to a list (array) field
     */
    addListItem(container, itemSchema, data = null) {
        const itemWrapper = document.createElement('div');
        itemWrapper.className = 'list-item';

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'btn-remove-item';
        removeBtn.innerText = 'Remove';
        removeBtn.onclick = () => itemWrapper.remove();
        itemWrapper.appendChild(removeBtn);

        itemSchema.forEach(field => {
            const fieldWithData = { ...field };
            if (data && data[field.label]) {
                fieldWithData.defaultValue = data[field.label];
            }
            itemWrapper.appendChild(this.renderField(fieldWithData));
        });

        container.appendChild(itemWrapper);
    },

    /**
     * Clears all validation errors
     */
    clearErrors(container) {
        container.querySelectorAll('.error-msg').forEach(msg => {
            msg.innerText = '';
            msg.classList.add('hidden');
        });
        container.querySelectorAll('.form-field').forEach(field => {
            field.classList.remove('has-error');
        });
    },

    /**
     * Displays validation errors
     */
    displayErrors(container, errors) {
        errors.forEach(err => {
            const fieldId = err.id;
            // Handle list item error IDs like "list_news[0].title"
            const selector = `[data-id="${fieldId}"]`;
            let fieldWrapper = container.querySelector(selector);
            
            // If not found directly, it might be a list item child
            if (!fieldWrapper && fieldId.includes('[')) {
                // Simplified handling for list errors
                console.warn('List item error display not fully implemented for:', fieldId);
            }

            if (fieldWrapper) {
                const errorMsg = fieldWrapper.querySelector('.error-msg');
                if (errorMsg) {
                    errorMsg.innerText = err.message || err.code;
                    errorMsg.classList.remove('hidden');
                }
                fieldWrapper.classList.add('has-error');
            }
        });
    },

    /**
     * Handles image file selection and preview
     */
    handleImagePreview(event, wrapper) {
        const file = event.target.files[0];
        const previewDiv = wrapper.querySelector('.image-preview');
        
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewDiv.innerHTML = `<img src="${e.target.result}" style="max-width: 100%; height: auto;">`;
                previewDiv.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    },

    /**
     * Serializes the form DOM back into a JSON structure
     * @param {HTMLElement} container - The form fields container
     * @returns {Object}
     */
    serialize(container) {
        const data = {};
        const fields = container.querySelectorAll(':scope > .form-field');

        fields.forEach(fieldWrapper => {
            const id = fieldWrapper.dataset.id;
            const type = fieldWrapper.dataset.type;

            if (type === 'text') {
                const input = fieldWrapper.querySelector('input');
                data[id] = input.value;
            } else if (type === 'image') {
                const input = fieldWrapper.querySelector('input[type="file"]');
                // For now, we'll just send the filename or a placeholder
                // In Phase 3, we'll handle actual upload
                data[id] = input.files[0] ? input.files[0].name : null;
            } else if (type === 'list') {
                const items = fieldWrapper.querySelectorAll('.list-item');
                data[id] = Array.from(items).map(item => this.serialize(item));
            }
        });

        return data;
    }
};

/**
 * Main UI Logic
 */
document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const statusIndicator = document.getElementById('status-indicator');
    const psdPathInput = document.getElementById('psd-path');
    const btnParse = document.getElementById('btn-parse');
    const parseStatus = document.getElementById('parse-status');
    const formContainer = document.getElementById('form-container');
    const formFields = document.getElementById('form-fields');
    const dynamicForm = document.getElementById('dynamic-form');
    const componentNameHeader = document.getElementById('component-name');

    let currentComponentId = null;

    // Socket status
    socket.on('connect', () => {
        statusIndicator.innerText = 'Connected';
        statusIndicator.className = 'status-connected';
    });

    socket.on('disconnect', () => {
        statusIndicator.innerText = 'Disconnected';
        statusIndicator.className = 'status-disconnected';
    });

    // Parse PSD
    btnParse.onclick = async () => {
        const psdPath = psdPathInput.value.trim();
        if (!psdPath) {
            alert('Please enter a PSD path');
            return;
        }

        parseStatus.innerText = 'Analyzing PSD...';
        btnParse.disabled = true;

        try {
            const response = await fetch('/api/components/parse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ psdPath })
            });

            const result = await response.json();

            if (response.ok) {
                currentComponentId = result.componentId;
                parseStatus.innerText = 'Success! Fetching schema...';
                loadSchema(currentComponentId);
            } else {
                parseStatus.innerText = 'Error: ' + (result.error || 'Failed to parse');
                btnParse.disabled = false;
            }
        } catch (err) {
            parseStatus.innerText = 'Error: ' + err.message;
            btnParse.disabled = false;
        }
    };

    async function loadSchema(id) {
        try {
            const response = await fetch(`/api/components/${id}/form-schema`);
            const { fields } = await response.json();

            formFields.innerHTML = '';
            const renderedForm = FormGenerator.render(fields);
            formFields.appendChild(renderedForm);

            formContainer.classList.remove('hidden');
            parseStatus.innerText = 'Ready';
            btnParse.disabled = false;
            
            // Scroll to form
            formContainer.scrollIntoView({ behavior: 'smooth' });
        } catch (err) {
            parseStatus.innerText = 'Error loading schema: ' + err.message;
            btnParse.disabled = false;
        }
    }

    // Form submission
    dynamicForm.onsubmit = async (e) => {
        e.preventDefault();
        
        FormGenerator.clearErrors(formFields);
        const data = FormGenerator.serialize(formFields);
        
        parseStatus.innerText = 'Applying changes to Photoshop...';
        const submitBtn = dynamicForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;

        try {
            const response = await fetch(`/api/components/${currentComponentId}/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ formData: data })
            });

            const result = await response.json();

            if (response.ok) {
                parseStatus.innerText = 'Successfully applied and re-parsed!';
                // GAP-03: Re-load schema and UI to reflect new layer IDs and structure
                await loadSchema(currentComponentId);
                alert('Changes applied successfully!');
            } else if (response.status === 400 && result.details) {
                // GAP-02: Display validation errors
                parseStatus.innerText = 'Validation failed. Please check the form.';
                FormGenerator.displayErrors(formFields, result.details);
            } else {
                parseStatus.innerText = 'Error: ' + (result.error || 'Failed to apply');
            }
        } catch (err) {
            parseStatus.innerText = 'Error: ' + err.message;
        } finally {
            submitBtn.disabled = false;
        }
    };

    // Preview button
    document.getElementById('btn-preview').onclick = () => {
        const data = FormGenerator.serialize(formFields);
        console.log('Previewing changes:', data);
        
        socket.emit('command_packet', {
            application: 'photoshop',
            command: {
                type: 'preview_component_data',
                componentId: currentComponentId,
                data: data
            }
        });
        
        alert('Preview command sent to Photoshop!');
    };
});
