import json
import sys
import os
from unittest.mock import MagicMock

# Add mcp directory to path
sys.path.append(os.path.join(os.getcwd(), 'mcp'))

# Mock core and socket_client before importing PSDReflector
import core
import socket_client

# Mock sendCommand and createCommand
core.sendCommand = MagicMock(return_value={"status": "SUCCESS"})
core.createCommand = lambda action, options: {"action": action, "options": options}

from ps_reflection import PSDReflector

def test_reflection():
    with open('analysis_result.json', 'r') as f:
        analyzed_components = json.load(f)
    
    reflector = PSDReflector(analyzed_components)
    
    # Mock form data updates
    form_data = {
        "title": "New Campaign Title",
        "bg": "path/to/new_bg.png",
        "list_products": [
            {
                "title": "Modified Product 1",
                "img_main": "path/to/product1.png"
            }
        ]
    }
    
    results = reflector.apply_updates(form_data)
    
    # Assertions
    # 1. Check if editTextLayer was called for title
    title_call = next((c for c in core.sendCommand.call_args_list if c[0][0]['action'] == 'editTextLayer'), None)
    assert title_call is not None, "editTextLayer should be called for title"
    assert title_call[0][0]['options']['text'] == "New Campaign Title"
    
    # 2. Check if placeImage was called for bg
    bg_call = next((c for c in core.sendCommand.call_args_list if c[0][0]['action'] == 'placeImage'), None)
    assert bg_call is not None, "placeImage should be called for bg"
    assert bg_call[0][0]['options']['imagePath'] == "path/to/new_bg.png"
    
    # 3. Check if list items were handled
    # For list_products, we modified the first item.
    # It should call _update_item_children which calls _apply_text and _apply_image
    product_title_call = next((c for c in core.sendCommand.call_args_list if c[0][0]['action'] == 'editTextLayer' and c[0][0]['options']['text'] == "Modified Product 1"), None)
    assert product_title_call is not None, "editTextLayer should be called for product title"
    
    # Also check if it handled the deletion of the second item (since we only provided one item in form_data)
    delete_call = next((c for c in core.sendCommand.call_args_list if c[0][0]['action'] == 'deleteLayer'), None)
    assert delete_call is not None, "deleteLayer should be called for the second item in the list"

    print("Test Case 3 (MCP Reflection): PASS")
    return results

if __name__ == "__main__":
    try:
        test_reflection()
    except Exception as e:
        print(f"Test Case 3 (MCP Reflection): FAIL - {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
