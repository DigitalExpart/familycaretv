import os
import xml.etree.ElementTree as ET

root_dir = r"c:\Users\Shilley Pc\FamilyCare TV Full Platform Build\roku\components"

print("=== COORDINATE ORIGIN, VERTICAL FLOW & CONTAINMENT AUDIT ===")

total_issues = 0

for dirpath, _, filenames in os.walk(root_dir):
    for f in filenames:
        if f.endswith('.xml'):
            filepath = os.path.join(dirpath, f)
            rel_path = os.path.relpath(filepath, root_dir)
            try:
                tree = ET.parse(filepath)
                root = tree.getroot()
            except Exception as e:
                print(f"Error parsing {rel_path}: {e}")
                continue

            issues = []

            # 1. Check for dangerous horizAlignment="center" on LayoutGroup (causes SceneGraph left-clipping)
            for lg in root.iter('LayoutGroup'):
                if lg.get('horizAlignment') == 'center':
                    issues.append(f"CRITICAL: LayoutGroup has horizAlignment='center' which causes left-origin clipping in SceneGraph! Use default left alignment + Label horizAlign='center'.")

            # 2. Check for negative local translations in children
            for elem in root.iter():
                trans = elem.get('translation', '')
                if trans.startswith('['):
                    parts = trans.strip('[]').split(',')
                    if len(parts) == 2:
                        try:
                            x = float(parts[0].strip())
                            y = float(parts[1].strip())
                            tag = elem.tag
                            elem_id = elem.get('id', 'unnamed')
                            # Exclude expected negative origins (e.g. border offset [-1, -1] or [-2, -2])
                            if x < -5:
                                issues.append(f"Suspicious negative X translation X={x} on <{tag} id='{elem_id}'>: trans={trans}")
                        except:
                            pass
            
            # 3. Check all Labels for width constraints
            for label in root.iter('Label'):
                text = label.get('text', '')
                width = label.get('width')
                wrap = label.get('wrap')
                trans = label.get('translation', '[0, 0]')
                
                # Check for long text without width
                if len(text) > 30 and (width is None or width == ""):
                    issues.append(f"Label with long text ({len(text)} chars) has NO width: text='{text[:40]}...' trans={trans}")
                    
                # Check safe-area on Y translation
                if trans.startswith('['):
                    parts = trans.strip('[]').split(',')
                    if len(parts) == 2:
                        try:
                            y = float(parts[1].strip())
                            if y >= 1040:
                                issues.append(f"Label Y={y} exceeds safe area (>=1040): text='{text[:30]}' trans={trans}")
                        except:
                            pass

            if issues:
                total_issues += len(issues)
                print(f"\nFILE: {rel_path}")
                for issue in issues:
                    print(f"  [WARN] {issue}")

print(f"\nTotal potential issues detected: {total_issues}")
