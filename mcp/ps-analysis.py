import json
import re
import os
import sys

# Optional: Add socket client support if running as script or via core
try:
    import socket_client
    from core import init, sendCommand, createCommand
except ImportError:
    # Allow running without socket support (e.g. for testing)
    pass

class PSDAnalyzer:
    def __init__(self):
        # Target layer/group names from requirements
        self.target_names = {
            'title', 'date', 'main_logo', 'main_text', 'sub_text', 
            'center_text', 'img_台', 'img_main', 'bg'
        }
        self.list_prefix = 'list_'

    def analyze(self, layers):
        """
        Analyze the PSD layer tree and return a structured representation.
        """
        components = {}
        self._traverse(layers, "", components)
        return components

    def _get_layer_type(self, layer):
        kind = layer.get('type', 'UNKNOWN').upper()
        if kind == 'TEXT':
            return 'TEXT'
        # In Photoshop UXP, image layers might be PIXEL, SMART_OBJECT, etc.
        if kind in ['PIXEL', 'SMART_OBJECT', 'NORMAL']:
            return 'IMAGE'
        return 'OTHER'

    def _traverse(self, layers, path, components, is_list_item=False):
        for layer in layers:
            name = layer.get('name', '')
            layer_id = layer.get('id')
            layer_type = self._get_layer_type(layer)
            
            # Construct full path for unique identification
            current_path = f"{path}/{name}" if path else name
            
            # Determine if this is a target component
            is_target = name in self.target_names or name.startswith(self.list_prefix)
            
            if is_target:
                comp_id = name # Primary identifier is the name
                if comp_id in components and not is_list_item:
                    # Handle naming collision by using path
                    comp_id = current_path
                
                if name.startswith(self.list_prefix):
                    # Handle list structure
                    list_comp = {
                        'id': comp_id,
                        'name': name,
                        'type': 'LIST',
                        'path': current_path,
                        'layer_id': layer_id,
                        'items': []
                    }
                    
                    sub_layers = layer.get('layers', [])
                    if sub_layers:
                        # Extract schema from the first item
                        item_template_layers = sub_layers[0].get('layers', [])
                        if not item_template_layers and sub_layers[0].get('type') != 'GROUP':
                             item_template_layers = [sub_layers[0]]
                        
                        template_components = {}
                        self._traverse(sub_layers[0].get('layers', [sub_layers[0]]), "", template_components, is_list_item=True)
                        list_comp['template'] = template_components
                        
                        for i, sub_layer in enumerate(sub_layers):
                            item_data = {'__layer_id__': sub_layer.get('id')}
                            self._traverse(sub_layer.get('layers', [sub_layer]), "", item_data, is_list_item=True)
                            list_comp['items'].append(item_data)
                    
                    components[comp_id] = list_comp
                else:
                    comp_data = {
                        'id': comp_id,
                        'name': name,
                        'type': layer_type,
                        'path': current_path,
                        'layer_id': layer_id,
                        'original_value': layer.get('textInfo', {}).get('text') if layer_type == 'TEXT' else None
                    }
                    if 'textInfo' in layer:
                        comp_data['text_properties'] = layer['textInfo']
                    
                    components[comp_id] = comp_data
            
            # Continue traversal if it's a group and not already handled as a list
            if 'layers' in layer and not name.startswith(self.list_prefix):
                self._traverse(layer['layers'], current_path, components, is_list_item)

def fetch_and_analyze():
    # Configure socket client for Photoshop
    APPLICATION = "photoshop"
    PROXY_URL = os.environ.get('PROXY_URL', 'http://localhost:3001')
    PROXY_TIMEOUT = 20

    socket_client.configure(
        app=APPLICATION, 
        url=PROXY_URL,
        timeout=PROXY_TIMEOUT
    )

    init(APPLICATION, socket_client)
    
    layers_resp = sendCommand(createCommand("getLayers", {}))
    if layers_resp.get('status') == 'SUCCESS':
        layers = layers_resp.get('response', [])
        analyzer = PSDAnalyzer()
        return analyzer.analyze(layers)
    else:
        raise RuntimeError(f"Failed to fetch layers: {layers_resp.get('message')}")

if __name__ == "__main__":
    try:
        result = fetch_and_analyze()
        print(json.dumps(result, indent=2, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e)}))
