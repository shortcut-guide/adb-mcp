import json
import sys
import os

# Add mcp directory to path
sys.path.append(os.path.join(os.getcwd(), 'mcp'))

from ps_analysis import PSDAnalyzer

def test_analysis():
    mock_layers = [
        {
            "name": "header",
            "type": "GROUP",
            "id": 1,
            "layers": [
                {"name": "title", "type": "TEXT", "id": 2, "textInfo": {"text": "Campaign Title"}},
                {"name": "date", "type": "TEXT", "id": 3, "textInfo": {"text": "2026-03-15"}}
            ]
        },
        {"name": "main_logo", "type": "SMART_OBJECT", "id": 4},
        {
            "name": "list_products",
            "type": "GROUP",
            "id": 5,
            "layers": [
                {
                    "name": "item_1",
                    "type": "GROUP",
                    "id": 6,
                    "layers": [
                        {"name": "title", "type": "TEXT", "id": 7, "textInfo": {"text": "Product 1"}},
                        {"name": "img_main", "type": "PIXEL", "id": 8}
                    ]
                },
                {
                    "name": "item_2",
                    "type": "GROUP",
                    "id": 9,
                    "layers": [
                        {"name": "title", "type": "TEXT", "id": 10, "textInfo": {"text": "Product 2"}},
                        {"name": "img_main", "type": "PIXEL", "id": 11}
                    ]
                }
            ]
        },
        {"name": "bg", "type": "PIXEL", "id": 12}
    ]
    
    analyzer = PSDAnalyzer()
    result = analyzer.analyze(mock_layers)
    
    print("Analysis Result Keys:", list(result.keys()))
    
    # Assertions
    assert "title" in result
    assert result["title"]["type"] == "TEXT"
    assert result["title"]["original_value"] == "Campaign Title"
    
    assert "date" in result
    assert result["date"]["type"] == "TEXT"
    
    assert "main_logo" in result
    assert result["main_logo"]["type"] == "IMAGE"
    
    assert "list_products" in result
    assert result["list_products"]["type"] == "LIST"
    assert len(result["list_products"]["items"]) == 2
    assert "title" in result["list_products"]["template"]
    assert "img_main" in result["list_products"]["template"]
    
    assert "bg" in result
    assert result["bg"]["type"] == "IMAGE"
    
    print("Test Case 1 (PSD Analysis): PASS")
    return result

if __name__ == "__main__":
    try:
        res = test_analysis()
        with open('analysis_result.json', 'w') as f:
            json.dump(res, f, indent=2)
    except Exception as e:
        print(f"Test Case 1 (PSD Analysis): FAIL - {str(e)}")
        sys.exit(1)
