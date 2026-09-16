import os

comp_dir = r"c:\Users\USER\familycaretv\roku\components"
for root, dirs, files in os.walk(comp_dir):
    for f in files:
        if f.endswith('.xml'):
            fpath = os.path.join(root, f)
            with open(fpath, 'r', encoding='utf-8') as fp:
                c = fp.read()
            if '<field id="navigate" type="string" />' in c:
                c2 = c.replace('<field id="navigate" type="string" />', '<field id="navigate" type="string" alwaysNotify="true" />')
                with open(fpath, 'w', encoding='utf-8') as fp:
                    fp.write(c2)
                print(f"Updated {f}")
print("Done fixing navigate fields.")
