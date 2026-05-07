import os
import re
import tinycss2

CSS_DIR = r'zprime/css/components'
MANIFEST_PATH = r'zprime/css/base.css'

MOVES = [
    ('aesthetic.css', 'site-sections.css', [r'\.newsletter-section']),
    ('aesthetic.css', 'cards.css', [r'\.mega-card']),
    ('aesthetic.css', 'utilities.css', [r'\.shake']),
    ('bulk-adjustment.css', 'tour.css', [r'body\.tour-active']),
    ('buttons.css', 'gallery.css', [r'\.active-gallery-btn']),
    ('cards.css', 'site-sections.css', [r'\.feature-card', r'\.announcement-bar', r'\.ethos-card', r'\.newsletter-section', r'\.badge', r'\.announcement-text', r'#newsletter-form', r'#newsletter-email', r'#newsletter-status']),
    ('char-components.css', 'hud.css', [r'\.inspiration-toggle']),
    ('combat.css', 'tour.css', [r'\.age-card']),
    ('component-classes.css', 'conditions.css', [r'\.exhaustion-badge']),
    ('component-classes.css', 'monster-catalog.css', [r'\.monster-card-item', r'\.monster-icon-wrapper']),
    ('conditions.css', 'utilities.css', [r'\.section-toggle-btn']),
    ('conditions.css', 'dice-buttons.css', [r'\.dis-btn\.active']),
    ('dice-roller.css', 'test-page.css', [r'body\.on-test-page']),
    ('equipment.css', 'dice-roller.css', [r'\.dice-result-container', r'\.dice-count-badge']),
    ('equipment.css', 'component-classes.css', [r'details\.management-menu summary']),
    ('hud.css', 'site-sections.css', [r'\.rules-grid', r'\.classes-grid', r'\.section-header']),
    ('hud.css', 'equipment.css', [r'\.equipment-column']),
    ('hud.css', 'char-components.css', [r'\.languages-grid']),
    ('orbs.css', 'test-page.css', [r'body\.on-test-page']),
    ('premium-modal.css', 'tour.css', [r'\.tour-overlay']),
    ('premium-modal.css', 'dice-roller.css', [r'#combat-log-list']),
    ('premium-modal.css', 'hud.css', [r'\.stat-btn-hidden']),
    ('splash.css', 'combat.css', [r'\.combat-side-grid']),
    ('tabs.css', 'test-page.css', [r'\.test-scroll-content']),
    ('test-page.css', 'tour.css', [r'body\.tour-active']),
]

def process_file(src_name, dest_name, patterns, new_files):
    src_path = os.path.join(CSS_DIR, src_name)
    dest_path = os.path.join(CSS_DIR, dest_name)
    
    if not os.path.exists(src_path):
        return

    with open(src_path, "r", encoding="utf-8") as f:
        css_str = f.read()

    parsed = tinycss2.parse_stylesheet(css_str, skip_comments=False)
    new_nodes = []
    extracted = []

    for node in parsed:
        if node.type == 'qualified-rule':
            selector = tinycss2.serialize(node.prelude).strip()
            if any(re.search(p, selector) for p in patterns):
                extracted.append((node, None))
            else:
                new_nodes.append(node)
        elif node.type == 'at-rule' and node.content:
            inner_nodes = tinycss2.parse_rule_list(tinycss2.serialize(node.content), skip_comments=False)
            if inner_nodes and not any(n.type == 'error' for n in inner_nodes):
                inner_remaining = []
                moved_any = False
                for inner_node in inner_nodes:
                    if inner_node.type == 'qualified-rule':
                        selector = tinycss2.serialize(inner_node.prelude).strip()
                        if any(re.search(p, selector) for p in patterns):
                            extracted.append((inner_node, node))
                            moved_any = True
                        else:
                            inner_remaining.append(inner_node)
                    else:
                        inner_remaining.append(inner_node)
                if moved_any:
                    new_content_str = tinycss2.serialize(inner_remaining)
                    node.content = tinycss2.parse_component_value_list(new_content_str)
            new_nodes.append(node)
        else:
            new_nodes.append(node)

    if extracted:
        new_css = tinycss2.serialize(new_nodes)
        with open(src_path, "w", encoding="utf-8") as f:
            f.write(new_css)
            
        mode = "a" if os.path.exists(dest_path) else "w"
        if mode == "w":
            new_files.add(dest_name)
            
        with open(dest_path, mode, encoding="utf-8") as f:
            for node, parent_node in extracted:
                f.write(f"\n/* Purified from {src_name} */\n")
                if parent_node:
                    wrapper = f"@{parent_node.at_keyword} {tinycss2.serialize(parent_node.prelude).strip()} {{\n  {tinycss2.serialize([node])}\n}}"
                    f.write(wrapper + "\n")
                else:
                    f.write(tinycss2.serialize([node]) + "\n")

def main():
    new_files = set()
    for src_name, dest_name, patterns in MOVES:
        print(f"Purifying {src_name} -> {dest_name}...")
        process_file(src_name, dest_name, patterns, new_files)
        
    if new_files:
        with open(MANIFEST_PATH, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        for new_file in sorted(new_files):
            import_line = f'@import "components/{new_file}";\n'
            if import_line not in lines:
                inserted = False
                for i, line in enumerate(lines):
                    if '@import "components/' in line:
                        existing_file = re.search(r'components/([^"]+)', line).group(1)
                        if existing_file > new_file:
                            lines.insert(i, import_line)
                            inserted = True
                            break
                if not inserted:
                    lines.append(import_line)
                    
        with open(MANIFEST_PATH, 'w', encoding='utf-8') as f:
            f.writelines(lines)
            
    print("Purification complete.")

if __name__ == "__main__":
    main()
