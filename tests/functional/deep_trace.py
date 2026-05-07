import os
import re

def main():
    orphaned_js = [
        "addToGallery", "ageConBonus", "ageStatBonus", "applyTheme", "attachHUDListeners",
        "baseValue", "clearCharacterUI", "initCustomSelect", "loadCharacterData", "modText",
        "nextLevelTarget", "onDragEnd", "onDragMove", "onDragStart", "processDamage",
        "renderClassSpells", "resetTrigger", "saveCharacterData", "setDisplay",
        "setupCollapsibleCard", "showRestToast", "switchCharacter", "syncCustomSelect",
        "toggleCardDetail", "triggerAutoSave", "updateClassDisplay", "updateClassOptionNames",
        "updateConditionsBadge", "updateDiceBadge", "updateGalleryUI", "updateHUDStates",
        "updateInfoTitle", "updateStatPointsDisplay", "updateVitalitySummary"
    ]
    
    # Read orphaned CSS from archive
    orphaned_css = []
    with open('.tmp/archive.css', 'r', encoding='utf-8') as f:
        for line in f:
            if line.startswith('/* ') and not line.startswith('/* Orphaned'):
                orphaned_css.append(line[3:-4].strip())
                
    zprime_dir = r"c:\Users\molti\.gemini\antigravity\scratch\deoch-website\zprime"
    
    # Read all zprime content into memory for faster analysis
    all_content = {}
    for root, _, files in os.walk(zprime_dir):
        for file in files:
            if file.endswith(('.js', '.html', '.css')):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        all_content[file_path] = f.read()
                except:
                    pass
                    
    results = {}
    
    for name in orphaned_js:
        is_false_positive = False
        # Strict word boundary search
        pattern = re.compile(rf'\b{name}\b')
        for path, content in all_content.items():
            if pattern.search(content):
                is_false_positive = True
                break
        
        if is_false_positive:
            results[name] = "[False Positive]"
        else:
            results[name] = "[Confirmed Orphan]"
            
    css_results = {}
    for sel in orphaned_css:
        is_false_positive = False
        # remove . or #
        clean_sel = sel.replace('.', '').replace('#', '')
        if not clean_sel:
            continue
        # Strict word boundary for CSS classes/ids in HTML/JS
        pattern = re.compile(rf'\b{re.escape(clean_sel)}\b')
        for path, content in all_content.items():
            if path.endswith('.html') or path.endswith('.js'):
                if pattern.search(content):
                    is_false_positive = True
                    break
        
        if is_false_positive:
            css_results[sel] = "[False Positive]"
        else:
            css_results[sel] = "[Confirmed Orphan]"

    with open('re_evaluation_results.md', 'w', encoding='utf-8') as f:
        f.write("# Dependency Trace Re-Evaluation\n\n")
        f.write("## JavaScript Functions\n")
        for k, v in results.items():
            f.write(f"- `{k}`: **{v}**\n")
            if v == "[Confirmed Orphan]":
                f.write(f"  - *Justification:* No structural ES module exports, global scope (`window.`), or DOM event bindings match this identifier.\n")
                
        f.write("\n## CSS Selectors\n")
        for k, v in css_results.items():
            f.write(f"- `{k}`: **{v}**\n")
            if v == "[Confirmed Orphan]":
                f.write(f"  - *Justification:* The class/ID is not referenced in any markup bindings or JS DOM manipulations.\n")

if __name__ == '__main__':
    main()
