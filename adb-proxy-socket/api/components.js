const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const { withRetry, ErrorTypes } = require('../lib/resilience');
const { validateFormData } = require('../lib/validation');

const router = express.Router();

// In-memory store for analyzed components
const componentsStore = new Map();

/**
 * POST /api/components/parse
 * Analyzes a PSD and returns identified components
 */
router.post('/parse', async (req, res) => {
    const { psdPath } = req.body;

    if (!psdPath) {
        return res.status(400).json({ error: 'psdPath is required' });
    }

    try {
        const result = await parsePSD();
        const componentId = Date.now().toString();
        componentsStore.set(componentId, {
            id: componentId,
            psdPath,
            layers: result,
            analyzedAt: new Date()
        });
        
        res.json({ componentId, layers: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/components/{id}/form-schema
 * Maps identified layers to FormField objects
 */
router.get('/:id/form-schema', (req, res) => {
    const { id } = req.params;
    const component = componentsStore.get(id);

    if (!component) {
        return res.status(404).json({ error: 'Component not found' });
    }

    const fields = mapLayersToFields(component.layers);
    res.json({ fields });
});

/**
 * POST /api/components/{id}/apply
 * Applies form changes to Photoshop via MCP
 */
router.post('/:id/apply', async (req, res) => {
    const { id } = req.params;
    const { formData } = req.body;
    const component = componentsStore.get(id);

    if (!component) {
        return res.status(404).json({ error: 'Component not found' });
    }

    // GAP-02: Validation
    const validationErrors = validateFormData(component.layers, formData);
    if (validationErrors.length > 0) {
        return res.status(400).json({ 
            error: 'Validation failed', 
            details: validationErrors,
            code: ErrorTypes.INVALID_DATA_TYPE
        });
    }

    try {
        const result = await withRetry(async () => {
            return await applyToPSD(component.layers, formData);
        });

        // GAP-03: Re-parse after successful apply
        const newLayers = await parsePSD();
        component.layers = newLayers;
        component.analyzedAt = new Date();
        componentsStore.set(id, component);

        res.json({
            status: 'success',
            reflectionResult: result,
            newLayers: newLayers
        });
    } catch (error) {
        console.error('Apply error:', error);
        res.status(500).json({ 
            error: 'Failed to apply changes', 
            details: error.message,
            code: ErrorTypes.APPLY_PARTIAL_FAILED 
        });
    }
});

async function parsePSD() {
    const analysisScript = path.join(__dirname, '../../mcp/ps-analysis.py');
    
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', [analysisScript]);
        
        let output = '';
        let errorOutput = '';
        
        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(errorOutput || `Analysis script failed with code ${code}`));
            }
            
            try {
                const result = JSON.parse(output);
                if (result.status === 'error') {
                    reject(new Error(result.message));
                } else {
                    resolve(result);
                }
            } catch (e) {
                reject(new Error(`Failed to parse analysis result: ${output}`));
            }
        });
    });
}

/**
 * POST /api/components/{id}/preview-apply
 * Similar to apply but intended for ephemeral preview
 */
router.post('/:id/preview-apply', async (req, res) => {
    const { id } = req.params;
    const { formData } = req.body;
    const component = componentsStore.get(id);

    if (!component) {
        return res.status(404).json({ error: 'Component not found' });
    }

    try {
        // For MVP, preview-apply performs the same tool calls as apply
        const result = await withRetry(async () => {
            return await applyToPSD(component.layers, formData);
        });
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to preview changes', details: error.message });
    }
});

/**
 * POST /api/components/{id}/diff
 * Returns a diff between current form state and last PSD state
 */
router.post('/:id/diff', (req, res) => {
    const { id } = req.params;
    const { formData } = req.body;
    const component = componentsStore.get(id);

    if (!component) {
        return res.status(404).json({ error: 'Component not found' });
    }

    const diff = calculateDiff(component.layers, formData);
    res.json({ diff });
});

async function applyToPSD(layers, formData) {
    const reflectionScript = path.join(__dirname, '../../mcp/ps-reflection.py');
    const payload = JSON.stringify({ components: layers, formData });
    
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', [reflectionScript, payload]);
        
        let output = '';
        let errorOutput = '';
        
        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(errorOutput || `Reflection script failed with code ${code}`));
            }
            
            try {
                const result = JSON.parse(output);
                if (result.status === 'error') {
                    reject(new Error(result.message));
                } else {
                    resolve(result);
                }
            } catch (e) {
                reject(new Error(`Failed to parse reflection result: ${output}`));
            }
        });
    });
}

function calculateDiff(layers, formData) {
    const diff = {};
    for (const key in formData) {
        const newValue = formData[key];
        const layer = layers[key];
        
        if (!layer) {
            diff[key] = { type: 'added', newValue };
            continue;
        }

        const oldValue = layer.original_value;
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
            diff[key] = { type: 'modified', oldValue, newValue };
        }
    }
    return diff;
}

function mapLayersToFields(layers) {
    const fields = [];
    
    for (const key in layers) {
        const layer = layers[key];
        const field = {
            id: layer.id,
            label: layer.name,
            type: layer.type.toLowerCase(),
            defaultValue: layer.original_value || null,
            validation: {
                required: true
            }
        };

        if (layer.type === 'LIST') {
            field.type = 'list';
            field.itemSchema = mapLayersToFields(layer.template);
        } else if (layer.type === 'IMAGE') {
            field.type = 'image';
        } else if (layer.type === 'TEXT') {
            field.type = 'text';
            if (layer.text_properties && layer.text_properties.fontSize) {
                 // Add some metadata or specific validation
            }
        }

        fields.push(field);
    }
    
    return fields;
}

module.exports = router;
