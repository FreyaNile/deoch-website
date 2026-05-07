import re
import os

def extract_ids(content):
    # Match getElementById('...') or getElementById("...")
    ids = re.findall(r"getElementById\(['\"]([^'\"]+)['\"]\)", content)
    # Match querySelector('#...')
    ids += re.findall(r"querySelector\(['\"]#([^'\" .>:]+)['\"]\)", content)
    # Match DeochUtils.setText('...')
    ids += re.findall(r"DeochUtils\.setText\(['\"]([^'\"]+)['\"]\)", content)
    return set(ids)

def main():
    workspace = os.getcwd()
    js_dir = os.path.join(workspace, "zprime", "gamejs")
    html_file = os.path.join(workspace, "zprime", "index.html")
    
    js_ids = set()
    for filename in os.listdir(js_dir):
        if filename.endswith(".js"):
            with open(os.path.join(js_dir, filename), "r", encoding="utf-8") as f:
                js_ids.update(extract_ids(f.read()))
    
    with open(html_file, "r", encoding="utf-8") as f:
        html_content = f.read()
        
    missing = []
    for id_to_check in js_ids:
        # Check for both id="..." and id='...'
        if f'id="{id_to_check}"' not in html_content and f"id='{id_to_check}'" not in html_content:
            missing.append(id_to_check)
            
    print(f"Total Unique IDs Checked: {len(js_ids)}")
    if missing:
        print("\nPossible Missing IDs in HTML (Checking for dynamic generation...):")
        # Filter out IDs that might be rendered dynamically (e.g. template strings with ${})
        true_missing = []
        for m in missing:
            if "${" not in m:
                true_missing.append(m)
        
        if true_missing:
            for tm in sorted(true_missing):
                print(f"- {tm}")
        else:
            print("No static IDs missing. Remaining candidates appear to be dynamic.")
    else:
        print("\nAll JS-referenced IDs confirmed in index.html.")

if __name__ == "__main__":
    main()
