import os
import re
import tinycss2

BASE_CSS = r"zprime/css/base.css"
COMP_DIR = r"zprime/css/components"

os.makedirs(COMP_DIR, exist_ok=True)

BUCKET_RULES = [
    ("deoch-splash", [r"splash"]),
    ("character-creation-tour", [r"tour"]),
    ("bestiary", [r"monster"]),
    ("data-management", [r"management", r"equipment", r"bulk-adjustment", r"inventory"]),
    ("orbs", [r"orb", r"ring-", r"hp-group", r"mp-group", r"sp-group"]),
    ("hud", [r"hud", r"stat-points-tooltip", r"summary-item", r"expanded-points-tracker"]),
    ("main-character-card", [r"char-form", r"tabs-card", r"attr-box", r"circle-checkbox", r"languages", r"stat-btn", r"dice", r"combat", r"condition", r"exhaustion", r"rest-toast", r"action", r"\broll", r"sheet"]),
    ("home-why-deoch-classes-updates", [r"hero", r"newsletter", r"announcement", r"ethos", r"class-card", r"updates", r"feature-card", r"mega-card", r"social-bar", r"site-footer", r"global-header", r"nav-btn", r"gallery", r"custom-select"]),
]

def determine_bucket(text_to_search):
    text_to_search = text_to_search.lower()
    for bucket_name, patterns in BUCKET_RULES:
        for p in patterns:
            if re.search(p, text_to_search):
                return bucket_name
    return "shared-core"

with open(BASE_CSS, "r", encoding="utf-8") as f:
    css_str = f.read()

# Fix URLs before parsing so the tokens have the right paths
css_str = css_str.replace("url('../images/", "url('../../images/")
css_str = css_str.replace("url(\"../images/", "url(\"../../images/")
css_str = css_str.replace("url(../images/", "url(../../images/")

css_str = css_str.replace("url('../fonts/", "url('../../fonts/")
css_str = css_str.replace("url(\"../fonts/", "url(\"../../fonts/")
css_str = css_str.replace("url(../fonts/", "url(../../fonts/")

parsed = tinycss2.parse_stylesheet(css_str, skip_comments=False)

buckets = {b[0]: [] for b in BUCKET_RULES}
buckets["shared-core"] = []

for node in parsed:
    if node.type == 'qualified-rule':
        sel = tinycss2.serialize(node.prelude)
        b = determine_bucket(sel)
        buckets[b].append(tinycss2.serialize([node]))
    elif node.type == 'at-rule':
        if node.at_keyword in ('media', 'supports') and node.content:
            inner_nodes = tinycss2.parse_rule_list(tinycss2.serialize(node.content), skip_comments=False)
            
            inner_buckets = {b: [] for b in buckets.keys()}
            for inner_node in inner_nodes:
                if inner_node.type == 'error':
                    continue # Skip parse errors
                if inner_node.type == 'qualified-rule':
                    sel = tinycss2.serialize(inner_node.prelude)
                    b = determine_bucket(sel)
                    inner_buckets[b].append(inner_node)
                else:
                    inner_buckets["shared-core"].append(inner_node)
                    
            for b, nodes in inner_buckets.items():
                if nodes:
                    inner_css = tinycss2.serialize(nodes)
                    wrapper = f"@{node.at_keyword} {tinycss2.serialize(node.prelude).strip()} {{\n  {inner_css}\n}}"
                    buckets[b].append(wrapper)
        else:
            # @font-face, @keyframes, @import, etc.
            # Only put @font-face in shared-core, but determine bucket for keyframes
            name = tinycss2.serialize(node.prelude).strip() if node.prelude else ""
            b = determine_bucket(name) if node.at_keyword == 'keyframes' else "shared-core"
            buckets[b].append(tinycss2.serialize([node]))
    elif node.type == 'comment':
        b = determine_bucket(node.value)
        buckets[b].append(tinycss2.serialize([node]))
    elif node.type != 'error':
        buckets["shared-core"].append(tinycss2.serialize([node]))

import_lines = []
for b, content_list in buckets.items():
    if not content_list:
        continue
    filepath = os.path.join(COMP_DIR, f"{b}.css")
    with open(filepath, "w", encoding="utf-8") as f:
        f.write("\n\n".join(content_list))
    import_lines.append(f'@import "components/{b}.css";')

manifest = (
    "/* base.css - Module Manifest */\n"
    "/* Modularized into specific buckets */\n\n"
    + "\n".join(import_lines) + "\n"
)
with open(BASE_CSS, "w", encoding="utf-8") as f:
    f.write(manifest)

print(f"Modularized CSS into {len(import_lines)} component files.")
