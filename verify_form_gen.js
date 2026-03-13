const fs = require('fs');

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
        }

        fields.push(field);
    }
    
    return fields;
}

const analysisResult = JSON.parse(fs.readFileSync('analysis_result.json', 'utf8'));
const fields = mapLayersToFields(analysisResult);

console.log('Form Fields Generated:', fields.length);

// Basic Assertions
const titleField = fields.find(f => f.label === 'title');
console.assert(titleField !== undefined, 'Title field not found');
console.assert(titleField.type === 'text', 'Title field should be text');

const listField = fields.find(f => f.label === 'list_products');
console.assert(listField !== undefined, 'List field not found');
console.assert(listField.type === 'list', 'List field should be list');
console.assert(listField.itemSchema.length === 2, 'Item schema should have 2 fields (title, img_main)');

const bgField = fields.find(f => f.label === 'bg');
console.assert(bgField !== undefined, 'BG field not found');
console.assert(bgField.type === 'image', 'BG field should be image');

console.log('Test Case 2 (Form Generation): PASS');
fs.writeFileSync('form_schema.json', JSON.stringify(fields, null, 2));
