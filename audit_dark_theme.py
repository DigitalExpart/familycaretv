import os, re

root_dir = r"c:\Users\Shilley Pc\FamilyCare TV Full Platform Build\roku"

dark_patterns = [
    r'0x121212[0-9A-Fa-f]{2}',
    r'0x1E1E1E[0-9A-Fa-f]{2}',
    r'0x2A2A2A[0-9A-Fa-f]{2}',
    r'0x242424[0-9A-Fa-f]{2}',
    r'0x282828[0-9A-Fa-f]{2}',
    r'0x2C2C[0-9A-Fa-f]{4}',
    r'0x222222[0-9A-Fa-f]{2}',
    r'0x323232[0-9A-Fa-f]{2}',
    r'0x333333[0-9A-Fa-f]{2}',
    r'0x444444[0-9A-Fa-f]{2}',
    r'0x070B14[0-9A-Fa-f]{2}',
    r'0x08080[0-9A-Fa-f]{3}',
    r'0x0D1220[0-9A-Fa-f]{2}',
    r'0x0C1A18[0-9A-Fa-f]{2}',
    r'0x0E2420[0-9A-Fa-f]{2}',
    r'0x0A1A18[0-9A-Fa-f]{2}',
    r'#121212',
    r'#1E1E1E',
    r'#2A2A2A',
    r'#222222'
]

combined = re.compile('|'.join(dark_patterns), re.IGNORECASE)

print("=== DARK THEME AUDIT ===")
found_files = set()
for dirpath, _, filenames in os.walk(root_dir):
    for f in filenames:
        if f.endswith('.xml') or f.endswith('.brs'):
            filepath = os.path.join(dirpath, f)
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as file:
                lines = file.readlines()
            matches = []
            for idx, line in enumerate(lines):
                if combined.search(line):
                    matches.append((idx + 1, line.strip()))
            if matches:
                found_files.add(filepath)
                rel_path = os.path.relpath(filepath, root_dir)
                print(f"\nFILE: {rel_path} ({len(matches)} matches)")
                for line_num, text in matches[:5]: # print first 5
                    print(f"  L{line_num}: {text}")

print(f"\nTotal files with dark theme values: {len(found_files)}")
