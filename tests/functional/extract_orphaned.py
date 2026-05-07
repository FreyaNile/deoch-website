import os
import re

def main():
    # We will read audit_results.md to get the orphaned lists
    orphaned_js = []
    orphaned_css = []
    
    with open('audit_results.md', 'r', encoding='utf-8') as f:
        content = f.read()
        
    js_section = re.search(r'### \[Orphaned/Unused\](.*?)## CSS Styles', content, re.DOTALL)
    if js_section:
        orphaned_js = re.findall(r'- `(.*?)`', js_section.group(1))
        
    css_section = re.search(r'## CSS Styles.*?### \[Orphaned/Unused\](.*)', content, re.DOTALL)
    if css_section:
        orphaned_css = re.findall(r'- `(.*?)`', css_section.group(1))
        
    # Creating archive files in .tmp
    os.makedirs('.tmp', exist_ok=True)
    
    with open('.tmp/archive.js', 'w', encoding='utf-8') as f:
        f.write("// Orphaned JS Functions from Legacy\n")
        for func in orphaned_js:
            f.write(f"// {func}\n")
            
    with open('.tmp/archive.css', 'w', encoding='utf-8') as f:
        f.write("/* Orphaned CSS Selectors from Legacy */\n")
        for sel in orphaned_css:
            f.write(f"/* {sel} */\n")

if __name__ == '__main__':
    main()
