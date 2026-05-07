import os
import re
import json
import hashlib
import datetime
from html.parser import HTMLParser

class DeochHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.classes = set()
        self.ids = set()
        self.stack = []
        self.errors = []
        self.void_elements = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}

    def handle_starttag(self, tag, attrs):
        for attr, value in attrs:
            if attr == 'class' and value:
                self.classes.update(value.split())
            elif attr == 'id' and value:
                if value in self.ids:
                    self.errors.append(f"Duplicate ID detected: '{value}'")
                self.ids.add(value)
                
        if tag not in self.void_elements:
            self.stack.append(tag)

    def handle_endtag(self, tag):
        if tag in self.void_elements:
            return
        if self.stack and self.stack[-1] == tag:
            self.stack.pop()
        else:
            self.errors.append(f"Mismatched or orphaned closing tag: </{tag}>")

class DeochAuditor:
    def __init__(self, root_dir):
        self.root_dir = root_dir
        self.results = []
        self.stats = {"Critical": 0, "Warning": 0, "Optimization": 0, "Total": 0}
        self.global_classes = set()
        self.css_selectors = set()
        self.js_functions = {}
        self.declared_js_functions = {}
        self.all_execution_text = ""
        self.listeners_added = 0
        self.listeners_removed = 0
        self.unused_classes = set()
        
        # Pre-compiled Regexes
        self.re_html_comments = re.compile(r'<!--\s*(?:const|let|var|function|div|span)\b.*-->', re.I)
        self.re_css_comments = re.compile(r'/\*.*?\*/', re.DOTALL)
        self.re_css_important = re.compile(r'([^{}]+)\{[^}]*!important[^}]*\}')
        self.re_css_classes = re.compile(r'(?<!\d)\.([a-zA-Z_-][a-zA-Z0-9_-]*)')
        self.re_js_listeners_add = re.compile(r'addEventListener')
        self.re_js_listeners_rem = re.compile(r'removeEventListener')
        self.re_js_comments = re.compile(r'//\s*(?:const|let|var|function)\b.*', re.I | re.M)
        # Capture classList methods with multiple arguments
        self.re_js_dynamic_classes = re.compile(r'classList\.(?:add|remove|toggle|contains)\((.*?)\)')
        # Capture any string literals that might be class names or selectors
        self.re_js_strings = re.compile(r'[\'"]([a-zA-Z_-][a-zA-Z0-9_-]*)[\'"]')
        self.re_js_func_decl = re.compile(r'(?:function\s+[\w-]+\s*\(|=>\s*\{)')
        self.re_js_func_names = re.compile(r'(?:function\s+([a-zA-Z0-9_$]+)\s*\(|(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:function|\([^)]*\)\s*=>))')

    def log_issue(self, category, location, severity, description, fix):
        self.results.append({
            "category": category,
            "location": location,
            "severity": severity,
            "description": description,
            "fix": fix
        })
        if severity in self.stats:
            self.stats[severity] += 1
        self.stats["Total"] += 1

    def audit_html(self, path):
        rel_path = os.path.relpath(path, self.root_dir)
        try:
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            self.all_execution_text += content + "\n"
            
            parser = DeochHTMLParser()
            parser.feed(content)
            self.global_classes.update(parser.classes)
            
            for err in parser.errors:
                self.log_issue("Structural", rel_path, "Critical", err, "Verify HTML node hierarchy.")
            if parser.stack:
                self.log_issue("Structural", rel_path, "Critical", f"Unclosed tags detected: {', '.join(parser.stack)}", "Close missing HTML tags.")
                
            if self.re_html_comments.search(content):
                self.log_issue("Anomaly", rel_path, "Optimization", "Commented-out block detected.", "Prune dead code.")
                
        except Exception as e:
            self.log_issue("Error", rel_path, "Critical", f"HTML Audit failed: {str(e)}", "Verify file encoding.")

    def audit_css(self, path):
        rel_path = os.path.relpath(path, self.root_dir)
        try:
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            clean_content = self.re_css_comments.sub('', content)
            
            stack = []
            for i, char in enumerate(clean_content):
                if char == '{': 
                    stack.append(i)
                elif char == '}':
                    if not stack:
                        self.log_issue("Syntax", rel_path, "Critical", "Extraneous closing brace.", "Remove isolated '}'.")
                    else:
                        stack.pop()
            if stack:
                self.log_issue("Syntax", rel_path, "Critical", f"Missing {len(stack)} closing braces.", "Balance CSS blocks.")

            for match in self.re_css_important.findall(clean_content):
                self.log_issue("Specificity", rel_path, "Warning", f"!important flag used in selector: {match.strip()}", "Refactor for natural cascade.")

            self.css_selectors.update(self.re_css_classes.findall(clean_content))
            
        except Exception as e:
            self.log_issue("Error", rel_path, "Critical", f"CSS Audit failed: {str(e)}", "Verify file encoding.")

    def extract_js_blocks(self, content):
        blocks = []
        for match in self.re_js_func_decl.finditer(content):
            start_idx = content.find('{', match.end())
            if start_idx == -1: continue
            
            brace_count = 1
            for i in range(start_idx + 1, len(content)):
                if content[i] == '{': brace_count += 1
                elif content[i] == '}': brace_count -= 1
                
                if brace_count == 0:
                    blocks.append(content[start_idx:i+1])
                    break
        return blocks

    def audit_js(self, path):
        rel_path = os.path.relpath(path, self.root_dir)
        try:
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()

            self.all_execution_text += content + "\n"

            # Enhanced class detection in JS
            for match in self.re_js_dynamic_classes.finditer(content):
                args = match.group(1)
                for cls in re.findall(r'[\'"]([^\'"]+)[\'"]', args):
                    self.global_classes.add(cls)
            
            # Catch general string literal matches for selectors
            for cls in self.re_js_strings.findall(content):
                if cls in self.css_selectors:
                    self.global_classes.add(cls)

            self.listeners_added += len(self.re_js_listeners_add.findall(content))
            self.listeners_removed += len(self.re_js_listeners_rem.findall(content))

            # Extract declared function names for Dead Code analysis
            for match in self.re_js_func_names.finditer(content):
                func_name = match.group(1) or match.group(2)
                if func_name:
                    self.declared_js_functions[func_name] = rel_path

            # Logic duplication check
            for body in self.extract_js_blocks(content):
                norm_body = re.sub(r'\s+', '', body)
                if len(norm_body) < 20: continue 
                
                body_hash = hashlib.sha256(norm_body.encode()).hexdigest()
                if body_hash in self.js_functions:
                    self.log_issue("Optimization", rel_path, "Warning", "Exact duplicate logic signature found.", "Abstract into shared function.")
                else:
                    self.js_functions[body_hash] = rel_path
                    
            if self.re_js_comments.search(content):
                self.log_issue("Anomaly", rel_path, "Optimization", "Commented-out execution logic detected.", "Prune dead code.")

        except Exception as e:
            self.log_issue("Error", rel_path, "Critical", f"JS Audit failed: {str(e)}", "Verify file encoding.")

    def run(self):
        for root, _, files in os.walk(self.root_dir):
            for file in files:
                path = os.path.join(root, file)
                if file.endswith('.html'): self.audit_html(path)
                elif file.endswith('.js'): self.audit_js(path) 
                
        for root, _, files in os.walk(self.root_dir):
            for file in files:
                path = os.path.join(root, file)
                if file.endswith('.css'): self.audit_css(path)

        # Pass 2: Dead CSS check
        self.unused_classes = self.css_selectors - self.global_classes
        if self.unused_classes:
            self.log_issue("Optimization", "Global CSS/HTML", "Optimization", f"{len(self.unused_classes)} CSS classes declared but not attached to HTML/JS.", "Prune unused classes.")

        # Pass 2: Dead JS Code check
        for func_name, file_path in self.declared_js_functions.items():
            occurrences = len(re.findall(rf'\b{re.escape(func_name)}\b', self.all_execution_text))
            if occurrences == 1:
                self.log_issue("Optimization", file_path, "Optimization", f"Uncalled Function: '{func_name}' is declared but never referenced.", "Prune dead code.")

    def generate_report(self, base_output_path):
        severity_map = {"Critical": 0, "Warning": 1, "Optimization": 2}
        self.results.sort(key=lambda x: (severity_map.get(x["severity"], 3), x["location"]))
        
        # Create formatted timestamp [hh:mm]
        now = datetime.datetime.now()
        timestamp_str = now.strftime("%Y-%m-%d [%H:%M]")

        json_path = f"{base_output_path}.json"
        report_data = {
            "metadata": {
                "timestamp": timestamp_str,
                "target_directory": self.root_dir,
                "summary": self.stats
            },
            "issues": self.results
        }
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, indent=4)

        md_path = f"{base_output_path}.md"
        with open(md_path, 'w', encoding='utf-8') as f:
            f.write(f"# [DEOCH] Full Enhanced Diagnostic Audit Report\n")
            f.write(f"**Generated on:** {timestamp_str}\n\n")
            
            f.write("## Executive Summary\n")
            f.write(f"* **Total Issues Flagged:** {self.stats['Total']}\n")
            f.write(f"* **[CRITICAL]:** {self.stats['Critical']}\n")
            f.write(f"* **[WARNING]:** {self.stats['Warning']}\n")
            f.write(f"* **[OPTIMIZATION]:** {self.stats['Optimization']}\n\n")
            
            f.write("## Detailed Findings\n")
            f.write("| Severity | Category | Location | Description | Recommended Fix |\n")
            f.write("| :--- | :--- | :--- | :--- | :--- |\n")
            
            for r in self.results:
                sev_tag = f"[{r['severity'][:4].upper()}]"
                f_loc = r['location'].replace('\\', '/')
                f.write(f"| {sev_tag} | {r['category']} | `{f_loc}` | {r['description']} | {r['fix']} |\n")

            if self.unused_classes:
                f.write("\n## Unused CSS Classes (Candidates for Pruning)\n")
                f.write(", ".join([f"`{c}`" for c in sorted(self.unused_classes)]) + "\n")


if __name__ == "__main__":
    auditor = DeochAuditor("zprime")
    auditor.run()
    auditor.generate_report("debug/full_audit_results")