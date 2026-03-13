/**
 * adb-proxy-socket/lib/validation.js
 * Validation logic for form data against component schemas.
 */

const { ErrorTypes } = require('./resilience');

/**
 * Validates form data against a list of component definitions.
 * @param {Object} components - The analyzed components dictionary.
 * @param {Object} formData - The data to validate.
 * @returns {Array} List of validation errors.
 */
function validateFormData(components, formData) {
    const errors = [];

    for (const compId in components) {
        const comp = components[compId];
        const value = formData[compId];

        // Check required fields (assuming all top-level identified fields are required for now)
        if (value === undefined || value === null || value === '') {
            errors.push({
                id: compId,
                code: ErrorTypes.REQUIRED_FIELD_MISSING,
                message: `Field "${comp.name}" is required.`
            });
            continue;
        }

        if (comp.type === 'TEXT') {
            if (typeof value !== 'string') {
                errors.push({
                    id: compId,
                    code: ErrorTypes.INVALID_DATA_TYPE,
                    message: `Field "${comp.name}" must be a string.`
                });
            } else if (value.length > 500) { // arbitrary limit for MVP
                errors.push({
                    id: compId,
                    code: ErrorTypes.INVALID_TEXT_LENGTH,
                    message: `Field "${comp.name}" is too long (max 500 chars).`
                });
            }
        } else if (comp.type === 'LIST') {
            if (!Array.isArray(value)) {
                errors.push({
                    id: compId,
                    code: ErrorTypes.INVALID_DATA_TYPE,
                    message: `Field "${comp.name}" must be an array.`
                });
            } else {
                // Validate each item in the list
                value.forEach((item, index) => {
                    for (const subKey in comp.template) {
                        const subComp = comp.template[subKey];
                        const subValue = item[subKey];
                        
                        if (subValue === undefined || subValue === null || subValue === '') {
                            errors.push({
                                id: `${compId}[${index}].${subKey}`,
                                code: ErrorTypes.REQUIRED_FIELD_MISSING,
                                message: `Item ${index + 1} field "${subComp.name}" is required.`
                            });
                        }
                        // Add more sub-field validation if needed
                    }
                });
            }
        }
    }

    return errors;
}

module.exports = {
    validateFormData
};
