"""
generate_thumbnails.py
Generates responsive thumbnail variants for all UI images in zprime/images/.
Outputs: <name>-thumb.<ext> at 50% scale and <name>-sm.<ext> at 25% scale.
Skips files that already have -thumb or -sm suffixes, and files under 20KB.
Uses Lanczos resampling for quality downscaling.
"""

import os
import sys
from PIL import Image

# Configuration
IMAGES_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'zprime', 'images')
SIZE_THRESHOLD = 20 * 1024  # Skip files under 20KB
VARIANTS = [
    {'suffix': '-thumb', 'scale': 0.5},
    {'suffix': '-sm', 'scale': 0.25},
]
SUPPORTED_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.jfif'}
SKIP_SUFFIXES = ['-thumb', '-sm']


def should_skip(filename):
    """Check if file is already a variant or too small to optimize."""
    name_no_ext = os.path.splitext(filename)[0]
    for suffix in SKIP_SUFFIXES:
        if name_no_ext.endswith(suffix):
            return True
    return False


def generate_variants(image_path, filename):
    """Generate scaled-down variants for a single image file."""
    name, ext = os.path.splitext(filename)
    results = []

    try:
        with Image.open(image_path) as img:
            original_size = os.path.getsize(image_path)

            for variant in VARIANTS:
                new_name = f"{name}{variant['suffix']}{ext}"
                new_path = os.path.join(os.path.dirname(image_path), new_name)

                # Skip if variant already exists
                if os.path.exists(new_path):
                    results.append(f"  SKIP (exists): {new_name}")
                    continue

                new_width = int(img.width * variant['scale'])
                new_height = int(img.height * variant['scale'])

                # Skip if resulting image would be too small
                if new_width < 16 or new_height < 16:
                    results.append(f"  SKIP (too small): {new_name}")
                    continue

                resized = img.resize((new_width, new_height), Image.LANCZOS)

                # Convert RGBA to RGB for JPEG output
                if ext.lower() in {'.jpg', '.jpeg', '.jfif'} and resized.mode == 'RGBA':
                    resized = resized.convert('RGB')

                resized.save(new_path, optimize=True, quality=85)
                new_size = os.path.getsize(new_path)
                savings = ((original_size - new_size) / original_size) * 100
                results.append(
                    f"  CREATED: {new_name} ({new_width}x{new_height}) "
                    f"— {new_size // 1024}KB (saved {savings:.0f}%)"
                )

    except Exception as e:
        results.append(f"  ERROR: {e}")

    return results


def main():
    """Main entry point: scan images dir and generate variants."""
    images_dir = os.path.abspath(IMAGES_DIR)
    print(f"Scanning: {images_dir}")
    print(f"Threshold: >{SIZE_THRESHOLD // 1024}KB\n")

    if not os.path.isdir(images_dir):
        print(f"ERROR: Directory not found: {images_dir}")
        sys.exit(1)

    total_created = 0

    for filename in sorted(os.listdir(images_dir)):
        filepath = os.path.join(images_dir, filename)

        # Skip directories
        if os.path.isdir(filepath):
            continue

        # Skip unsupported extensions
        _, ext = os.path.splitext(filename)
        if ext.lower() not in SUPPORTED_EXTENSIONS:
            continue

        # Skip existing variants
        if should_skip(filename):
            print(f"[SKIP] {filename} (variant)")
            continue

        # Skip small files
        file_size = os.path.getsize(filepath)
        if file_size < SIZE_THRESHOLD:
            print(f"[SKIP] {filename} ({file_size // 1024}KB < threshold)")
            continue

        print(f"[PROCESS] {filename} ({file_size // 1024}KB)")
        results = generate_variants(filepath, filename)
        for r in results:
            print(r)
            if 'CREATED' in r:
                total_created += 1

    print(f"\nDone. {total_created} variants generated.")


if __name__ == '__main__':
    main()
