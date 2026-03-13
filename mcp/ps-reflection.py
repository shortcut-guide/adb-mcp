import json
import os
import sys
import tempfile
import base64
import time
import socket_client
from core import init, sendCommand, createCommand

# Ensure we can import ps-analysis
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from ps_analysis import PSDAnalyzer

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

class PSDReflector:
    def __init__(self, analyzed_components):
        self.components = analyzed_components
        self.temp_files = []

    def __del__(self):
        # Cleanup temp files
        for f in self.temp_files:
            try:
                os.remove(f)
            except:
                pass

    def apply_updates(self, updates):
        """
        updates: dict of { component_id: new_value }
        """
        results = []
        for comp_id, new_value in updates.items():
            if comp_id not in self.components:
                results.append({"id": comp_id, "status": "error", "message": "Component not found"})
                continue
            
            comp = self.components[comp_id]
            ctype = comp.get('type')
            
            try:
                if ctype == 'TEXT':
                    res = self._apply_text(comp, new_value)
                    results.append({"id": comp_id, "status": "success", "response": res})
                elif ctype == 'IMAGE':
                    res = self._apply_image(comp, new_value)
                    results.append({"id": comp_id, "status": "success", "response": res})
                elif ctype == 'LIST':
                    res = self._apply_list(comp, new_value)
                    results.append({"id": comp_id, "status": "success", "response": res})
            except Exception as e:
                results.append({"id": comp_id, "status": "error", "message": str(e)})
        
        return results

    def _apply_text(self, comp, value):
        layer_id = comp.get('layer_id')
        if layer_id is None:
            raise ValueError(f"Layer ID missing for component {comp.get('id')}")
            
        command = createCommand("editTextLayer", {
            "layerId": layer_id,
            "contents": str(value) # Fixed from 'text' to 'contents' based on ps-mcp.py
        })
        return sendCommand(command)

    def _apply_image(self, comp, value):
        layer_id = comp.get('layer_id')
        if layer_id is None:
            raise ValueError(f"Layer ID missing for component {comp.get('id')}")

        image_path = value
        
        # Handle base64 if needed
        if isinstance(value, str) and value.startswith('data:image'):
            try:
                header, encoded = value.split(',', 1)
                ext = header.split('/')[1].split(';')[0]
                data = base64.b64decode(encoded)
                
                with tempfile.NamedTemporaryFile(delete=False, suffix=f".{ext}") as tmp:
                    tmp.write(data)
                    image_path = tmp.name
                    self.temp_files.append(image_path)
            except Exception as e:
                raise ValueError(f"Failed to process base64 image: {str(e)}")

        command = createCommand("placeImage", {
            "layerId": layer_id,
            "imagePath": image_path
        })
        return sendCommand(command)

    def _apply_list(self, comp, new_items):
        """
        comp: list component metadata
        new_items: list of dicts with updated values for each item
        """
        old_items = comp.get('items', [])
        comp_id = comp.get('id')
        
        # 1. Handle Deletions: If new_items is shorter than old_items
        if len(new_items) < len(old_items):
            for i in range(len(new_items), len(old_items)):
                item_to_delete = old_items[i]
                layer_id = item_to_delete.get('__layer_id__')
                if layer_id:
                    sendCommand(createCommand("deleteLayer", {"layerId": layer_id}))

        # 2. Handle Modifications and Additions
        for i, new_item_data in enumerate(new_items):
            if i < len(old_items):
                # Modification
                old_item = old_items[i]
                self._update_item_children(old_item, new_item_data)
            else:
                # 3. Handle Additions: Duplicate template and update immediately
                if old_items:
                    template_layer_id = old_items[0].get('__layer_id__')
                    unique_name = f"tmp_item_{int(time.time()*1000)}_{i}"
                    
                    # Duplicate
                    dup_res = sendCommand(createCommand("duplicateLayer", {
                        "layerToDuplicateId": template_layer_id, # Fixed from 'sourceLayerId' to 'layerToDuplicateId'
                        "duplicateLayerName": unique_name
                    }))
                    
                    if dup_res.get('status') != 'SUCCESS':
                        continue

                    # Fetch current state to find new layer IDs
                    layers_resp = sendCommand(createCommand("getLayers", {}))
                    if layers_resp.get('status') == 'SUCCESS':
                        analyzer = PSDAnalyzer()
                        all_new_components = analyzer.analyze(layers_resp.get('response', []))
                        
                        # Find the list component in the new analysis
                        if comp_id in all_new_components:
                            new_list_comp = all_new_components[comp_id]
                            # The new item should be the last one if it was duplicated above the others
                            # or we can find it by its unique_name if we recorded it.
                            # PSDAnalyzer recorded __layer_id__ for each item.
                            
                            # Let's find the item that corresponds to our unique_name
                            new_item_metadata = None
                            for item in new_list_comp.get('items', []):
                                # We need to check if the group itself has this name.
                                # PSDAnalyzer doesn't store the group name in item_data currently, only child components.
                                # But we can verify by fetching the layer info if needed, or assume it's the last one added.
                                # Better: Modify PSDAnalyzer to store the item group name.
                                pass
                            
                            # For now, let's assume it's the i-th item in the new list
                            if i < len(new_list_comp.get('items', [])):
                                new_item_metadata = new_list_comp['items'][i]
                                self._update_item_children(new_item_metadata, new_item_data)
                                
                                # Rename to standard format
                                standard_name = f"{comp.get('name')}_item_{i+1}"
                                sendCommand(createCommand("renameLayers", {
                                    "layerData": [{"layer_id": new_item_metadata['__layer_id__'], "new_layer_name": standard_name}]
                                }))

    def _update_item_children(self, item_metadata, new_values):
        for key, val in new_values.items():
            if key == '__layer_id__': continue
            if key in item_metadata:
                child_comp = item_metadata[key]
                if child_comp['type'] == 'TEXT':
                    self._apply_text(child_comp, val)
                elif child_comp['type'] == 'IMAGE':
                    self._apply_image(child_comp, val)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"status": "error", "message": "No payload provided"}))
        sys.exit(1)
    
    try:
        payload = json.loads(sys.argv[1])
        analyzed_components = payload.get('components', {})
        form_data = payload.get('formData', {})
        
        reflector = PSDReflector(analyzed_components)
        results = reflector.apply_updates(form_data)
        print(json.dumps({"status": "success", "results": results}))
    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e)}))
