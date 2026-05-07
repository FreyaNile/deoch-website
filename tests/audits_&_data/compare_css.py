import os
import re

def get_css_files(directory):
    css_files = []
    for root, _, files in os.walk(directory):
        for f in files:
            if f.endswith('.css'):
                css_files.append(os.path.join(root, f))
    return css_files

def extract_selectors(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return set()
        
    # Remove comments
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    
    selectors = set()
    # Find all blocks: everything up to '{'
    # We iterate over characters to handle nested braces (like @media) properly if needed,
    # but a simple split by '{' and '}' might be enough for selector extraction.
    
    # A robust approach to just get selectors:
    # Remove media query wrappers (just the @media... { and its closing }) - actually this is hard with regex.
    # Let's use a simple state machine.
    
    i = 0
    buffer = ""
    brace_level = 0
    in_media = False
    
    while i < len(content):
        c = content[i]
        if c == '{':
            sel = buffer.strip()
            if sel.startswith('@'):
                in_media = True
            elif sel:
                # Split by comma to get individual selectors
                parts = sel.split(',')
                for p in parts:
                    clean_p = re.sub(r'\s+', ' ', p.strip())
                    if clean_p:
                        selectors.add(clean_p)
            buffer = ""
            brace_level += 1
        elif c == '}':
            brace_level -= 1
            if brace_level == 0:
                in_media = False
            buffer = ""
        else:
            if brace_level == 0 or (in_media and brace_level == 1):
                buffer += c
        i += 1
        
    return selectors

def get_all_selectors(directory):
    files = get_css_files(directory)
    all_selectors = set()
    for f in files:
        all_selectors.update(extract_selectors(f))
    return all_selectors

backup_dir = r".tmp\zprime25\css"
current_dir = r"zprime\css"

if not os.path.exists(backup_dir):
    print(f"Backup directory not found: {backup_dir}")
    exit(1)

backup_selectors = get_all_selectors(backup_dir)
current_selectors = get_all_selectors(current_dir)

missing_in_current = backup_selectors - current_selectors

print(f"Total backup selectors: {len(backup_selectors)}")
print(f"Total current selectors: {len(current_selectors)}")
print(f"Missing selectors in current CSS: {len(missing_in_current)}")

with open("debug/css_comparison_results.md", "w", encoding="utf-8") as f:
    f.write("# CSS Comparison Results\n\n")
    f.write(f"- Total backup selectors: {len(backup_selectors)}\n")
    f.write(f"- Total current selectors: {len(current_selectors)}\n")
    f.write(f"- Missing selectors in current: {len(missing_in_current)}\n\n")
    
    if missing_in_current:
        f.write("## Missing Selectors\n")
        for sel in sorted(missing_in_current):
            f.write(f"- `{sel}`\n")
        
print("Results written to debug/css_comparison_results.md")
