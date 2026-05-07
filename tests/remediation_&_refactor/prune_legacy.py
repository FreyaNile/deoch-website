import os
import re

def get_css_classes(file_paths):
    classes = set()
    ids = set()
    pattern = re.compile(r'([\.#a-zA-Z0-9_\-\:]+)\s*\{([^}]*)\}')
    for path in file_paths:
        try:
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
                content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
                for m in pattern.finditer(content):
                    sel_text = m.group(1).strip()
                    for s in sel_text.split(','):
                        s = s.strip()
                        # Extract basic classes and IDs
                        for class_match in re.findall(r'\.([a-zA-Z0-9_\-]+)', s):
                            classes.add(class_match)
                        for id_match in re.findall(r'#([a-zA-Z0-9_\-]+)', s):
                            ids.add(id_match)
        except Exception as e:
            pass
    return classes, ids

def main():
    legacy_dir = r"c:\Users\molti\.gemini\antigravity\scratch\deoch-website\debug\deoch-website last b4 app"
    active_dir = r"c:\Users\molti\.gemini\antigravity\scratch\deoch-website\zprime\css"
    
    legacy_css_files = [os.path.join(legacy_dir, f) for f in os.listdir(legacy_dir) if f.endswith('.css')]
    active_css_files = []
    for root, _, files in os.walk(active_dir):
        for f in files:
            if f.endswith('.css'):
                active_css_files.append(os.path.join(root, f))
                
    leg_classes, leg_ids = get_css_classes(legacy_css_files)
    act_classes, act_ids = get_css_classes(active_css_files)
    
    orphaned_classes = leg_classes - act_classes
    orphaned_ids = leg_ids - act_ids
    
    # Process zprime/index.html
    html_path = r"c:\Users\molti\.gemini\antigravity\scratch\deoch-website\zprime\index.html"
    with open(html_path, 'r', encoding='utf-8') as f:
        html = f.read()
        
    def clean_classes(match):
        class_str = match.group(1)
        classes = class_str.split()
        new_classes = [c for c in classes if c not in orphaned_classes]
        if not new_classes:
            return '' # Remove class attribute entirely if empty
        return f'class="{" ".join(new_classes)}"'
        
    # Replace class attributes
    html = re.sub(r'class="([^"]*)"', clean_classes, html)
    
    # Check IDs (just print them out for safety, removing IDs can break JS easily)
    def check_ids(match):
        id_str = match.group(1)
        if id_str in orphaned_ids:
            return '' # Remove ID if orphaned
        return match.group(0)
    
    html = re.sub(r'id="([^"]*)"', check_ids, html)
    
    # Clean up empty class="" just in case
    html = re.sub(r'\s+class=""', '', html)
    
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html)
        
    print(f"Pruned {len(orphaned_classes)} orphaned classes and {len(orphaned_ids)} orphaned IDs from HTML.")

if __name__ == '__main__':
    main()
