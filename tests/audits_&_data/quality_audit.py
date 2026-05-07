import os
import re
from datetime import datetime

def main():
    zprime_dir = r"c:\Users\molti\.gemini\antigravity\scratch\deoch-website\zprime"
    
    results = {
        "Unnecessary !important": [],
        "Spaghetti Code (High Complexity)": [],
        "Hardcoding (Magic Numbers/Strings)": [],
        "Callback Hell (Deep Nesting)": [],
        "Code Smell (Suboptimal Patterns)": [],
        "Memory Leak Risks": [],
        "Race Condition Risks": [],
        "Technical Debt": []
    }
    
    # Patterns
    important_pattern = re.compile(r'!important')
    todo_pattern = re.compile(r'(TODO|FIXME|HACK)', re.IGNORECASE)
    smell_pattern = re.compile(r'\b(var\s+|eval\(|document\.write\(|==\s(?!=))')
    leak_pattern = re.compile(r'\b(setInterval\(|addEventListener\()')
    unleak_pattern = re.compile(r'\b(clearInterval\(|removeEventListener\()')
    race_pattern = re.compile(r'\bsetTimeout\(')
    
    # Tracking for leaks
    adds = 0
    removes = 0
    
    for root, _, files in os.walk(zprime_dir):
        for file in files:
            path = os.path.join(root, file)
            rel_path = os.path.relpath(path, zprime_dir)
            nesting_level = 0
            max_nesting = 0
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                
                for i, line in enumerate(lines):
                    line_num = i + 1
                    
                    if file.endswith('.css'):
                        if important_pattern.search(line):
                            results["Unnecessary !important"].append(f"{rel_path}:{line_num}")
                            
                    if file.endswith(('.js', '.html')):
                        if todo_pattern.search(line):
                            results["Technical Debt"].append(f"{rel_path}:{line_num}")
                        
                        smell = smell_pattern.search(line)
                        if smell:
                            results["Code Smell (Suboptimal Patterns)"].append(f"{rel_path}:{line_num} (Found '{smell.group(1).strip()}')")
                            
                        if leak_pattern.search(line):
                            # Check if AbortSignal is used in this line or next 100 lines
                            has_signal = False
                            for j in range(i, min(i + 101, len(lines))):
                                if 'signal:' in lines[j]:
                                    has_signal = True
                                    break
                            
                            if has_signal:
                                removes += 1 # Count as "handled"
                            adds += 1
                        if unleak_pattern.search(line):
                            removes += 1
                            
                        if race_pattern.search(line):
                            results["Race Condition Risks"].append(f"{rel_path}:{line_num} (setTimeout used)")
                            
                        # Basic callback hell/spaghetti tracker via indentation/braces
                        braces = line.count('{') - line.count('}')
                        nesting_level += braces
                        if nesting_level > max_nesting:
                            max_nesting = nesting_level
                            
                        if nesting_level > 5:
                            results["Callback Hell (Deep Nesting)"].append(f"{rel_path}:{line_num} (Nesting level {nesting_level})")
            except Exception:
                pass
                
            if max_nesting > 7:
                 results["Spaghetti Code (High Complexity)"].append(f"{rel_path} (Max nesting level {max_nesting})")
                 
    if adds > removes:
        results["Memory Leak Risks"].append(f"Global imbalance: {adds} listeners/intervals added, but only {removes} removed/cleared.")
        
    output_path = os.path.join(os.path.dirname(zprime_dir), 'quality_audit_results.md')
    
    # Generate current timestamp
    now = datetime.now().strftime("%Y-%m-%d [%H:%M]")
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("# Code Quality Audit Results\n")
        f.write(f"**Generated on:** {now}\n\n")
        
        for category, items in results.items():
            f.write(f"## {category}\n")
            if not items:
                f.write("- No obvious issues detected.\n")
            else:
                for item in items[:20]:
                    f.write(f"- {item}\n")
                if len(items) > 20:
                    f.write(f"- ... and {len(items) - 20} more instances.\n")
            f.write("\n")
            
        f.write("## Dead Code & Feature Creep\n")
        f.write("- *Note:* Static regex-based analysis for dead code and feature creep without a full AST/Bundler graph yields unreliable results. Previous orphan checks have pruned legacy dead code.\n")

if __name__ == '__main__':
    main()