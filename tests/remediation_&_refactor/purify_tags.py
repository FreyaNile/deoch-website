import os
import re

COMP_DIR = r"C:\Users\molti\.gemini\antigravity\scratch\deoch-website\zprime\css\components"
TARGETS = {
    "global.css": [r"^\*$", r"^html$", r"^body$", r"^h[1-6]$" r"^label$", r"^input$", r"^textarea$", r"^select$", r"^button$"],
    "reset.css": [r"reset", r"normalize"]
}

def purify_v2():
    files = ["typography.css", "hud.css", "footer.css", "header.css"]
    global_content = ""
    
    for filename in files:
        path = os.path.join(COMP_DIR, filename)
        if not os.path.exists(path): continue
        
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
            
        # Regex for simple tag selectors at the start of a block
        # Handles h1, h2, h3, h4, h5, h6, label, etc.
        pattern = r"(?m)^\s*(h[1-6]|label|select\s+option|textarea|input\[type=[^\]]+\])\b\s*\{([^{}]*)\}"
        
        matches = list(re.finditer(pattern, content))
        if matches:
            print(f"Found {len(matches)} global matches in {filename}")
            for m in reversed(matches):
                full_match = m.group(0)
                global_content += f"\n\n/* Moved from {filename} */\n{full_match}"
                content = content.replace(full_match, f"/* Moved to global.css */")
                
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)
                
    if global_content:
        global_path = os.path.join(COMP_DIR, "global.css")
        with open(global_path, "a", encoding="utf-8") as f:
            f.write(global_content)
        print("Updated global.css with tag styles.")

if __name__ == "__main__":
    purify_v2()
