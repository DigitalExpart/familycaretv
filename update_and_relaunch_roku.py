import os
import shutil
import zipfile
import subprocess

root_dir = os.path.dirname(os.path.abspath(__file__))
roku_dir = os.path.join(root_dir, "roku")

zip_root_path = os.path.join(root_dir, "FamilyCareTV_Roku.zip")
zip_roku_path = os.path.join(roku_dir, "FamilyCareTV_Roku.zip")

print("1. Cleaning manifest in roku/manifest...")
manifest_path = os.path.join(roku_dir, "manifest")
with open(manifest_path, "r", encoding="utf-8") as f:
    content = f.read().replace("\r\n", "\n")
with open(manifest_path, "w", encoding="utf-8", newline="\n") as f:
    f.write(content)

print("2. Packaging fresh FamilyCareTV_Roku.zip...")
valid_dirs = {'components', 'source', 'images', 'locale', 'fonts'}
valid_files = {'manifest'}

if os.path.exists(zip_root_path):
    os.remove(zip_root_path)

with zipfile.ZipFile(zip_root_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(roku_dir):
        rel_root = os.path.relpath(root, roku_dir).replace('\\', '/')
        top_folder = rel_root.split('/')[0] if rel_root != '.' else '.'
        
        for file in files:
            if rel_root == '.':
                if file not in valid_files:
                    continue
            else:
                if top_folder not in valid_dirs:
                    continue
            
            full_path = os.path.join(root, file)
            arcname = os.path.relpath(full_path, roku_dir).replace('\\', '/')
            zipf.write(full_path, arcname)

print(f"Zip created at root: {zip_root_path} ({os.path.getsize(zip_root_path)} bytes)")

# Copy to roku/ directory as well so both locations are updated
shutil.copyfile(zip_root_path, zip_roku_path)
print(f"Copied zip to roku folder: {zip_roku_path} ({os.path.getsize(zip_roku_path)} bytes)")

print("Done! Both zip files are updated.")
