import os
import re
import tinycss2

COMP_DIR = r"zprime/css/components"
TARGETS = {
    "glass.css": {
        "selectors": [r"\.glass-", r"-glass"],
        "properties": [r"backdrop-filter"]
    },
    "utilities.css": {
        "selectors": [r"\.u-", r"\.flex-", r"\.grid-", r"\.margin-", r"\.padding-", r"\.text-center", r"\.hidden", r"\.visible"],
        "properties": [r"display:\s*flex", r"display:\s*grid"]
    },
    "global.css": {
        "selectors": [r"^\*$", r"^html$", r"^body$", r"^h[1-6]$"]
    },
    "reset.css": {
        "selectors": [r"reset", r"normalize"]
    }
}
DEST_FILES = ["glass.css", "utilities.css", "global.css", "reset.css"]

def extract_from_nodes(nodes, filename, dest_content, migration_log):
    new_nodes = []
    for node in nodes:
        if node.type == 'qualified-rule':
            selector = tinycss2.serialize(node.prelude).strip()
            body = tinycss2.serialize(node.content).strip() if node.content else ""
            
            target_file = None
            if any(re.search(p, selector) for p in TARGETS["global.css"]["selectors"]):
                target_file = "global.css"
            elif any(re.search(p, selector) for p in TARGETS["utilities.css"]["selectors"]):
                target_file = "utilities.css"
            elif any(re.search(p, selector) for p in TARGETS["glass.css"]["selectors"]) or \
                 any(re.search(p, body) for p in TARGETS["glass.css"]["properties"]):
                if any(re.search(p, selector) for p in TARGETS["glass.css"]["selectors"]):
                    target_file = "glass.css"
            
            if target_file:
                dest_content[target_file].append((filename, node, None))
                migration_log.append(f"Moved {selector} from {filename} to {target_file}")
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
                        body = tinycss2.serialize(inner_node.content).strip() if inner_node.content else ""
                        target_file = None
                        if any(re.search(p, selector) for p in TARGETS["global.css"]["selectors"]):
                            target_file = "global.css"
                        elif any(re.search(p, selector) for p in TARGETS["utilities.css"]["selectors"]):
                            target_file = "utilities.css"
                        elif any(re.search(p, selector) for p in TARGETS["glass.css"]["selectors"]) or \
                             any(re.search(p, body) for p in TARGETS["glass.css"]["properties"]):
                            if any(re.search(p, selector) for p in TARGETS["glass.css"]["selectors"]):
                                target_file = "glass.css"
                        
                        if target_file:
                            dest_content[target_file].append((filename, inner_node, node))
                            migration_log.append(f"Moved {selector} from {filename} to {target_file} (inside @{node.at_keyword})")
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
    return new_nodes

def purify():
    migration_log = []
    dest_content = {df: [] for df in DEST_FILES}
    
    files = [f for f in os.listdir(COMP_DIR) if f.endswith(".css") and f not in DEST_FILES]
    
    for filename in files:
        path = os.path.join(COMP_DIR, filename)
        with open(path, "r", encoding="utf-8") as f:
            css_str = f.read()
        
        parsed = tinycss2.parse_stylesheet(css_str, skip_comments=False)
        new_nodes = extract_from_nodes(parsed, filename, dest_content, migration_log)
                
        new_css = tinycss2.serialize(new_nodes)
        if new_css != css_str:
            with open(path, "w", encoding="utf-8") as f:
                f.write(new_css)
                
    for df in DEST_FILES:
        if not dest_content[df]: continue
        path = os.path.join(COMP_DIR, df)
        mode = "a" if os.path.exists(path) else "w"
        with open(path, mode, encoding="utf-8") as f:
            for source_file, node, parent_node in dest_content[df]:
                f.write(f"\n/* Moved from {source_file} */\n")
                if parent_node:
                    wrapper = f"@{parent_node.at_keyword} {tinycss2.serialize(parent_node.prelude).strip()} {{\n  {tinycss2.serialize([node])}\n}}"
                    f.write(wrapper + "\n")
                else:
                    f.write(tinycss2.serialize([node]) + "\n")

    with open("purification_migration_log.md", "w", encoding="utf-8") as f:
        f.write("# CSS Purification Migration Log\n\n")
        for entry in migration_log:
            f.write(f"- {entry}\n")
    print("Purification finished.")

if __name__ == "__main__":
    purify()
