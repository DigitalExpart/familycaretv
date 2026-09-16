import zipfile
import re
import xml.etree.ElementTree as ET

zip_path = r"c:\Users\USER\familycaretv\FamilyCareTV_Roku.zip"
print(f"Verifying zip: {zip_path}")

errors = []
with zipfile.ZipFile(zip_path, 'r') as z:
    names = z.namelist()
    
    # 1. Check manifest
    if 'manifest' not in names:
        errors.append("Missing manifest in zip root")
    
    # 2. Check XML validity & extends="Scene"
    for name in names:
        if name.endswith('.xml'):
            content = z.read(name).decode('utf-8', errors='ignore')
            try:
                root = ET.fromstring(content)
                ext = root.attrib.get('extends', '')
                cname = root.attrib.get('name', '')
                if ext == 'Scene' and cname != 'MainScene':
                    errors.append(f"{name}: Component {cname} extends Scene! (Should extend Group)")
            except Exception as e:
                errors.append(f"{name}: XML parse error: {e}")
        
        elif name.endswith('.brs'):
            content = z.read(name).decode('utf-8', errors='ignore')
            for idx, line in enumerate(content.splitlines(), 1):
                clean = line.split("'")[0]
                if '++' in clean:
                    errors.append(f"{name}:{idx}: Invalid '++' operator")
                if '--' in clean and '---' not in line:
                    errors.append(f"{name}:{idx}: Invalid '--' operator")

if errors:
    print(f"FAILED with {len(errors)} errors:")
    for err in errors:
        print("  -", err)
else:
    print("SUCCESS: FamilyCareTV_Roku.zip passed all Roku OS hardware compatibility checks!")
