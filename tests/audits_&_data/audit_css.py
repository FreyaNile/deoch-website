import os
import re
from bs4 import BeautifulSoup

def get_used_selectors():
    used = set()
    
    # Parse HTML
    with open('zprime/index.html', 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')
        for tag in soup.find_all(True):
            if tag.has_attr('class'):
                for c in tag['class']: used.add(f".{c}")
            if tag.has_attr('id'):
                used.add(f"#{tag['id']}")
    
    # Scan JS for dynamic classes
    js_files = ['zprime/app.js']
    for root, dirs, files in os.walk('zprime/gamejs'):
        for file in files:
            js_files.append(os.path.join(root, file))
            
    for file in js_files:
        try:
            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()
                # Find strings that look like classes or IDs
                matches = re.findall(r"['\"]\.([\w-]+)['\"]|['\"]#([\w-]+)['\"]", content)
                for m in matches:
                    if m[0]: used.add(f".{m[0]}")
                    if m[1]: used.add(f"#{m[1]}")
        except:
            continue
    return used

def audit_css():
    used = get_used_selectors()
    with open('zprime/css/base.css', 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Extract CSS selectors: matches only valid class/ID selectors
    # Filters out hex colors (#abc) and numeric values (.5rem)
    css_selectors = []
    # Find CSS blocks to isolate selectors
    blocks = re.findall(r"([.#][\w-][\w-]*)\s*\{", content)
    for s in blocks:
        css_selectors.append(s)
    
    orphans = []
    for s in css_selectors:
        if s not in used:
            orphans.append(s)
            
    with open('debug/css_audit_report.txt', 'w', encoding='utf-8') as f:
        f.write('\n'.join(sorted(set(orphans))))

if __name__ == "__main__":
    audit_css()
