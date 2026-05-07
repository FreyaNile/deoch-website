import os
import re

def audit_storage():
    root_dir = "zprime"
    patterns = {
        "Direct localStorage": r"localStorage\.(setItem|getItem|removeItem|clear)",
        "Hardcoded JSON.parse": r"JSON\.parse\(localStorage\.getItem",
        "Hardcoded JSON.stringify": r"JSON\.stringify\(.*localStorage\.setItem",
        "Deprecated StorageManager": r"StorageManager",
        "Deprecated GalleryManager": r"GalleryManager",
        "Deprecated Gallery": r"Gallery(?!Manager)",
        "Deprecated storage.js import": r"import.*storage\.js",
        "Deprecated gallery.js import": r"import.*gallery\.js",
        "Deprecated GalleryManager.js import": r"import.*GalleryManager\.js"
    }
    
    results = []
    
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith(".js"):
                path = os.path.join(root, file)
                with open(path, "r", encoding="utf-8") as f:
                    lines = f.readlines()
                    for i, line in enumerate(lines):
                        for label, pattern in patterns.items():
                            if re.search(pattern, line):
                                results.append(f"{path}:{i+1} [{label}] {line.strip()}")
    
    with open("debug/storage_audit.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(results))
    print(f"Audit complete. Found {len(results)} issues.")

if __name__ == "__main__":
    if not os.path.exists("debug"):
        os.makedirs("debug")
    audit_storage()
