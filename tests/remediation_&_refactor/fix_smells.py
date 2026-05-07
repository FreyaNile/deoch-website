import os
import re

def fix_css(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove !important
    new_content = re.sub(r'\s*!important', '', content)
    
    if content != new_content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

def fix_js(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Replace var with let (basic boundary check)
    new_content = re.sub(r'\bvar\s+', 'let ', content)
    
    if content != new_content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

def main():
    zprime_dir = r"c:\Users\molti\.gemini\antigravity\scratch\deoch-website\zprime"
    fixed_css = 0
    fixed_js = 0
    
    for root, _, files in os.walk(zprime_dir):
        for file in files:
            path = os.path.join(root, file)
            if file.endswith('.css'):
                if fix_css(path):
                    fixed_css += 1
            elif file.endswith('.js'):
                if fix_js(path):
                    fixed_js += 1
                    
    print(f"Fixed {fixed_css} CSS files and {fixed_js} JS files.")

if __name__ == '__main__':
    main()
