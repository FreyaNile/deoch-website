import os
import re
from bs4 import BeautifulSoup

def get_used_strings():
    used_strings = set()
    html_files = [r'zprime/index.html']
    templates_path = r'zprime/templates'
    if os.path.exists(templates_path):
        for root, dirs, files in os.walk(templates_path):
            for file in files:
                if file.endswith('.html'):
                    html_files.append(os.path.join(root, file))
                
    for file in html_files:
        if not os.path.exists(file): continue
        try:
            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()
                soup = BeautifulSoup(content, 'html.parser')
                for tag in soup.find_all(True):
                    if tag.has_attr('class'):
                        for c in tag['class']: used_strings.add(c)
                    if tag.has_attr('id'):
                        used_strings.add(tag['id'])
                matches = re.findall(r'[\w-]+', content)
                for m in matches: used_strings.add(m)
        except: continue
        
    js_files = []
    js_dirs = [r'zprime', r'zprime/gamejs']
    for d in js_dirs:
        if os.path.exists(d):
            for file in os.listdir(d):
                if file.endswith('.js'):
                    js_files.append(os.path.join(d, file))
                
    for file in js_files:
        if not os.path.exists(file): continue
        try:
            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()
                matches = re.findall(r"['\"`](.*?)['\"`]", content, re.DOTALL)
                for m in matches:
                    for part in re.split(r'[\s\.\#\>\+\~]+', m):
                        if part: used_strings.add(part)
                matches = re.findall(r"classList\.(?:add|remove|toggle)\(['\"]([\w-]+)['\"]", content)
                for m in matches: used_strings.add(m)
                matches = re.findall(r'[\w-]+', content)
                for m in matches: used_strings.add(m)
        except: continue
        
    return used_strings

def smart_split_selector(selector):
    parts = []
    current = ""
    depth = 0
    for char in selector:
        if char == '(': depth += 1
        elif char == ')': depth -= 1
        elif char == ',' and depth == 0:
            parts.append(current.strip())
            current = ""
            continue
        current += char
    if current: parts.append(current.strip())
    return parts

def extract_nested_blocks(content):
    blocks = []
    stack = 0
    start_index = 0
    clean_content = re.sub(r'/\*.*?\*/', lambda m: ' ' * len(m.group()), content, flags=re.DOTALL)
    
    current_media_query = None
    media_stack = []

    i = 0
    while i < len(clean_content):
        char = clean_content[i]
        if char == '{':
            selector = content[start_index:i].strip()
            if selector.startswith('@media'):
                media_stack.append(selector)
            
            body_start = i + 1
            stack += 1
            
            inner_stack = 1
            j = i + 1
            while j < len(clean_content) and inner_stack > 0:
                if clean_content[j] == '{': inner_stack += 1
                elif clean_content[j] == '}': inner_stack -= 1
                j += 1
            
            body = content[body_start:j-1]
            full = content[start_index:j]
            
            if not selector.startswith('@media'):
                blocks.append({
                    "selector": selector,
                    "body": body,
                    "media": media_stack[-1] if media_stack else None,
                    "file": "" # Placeholder
                })
            
            if selector.startswith('@media'):
                i += 1
                start_index = i
                continue
            else:
                i = j
                start_index = i
                stack -= 1
                continue

        elif char == '}':
            if media_stack:
                media_stack.pop()
            stack -= 1
            i += 1
            start_index = i
            continue
            
        i += 1
    return blocks

def audit_css():
    used = get_used_strings()
    css_files = [r'zprime/css/tokens.css', r'zprime/css/navigation.css', r'zprime/css/base.css', r'zprime/css/themes/themes.css']
    comp_dir = r'zprime/css/components'
    if os.path.exists(comp_dir):
        for f in os.listdir(comp_dir):
            if f.endswith('.css'):
                css_files.append(os.path.join(comp_dir, f))
    
    all_blocks = []
    for path in css_files:
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                blocks = extract_nested_blocks(f.read())
                for b in blocks:
                    b["file"] = os.path.basename(path)
                    all_blocks.append(b)
                    
    orphans = []
    duplicates = {} # norm_body -> list of selectors
    
    state_classes = ['active', 'selected', 'open', 'expanded', 'collapsed', 'exiting', 'shade-active', 'hidden', 'visible', 'dragging', 'is-dragging', 'modal']
    preserve_patterns = [
        r'webkit', r'moz', r'ms', r'scrollbar', r':root', r'body', r'html', r'\*',
        r'\.fa-', r'\.ra-', r'\.logo', r'\.gradient-text',
        r'^\d+%$', r'^from$', r'^to$'
    ]
    
    for block in all_blocks:
        sel = block["selector"]
        body = block["body"]
        norm_body = "".join(body.split()).lower()
        
        # Duplicate detection
        if norm_body not in duplicates:
            duplicates[norm_body] = []
        duplicates[norm_body].append(f"{sel} (in {block['file']})")
        
        # Orphan detection
        is_used = False
        for pattern in preserve_patterns:
            if re.search(pattern, sel):
                is_used = True
                break
        
        if not is_used:
            for state in state_classes:
                if re.search(r'\.' + state + r'(\b|_)', sel):
                    is_used = True
                    break
                    
        if not is_used:
            clean_sel = re.sub(r':[a-z-]+(\(.*?\))?', '', sel)
            clean_sel = re.sub(r'::[a-z-]+', '', clean_sel)
            sub_selectors = smart_split_selector(clean_sel)
            any_sub_used = False
            for s in sub_selectors:
                s = s.strip()
                if not s: continue
                parts = re.split(r'[,\s>+~]+', s)
                all_parts_used = True
                for p in parts:
                    p = p.strip()
                    if not p: continue
                    subparts = re.split(r'[.#]+', p)
                    part_matched = False
                    for sp in subparts:
                        sp = sp.strip()
                        if not sp: continue
                        if sp in used or sp.lower() in ['div', 'span', 'p', 'a', 'i', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'li', 'button', 'input', 'section', 'header', 'footer', 'nav', 'main', 'article', 'aside', 'details', 'summary', 'dialog']:
                            part_matched = True
                            break
                    if not part_matched:
                        all_parts_used = False
                        break
                if all_parts_used:
                    any_sub_used = True
                    break
            is_used = any_sub_used
            
        if not is_used:
            orphans.append(f"{sel} (in {block['file']})")
            
    with open('quality_audit_results.md', 'w', encoding='utf-8') as f:
        f.write("# CSS Deep Audit Results\n\n")
        f.write(f"**Total Files:** {len(css_files)}\n")
        f.write(f"**Total Selectors Analyzed:** {len(all_blocks)}\n")
        f.write(f"**Orphaned Selectors Found:** {len(orphans)}\n")
        
        dup_count = sum(1 for v in duplicates.values() if len(v) > 1)
        f.write(f"**Duplicate Style Blocks:** {dup_count}\n\n")
        
        f.write("## Top Orphaned Selectors (Actual Cleanup Targets)\n")
        for o in orphans[:40]:
            f.write(f"- {o}\n")
            
        f.write("\n## Duplicate Style Blocks (Cross-file or Redundant Blocks)\n")
        for body, sels in duplicates.items():
            if len(sels) > 1:
                f.write(f"- Same rules shared by: {', '.join(sels[:5])}\n")
                
    print("Audit finished. Results in quality_audit_results.md")

if __name__ == "__main__":
    audit_css()
