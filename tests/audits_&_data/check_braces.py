import os

def check_braces(directory):
    for root, _, files in os.walk(directory):
        for f in files:
            if f.endswith('.css'):
                path = os.path.join(root, f)
                with open(path, 'r', encoding='utf-8') as file:
                    content = file.read()
                    
                    # strip comments
                    import re
                    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
                    
                    brace_level = 0
                    for line_num, line in enumerate(content.split('\n'), 1):
                        for char in line:
                            if char == '{':
                                brace_level += 1
                            elif char == '}':
                                brace_level -= 1
                                if brace_level < 0:
                                    print(f"Error: Too many closing braces in {path} at line {line_num}")
                                    # Reset to 0 to keep checking
                                    brace_level = 0
                    
                    if brace_level > 0:
                        print(f"Error: Missing {brace_level} closing braces in {path}")

current_dir = r"zprime\css"
print("Checking current CSS...")
check_braces(current_dir)
