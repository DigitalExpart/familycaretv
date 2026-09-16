import os
import re

roku_dir = r"c:\Users\USER\familycaretv\roku"

print("--- BRIGHTSCRIPT & SCENEGRAPH LINT ---")

# 1. Check extends="Scene"
print("\n1. Checking component extensions:")
for root, dirs, files in os.walk(os.path.join(roku_dir, 'components')):
    for f in files:
        if f.endswith('.xml'):
            fpath = os.path.join(root, f)
            with open(fpath, 'r', encoding='utf-8', errors='ignore') as fp:
                c = fp.read()
            m = re.search(r'<component\s+name="([^"]+)"\s+extends="([^"]+)"', c)
            if m:
                cname, ext = m.groups()
                if ext == "Scene" and cname != "MainScene":
                    print(f"  [ERROR] {f}: Component '{cname}' extends 'Scene'. Only MainScene should extend Scene! Child scenes must extend Group.")

# 2. Check ++ / --
print("\n2. Checking ++ / -- syntax:")
for root, dirs, files in os.walk(roku_dir):
    for f in files:
        if f.endswith('.brs'):
            fpath = os.path.join(root, f)
            with open(fpath, 'r', encoding='utf-8', errors='ignore') as fp:
                for idx, line in enumerate(fp, 1):
                    code = line.split("'")[0]
                    if '++' in code:
                        print(f"  [ERROR] {f}:{idx} uses invalid '++': {line.strip()}")
                    if '--' in code and '---' not in line:
                        print(f"  [ERROR] {f}:{idx} uses invalid '--': {line.strip()}")

# 3. Check signalBeacon calls
print("\n3. Checking signalBeacon calls:")
for root, dirs, files in os.walk(os.path.join(roku_dir, 'components')):
    for f in files:
        if f.endswith('.brs'):
            fpath = os.path.join(root, f)
            with open(fpath, 'r', encoding='utf-8', errors='ignore') as fp:
                for idx, line in enumerate(fp, 1):
                    if 'signalBeacon' in line and not line.strip().startswith("'"):
                        print(f"  [INFO] {f}:{idx}: {line.strip()}")

# 4. Check block balance (sub/end sub, function/end function, if/end if, for/end for, while/end while)
print("\n4. Checking block closures in .brs files:")
for root, dirs, files in os.walk(roku_dir):
    for f in files:
        if f.endswith('.brs'):
            fpath = os.path.join(root, f)
            with open(fpath, 'r', encoding='utf-8', errors='ignore') as fp:
                lines = fp.readlines()
            
            subs = 0
            funcs = 0
            fors = 0
            whiles = 0
            for idx, line in enumerate(lines, 1):
                clean = line.split("'")[0].strip().lower()
                tokens = clean.split()
                if not tokens:
                    continue
                
                # sub / end sub
                if tokens[0] == 'sub':
                    subs += 1
                elif clean.startswith('end sub'):
                    subs -= 1
                
                # function / end function
                if tokens[0] == 'function':
                    funcs += 1
                elif clean.startswith('end function'):
                    funcs -= 1
                
                # for / end for
                if tokens[0] == 'for':
                    fors += 1
                elif clean.startswith('end for') or clean.startswith('next'):
                    fors -= 1
                
                # while / end while
                if tokens[0] == 'while':
                    whiles += 1
                elif clean.startswith('end while'):
                    whiles -= 1
            
            if subs != 0:
                print(f"  [ERROR] {f}: Unbalanced sub/end sub ({subs})")
            if funcs != 0:
                print(f"  [ERROR] {f}: Unbalanced function/end function ({funcs})")
            if fors != 0:
                print(f"  [ERROR] {f}: Unbalanced for/end for ({fors})")
            if whiles != 0:
                print(f"  [ERROR] {f}: Unbalanced while/end while ({whiles})")

print("\nLint check finished.")
