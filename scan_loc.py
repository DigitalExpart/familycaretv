import os
import re

roku_dir = r"c:\Users\USER\familycaretv\roku"
getstr_regex = re.compile(r'GetStr\(\s*["\']([^"\']+)["\']\s*\)')

used_keys = set()
for root, dirs, files in os.walk(roku_dir):
    for f in files:
        if f.endswith('.brs') and f != 'Localization.brs':
            fpath = os.path.join(root, f)
            with open(fpath, 'r', encoding='utf-8', errors='ignore') as fp:
                for line in fp:
                    for match in getstr_regex.findall(line):
                        used_keys.add(match)

loc_path = os.path.join(roku_dir, 'source', 'Localization.brs')
with open(loc_path, 'r', encoding='utf-8', errors='ignore') as fp:
    loc_content = fp.read()

en_part = loc_content[:loc_content.find('es = {')]
es_part = loc_content[loc_content.find('es = {'):]

en_keys = set(re.findall(r'"([^"]+)"\s*:', en_part))
es_keys = set(re.findall(r'"([^"]+)"\s*:', es_part))

missing_en = used_keys - en_keys
missing_es = used_keys - es_keys

print(f"Total used keys: {len(used_keys)}")
print(f"Missing in EN ({len(missing_en)}): {sorted(list(missing_en))}")
print(f"Missing in ES ({len(missing_es)}): {sorted(list(missing_es))}")
