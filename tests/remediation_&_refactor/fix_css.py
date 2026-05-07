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

def is_selector_used(sel, used_strings):
    state_classes = ['active', 'selected', 'open', 'expanded', 'collapsed', 'exiting', 'shade-active', 'hidden', 'visible', 'dragging', 'is-dragging', 'modal']
    preserve_patterns = [
        r'webkit', r'moz', r'ms', r'scrollbar', r':root', r'body', r'html', r'\*',
        r'\.fa-', r'\.ra-', r'\.logo', r'\.gradient-text',
        r'^\d+%$', r'^from$', r'^to$'
    ]
    
    for pattern in preserve_patterns:
        if re.search(pattern, sel): return True
    for state in state_classes:
        if re.search(r'\.' + state + r'(\b|_)', sel): return True
        
    clean_sel = re.sub(r':[a-z-]+(\(.*?\))?', '', sel)
    clean_sel = re.sub(r'::[a-z-]+', '', clean_sel)
    
    parts = re.split(r'[,\s>+~]+', clean_sel)
    all_parts_used = True
    for p in parts:
        p = p.strip()
        if not p: continue
        subparts = re.split(r'[.#]+', p)
        part_matched = False
        for sp in subparts:
            sp = sp.strip()
            if not sp: continue
            if sp in used_strings or sp.lower() in ['div', 'span', 'p', 'a', 'i', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'li', 'button', 'input', 'section', 'header', 'footer', 'nav', 'main', 'article', 'aside', 'details', 'summary', 'dialog']:
                part_matched = True
                break
        if not part_matched:
            all_parts_used = False
            break
    return all_parts_used

def fix_css_aggressive():
    used = get_used_strings()
    base_css = r'zprime/css/base.css'
    if not os.path.exists(base_css): return
    
    with open(base_css, 'r', encoding='utf-8') as f:
        content = f.read()

    # Simple regex block parser that preserves the file better than my custom one
    # We'll use it to find the start and end of blocks
    blocks = []
    stack = 0
    start = 0
    clean_content = re.sub(r'/\*.*?\*/', lambda m: ' ' * len(m.group()), content, flags=re.DOTALL)
    
    for i, char in enumerate(clean_content):
        if char == '{':
            if stack == 0:
                sel_start = start
                sel_end = i
                body_start = i + 1
            stack += 1
        elif char == '}':
            stack -= 1
            if stack == 0:
                blocks.append({
                    "start": sel_start,
                    "end": i + 1,
                    "selector": content[sel_start:sel_end].strip(),
                    "body": content[body_start:i]
                })
                start = i + 1

    # Apply changes in reverse order to keep indices valid
    new_content = content
    removed_count = 0
    for block in reversed(blocks):
        sel = block["selector"]
        if sel.startswith('@'): continue # Skip media queries and keyframes for now
        
        sub_selectors = smart_split_selector(sel)
        used_sub_selectors = [s for s in sub_selectors if is_selector_used(s, used)]
        
        if not used_sub_selectors:
            # Remove the whole block
            new_content = new_content[:block["start"]] + new_content[block["end"]:]
            removed_count += 1
        elif len(used_sub_selectors) < len(sub_selectors):
            # Surgical removal of unused selectors from the comma list
            new_sel = ", ".join(used_sub_selectors)
            new_block = f"{new_sel} {{{block['body']}}}"
            new_content = new_content[:block["start"]] + new_block + new_content[block["end"]:]
            removed_count += 1

    with open(base_css, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"Aggressive Cleanup finished. Issues handled: {removed_count}")

if __name__ == "__main__":
    fix_css_aggressive()
