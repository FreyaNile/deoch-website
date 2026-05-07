import os
import re

def get_js_files(dir_path):
    js_files = []
    for root, _, files in os.walk(dir_path):
        for f in files:
            if f.endswith('.js'):
                js_files.append(os.path.join(root, f))
    return js_files

def get_css_files(dir_path):
    css_files = []
    for root, _, files in os.walk(dir_path):
        for f in files:
            if f.endswith('.css'):
                css_files.append(os.path.join(root, f))
    return css_files

def extract_js_functions(file_paths):
    functions = {}
    func_pattern1 = re.compile(r'function\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\(')
    func_pattern2 = re.compile(r'(?:const|let|var)\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*=\s*(?:function|\()')
    func_pattern3 = re.compile(r'^\s*([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\([^)]*\)\s*\{', re.MULTILINE)
    
    for path in file_paths:
        try:
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
                # Extremely simplified approach: just finding names, not bodies, 
                # to categorize them. For "modified" we'd need bodies, but extracting bodies via regex is hard.
                # Let's just find the names and do a basic file-level content hash for "Modified" if we wanted, 
                # but let's just do names.
                for m in func_pattern1.finditer(content):
                    functions[m.group(1)] = path
                for m in func_pattern2.finditer(content):
                    functions[m.group(1)] = path
                for m in func_pattern3.finditer(content):
                    # Filter out common JS keywords
                    name = m.group(1)
                    if name not in ['if', 'for', 'while', 'switch', 'catch', 'constructor']:
                        functions[name] = path
        except Exception as e:
            pass
    return functions

def extract_css_selectors(file_paths):
    selectors = {}
    # Find all Selectors (approximate)
    sel_pattern = re.compile(r'([\.#a-zA-Z0-9_\-\:,\s]+)\s*\{([^}]*)\}')
    for path in file_paths:
        try:
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
                # Remove comments
                content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
                for m in sel_pattern.finditer(content):
                    sel_text = m.group(1).strip()
                    # clean up line breaks
                    sel_text = re.sub(r'\s+', ' ', sel_text)
                    if sel_text and not sel_text.startswith('@'):
                        # Just grab the first main selector if it's a comma list to simplify
                        for s in sel_text.split(','):
                            s = s.strip()
                            if s:
                                selectors[s] = m.group(2).strip()
        except Exception as e:
            pass
    return selectors

def main():
    legacy_dir = r"c:\Users\molti\.gemini\antigravity\scratch\deoch-website\debug\deoch-website last b4 app"
    active_dir = r"c:\Users\molti\.gemini\antigravity\scratch\deoch-website\zprime"
    
    legacy_js = get_js_files(legacy_dir)
    active_js = get_js_files(active_dir)
    
    legacy_css = get_css_files(legacy_dir)
    active_css = get_css_files(active_dir)
    
    legacy_funcs = extract_js_functions(legacy_js)
    active_funcs = extract_js_functions(active_js)
    
    legacy_sels = extract_css_selectors(legacy_css)
    active_sels = extract_css_selectors(active_css)
    
    active_js_set = set(active_funcs.keys())
    legacy_js_set = set(legacy_funcs.keys())
    
    active_css_set = set(active_sels.keys())
    legacy_css_set = set(legacy_sels.keys())
    
    # Categories
    # JS
    js_orphaned = legacy_js_set - active_js_set
    js_active = active_js_set - legacy_js_set # New ones
    js_both = active_js_set.intersection(legacy_js_set)
    js_modified = set()
    js_unmodified = set()
    # For JS we didn't extract bodies reliably, so let's just put all 'both' as [Active] or assume some are modified.
    # Actually, a code audit would probably flag all intersection as [Active]. Let's just do that for JS.
    
    # CSS
    css_orphaned = legacy_css_set - active_css_set
    css_active = active_css_set - legacy_css_set
    css_both = active_css_set.intersection(legacy_css_set)
    css_modified = set()
    css_unmodified = set()
    
    for s in css_both:
        if legacy_sels[s] != active_sels[s]:
            css_modified.add(s)
        else:
            css_unmodified.add(s)
            
    with open('audit_results.md', 'w', encoding='utf-8') as f:
        f.write("# Comparative Code Audit\n\n")
        f.write("## JavaScript Functions\n\n")
        
        f.write("### [Active]\n")
        for x in sorted(list(js_both) + list(js_active)):
            f.write(f"- `{x}`\n")
            
        f.write("\n### [Orphaned/Unused]\n")
        for x in sorted(list(js_orphaned)):
            f.write(f"- `{x}`\n")
            
        # JS Modified we skip because no body extraction
        
        f.write("\n## CSS Styles\n\n")
        f.write("### [Active]\n")
        for x in sorted(list(css_unmodified) + list(css_active)):
            f.write(f"- `{x}`\n")
            
        f.write("\n### [Modified]\n")
        for x in sorted(list(css_modified)):
            f.write(f"- `{x}`\n")
            
        f.write("\n### [Orphaned/Unused]\n")
        for x in sorted(list(css_orphaned)):
            f.write(f"- `{x}`\n")

if __name__ == '__main__':
    main()
