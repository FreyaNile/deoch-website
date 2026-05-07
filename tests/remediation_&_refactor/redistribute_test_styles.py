import os
import re

CSS_DIR = "zprime/css/components"
TEST_PAGE_PATH = os.path.join(CSS_DIR, "test-page.css")

def move_styles(source_file, target_file, pattern):
    with open(source_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    matches = list(re.finditer(pattern, content, re.DOTALL))
    if not matches:
        print(f"No matches for {pattern} in {source_file}")
        return
    
    extracted = ""
    new_content = content
    # Process in reverse to maintain indices
    for match in reversed(matches):
        extracted = match.group(0) + "\n" + extracted
        new_content = new_content[:match.start()] + new_content[match.end():]
    
    with open(source_file, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    with open(target_file, 'a', encoding='utf-8') as f:
        f.write(f"\n/* Redistributed from test-page.css */\n{extracted}")
    
    print(f"Moved {len(matches)} blocks to {target_file}")

# 1. Global / Layout
# body.on-test-page resets
move_styles(TEST_PAGE_PATH, os.path.join(CSS_DIR, "global.css"), r"body\.on-test-page\s*\{[^\}]+\}")
# mobile-sheet-container
move_styles(TEST_PAGE_PATH, os.path.join(CSS_DIR, "layout.css"), r"[^/]*body\.on-test-page \.mobile-sheet-container\s*\{[^\}]+\}")

# 2. Navigation / Header / Footer
move_styles(TEST_PAGE_PATH, os.path.join(CSS_DIR, "navigation.css"), r"/\* Reposition mobile nav[^*]+\*/\s*body\.on-test-page \.mobile-bottom-nav\s*\{[^\}]+\}")
move_styles(TEST_PAGE_PATH, os.path.join(CSS_DIR, "navigation.css"), r"/\* Remove header and footer[^*]+\*/\s*body\.on-test-page \.global-header,\s*body\.on-test-page \.site-footer\s*\{[^\}]+\}")

# 3. HUD
move_styles(TEST_PAGE_PATH, os.path.join(CSS_DIR, "hud.css"), r"@media \(max-width: 768px\) \{\s*body\.on-test-page #mobile-sheet-view.*?\}\s*\}")
# Wait, the HUD media query is huge. I'll move the whole media query block if it's mostly HUD.
# Actually I'll do it manually for the complex ones.

# 4. Tabs
move_styles(TEST_PAGE_PATH, os.path.join(CSS_DIR, "tabs.css"), r"@media \(max-width: 768px\) \{\s*#test-tabs-card.*?\}\s*\}")
move_styles(TEST_PAGE_PATH, os.path.join(CSS_DIR, "tabs.css"), r"\.test-scroll-content\s*\{[^\}]+\}")

# 5. Orbs
move_styles(TEST_PAGE_PATH, os.path.join(CSS_DIR, "orbs.css"), r"\.orbs-layout\s*\{[^\}]+\}")
move_styles(TEST_PAGE_PATH, os.path.join(CSS_DIR, "orbs.css"), r"body\.on-test-page\.char-sheet-active \.floating-vitality-orbs,\s*body\.on-test-page \.floating-vitality-orbs\s*\{[^\}]+\}")

print("Initial redistribution script finished.")
