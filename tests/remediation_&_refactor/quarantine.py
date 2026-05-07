import os
import re

def find_brace_end(lines, start_idx):
    braces = 0
    found_first = False
    for i in range(start_idx, len(lines)):
        line = lines[i]
        
        # very naive comment stripping for brace counting
        clean_line = re.sub(r'//.*', '', line)
        clean_line = re.sub(r'/\*.*?\*/', '', clean_line)
        
        braces += clean_line.count('{')
        braces -= clean_line.count('}')
        
        if '{' in clean_line:
            found_first = True
            
        if found_first and braces <= 0:
            return i
    return -1

def main():
    zprime_dir = r"c:\Users\molti\.gemini\antigravity\scratch\deoch-website\zprime"
    js_files = []
    
    for root, _, files in os.walk(zprime_dir):
        for f in files:
            if f.endswith('.js'):
                js_files.append(os.path.join(root, f))
                
    # Extract definitions
    # Match: function funcName( or const funcName = ( or const funcName = function(
    def_pattern = re.compile(r'(?:function\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\()|(?:(?:const|let|var)\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*=\s*(?:function|\([^)]*\)\s*=>))')
    
    all_content = ""
    file_contents = {}
    for path in js_files:
        try:
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
                file_contents[path] = content.split('\n')
                all_content += content + "\n"
        except:
            pass
            
    # Include html for references
    for root, _, files in os.walk(zprime_dir):
        for f in files:
            if f.endswith('.html'):
                try:
                    with open(os.path.join(root, f), 'r', encoding='utf-8') as file:
                        all_content += file.read() + "\n"
                except:
                    pass

    definitions = []
    for path, lines in file_contents.items():
        for i, line in enumerate(lines):
            for m in def_pattern.finditer(line):
                name = m.group(1) or m.group(2)
                if name:
                    definitions.append({"name": name, "path": path, "line_idx": i})
                    
    # Check for references
    unused = []
    for d in definitions:
        name = d['name']
        # How many times does the name appear with a word boundary?
        # 1 time is the definition itself. If > 1, it's used.
        matches = len(re.findall(rf'\b{name}\b', all_content))
        if matches <= 1:
            unused.append(d)
            
    # Quarantine
    quarantined_files = set()
    quarantine_log = []
    
    for d in unused:
        path = d['path']
        lines = file_contents[path]
        start_idx = d['line_idx']
        end_idx = find_brace_end(lines, start_idx)
        
        if end_idx != -1 and not lines[start_idx].strip().startswith('//'):
            # Quarantine by commenting out each line
            for i in range(start_idx, end_idx + 1):
                if i == start_idx:
                    lines[i] = f"/* [QUARANTINE] */ // {lines[i]}"
                elif i == end_idx:
                    lines[i] = f"// {lines[i]} /* [/QUARANTINE] */"
                else:
                    lines[i] = f"// {lines[i]}"
                    
            file_contents[path] = lines
            quarantined_files.add(path)
            
            rel_path = os.path.relpath(path, zprime_dir)
            quarantine_log.append(f"{rel_path}:{start_idx + 1}-{end_idx + 1} ({d['name']})")
            
    # Write back
    for path in quarantined_files:
        with open(path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(file_contents[path]))
            
    with open('quarantine_log.txt', 'w', encoding='utf-8') as f:
        f.write("\n".join(quarantine_log))
        
    print(f"Quarantined {len(quarantine_log)} unused functions.")

if __name__ == '__main__':
    main()
