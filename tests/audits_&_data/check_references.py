import os
import re

def main():
    orphaned_js = []
    orphaned_css = []
    
    # Read orphaned names from archives
    with open('.tmp/archive.js', 'r', encoding='utf-8') as f:
        for line in f:
            if line.startswith('// ') and not line.startswith('// Orphaned'):
                orphaned_js.append(line[3:].strip())
                
    with open('.tmp/archive.css', 'r', encoding='utf-8') as f:
        for line in f:
            if line.startswith('/* ') and not line.startswith('/* Orphaned'):
                # Extract selector from comment
                sel = line[3:-4].strip()
                orphaned_css.append(sel)
                
    # Search zprime directory
    zprime_dir = r"c:\Users\molti\.gemini\antigravity\scratch\deoch-website\zprime"
    
    js_refs = {name: [] for name in orphaned_js}
    css_refs = {sel: [] for sel in orphaned_css}
    
    for root, _, files in os.walk(zprime_dir):
        for file in files:
            file_path = os.path.join(root, file)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                    # Check JS
                    for name in orphaned_js:
                        if name in content:
                            js_refs[name].append(file_path)
                            
                    # Check CSS
                    for sel in orphaned_css:
                        # Strip pseudo-classes and specific characters for basic text search
                        base_sel = sel.replace('.', '').replace('#', '')
                        if base_sel and base_sel in content:
                            css_refs[sel].append(file_path)
            except:
                pass
                
    with open('reference_check_results.md', 'w', encoding='utf-8') as f:
        f.write("# Dynamic Reference Check Results\n\n")
        f.write("## Orphaned JS Functions\n")
        js_found = False
        for name, refs in js_refs.items():
            if refs:
                f.write(f"- `{name}` found in:\n")
                for r in set(refs):
                    f.write(f"  - {r}\n")
                js_found = True
        if not js_found:
            f.write("No dynamic references found for any orphaned JS functions.\n")
            
        f.write("\n## Orphaned CSS Selectors\n")
        css_found = False
        for sel, refs in css_refs.items():
            if refs:
                f.write(f"- `{sel}` potential substring found in:\n")
                for r in set(refs):
                    f.write(f"  - {r}\n")
                css_found = True
        if not css_found:
            f.write("No dynamic references found for any orphaned CSS selectors.\n")

if __name__ == '__main__':
    main()
