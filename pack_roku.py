import zipfile
import os

def clean_manifest():
    with open('roku/manifest', 'r', encoding='utf-8') as f:
        content = f.read()
    # Ensure LF only
    content = content.replace('\r\n', '\n')
    with open('roku/manifest', 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)

def zipdir(path, ziph):
    valid_dirs = {'components', 'source', 'images', 'locale', 'fonts'}
    valid_files = {'manifest'}
    
    for root, dirs, files in os.walk(path):
        rel_root = os.path.relpath(root, path).replace('\\', '/')
        top_folder = rel_root.split('/')[0] if rel_root != '.' else '.'
        
        for file in files:
            if rel_root == '.':
                if file not in valid_files:
                    continue
            else:
                if top_folder not in valid_dirs:
                    continue
            
            full_path = os.path.join(root, file)
            arcname = os.path.relpath(full_path, path).replace('\\', '/')
            ziph.write(full_path, arcname)

if __name__ == '__main__':
    print("Cleaning manifest...")
    clean_manifest()
    
    zip_path = 'FamilyCareTV_Roku.zip'
    if os.path.exists(zip_path):
        os.remove(zip_path)
        
    print("Creating zip file...")
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        zipdir('roku', zipf)
    
    print(f"Zip created successfully: {os.path.getsize(zip_path)} bytes")
