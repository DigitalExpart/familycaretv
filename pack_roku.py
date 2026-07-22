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
    for root, dirs, files in os.walk(path):
        for file in files:
            # exclude the zip itself or py files
            if file.endswith(".zip") or file.endswith(".py"):
                continue
            # avoid hidden files
            if file.startswith("."):
                continue
            
            full_path = os.path.join(root, file)
            arcname = os.path.relpath(full_path, path)
            # Ensure forward slashes for Roku
            arcname = arcname.replace('\\', '/')
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
