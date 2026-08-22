import os

ROKU_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'roku')

def update_file(filepath, replacements):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    orig = content
    for old, new in replacements:
        content = content.replace(old, new)
        
    if content != orig:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {os.path.relpath(filepath, ROKU_DIR)}")
    else:
        print(f"No changes needed: {os.path.relpath(filepath, ROKU_DIR)}")

# 1. HomeSceneV2.xml
update_file(
    os.path.join(ROKU_DIR, 'components', 'scenes', 'HomeSceneV2.xml'),
    [
        # Sidebar width 210 -> 220
        ('<Rectangle width="210" height="1080" color="0xFFFFFFFF" />', '<Rectangle width="220" height="1080" color="0xFFFFFFFF" />'),
        ('<Rectangle width="1" height="1080" color="0xE2E8F0FF" translation="[209, 0]" />', '<Rectangle width="1" height="1080" color="0xE2E8F0FF" translation="[219, 0]" />'),
        
        # Logo size ~15% smaller (MediumBold -> SmallBold) & Subtitle font size smaller (SmallBold -> Small)
        ('<Label text="FamilyCare TV" font="font:MediumBoldSystemFont" color="0x00C9A7FF" />', '<Label text="FamilyCare TV" font="font:SmallBoldSystemFont" color="0x00C9A7FF" />'),
        ('<Label text="HEALTH · WELLNESS · FAMILY" font="font:SmallBoldSystemFont" color="0x64748BFF" width="170" wrap="true" maxLines="2" />', '<Label text="HEALTH · WELLNESS · FAMILY" font="font:SmallSystemFont" color="0x64748BFF" width="180" wrap="true" maxLines="2" />'),
        
        ('<Rectangle width="170" height="1" color="0xE2E8F0FF" translation="[20, 106]" />', '<Rectangle width="180" height="1" color="0xE2E8F0FF" translation="[20, 106]" />'),
        ('itemSize="[210, 48]"', 'itemSize="[220, 48]"'),
        ('<Rectangle width="170" height="1" color="0xE2E8F0FF" translation="[20, -2]" />', '<Rectangle width="180" height="1" color="0xE2E8F0FF" translation="[20, -2]" />'),
        ('<Group translation="[152, 6]">', '<Group translation="[162, 6]">'),
        
        # Main content area translation offset (220 + 32 = 252px)
        ('<Group id="mainContent" translation="[242, 0]">', '<Group id="mainContent" translation="[252, 0]">'),
        
        # Header breathing room & date spacing
        ('<LayoutGroup layoutDirection="vert" translation="[0, 36]" itemSpacings="[6]">', '<LayoutGroup layoutDirection="vert" translation="[0, 32]" itemSpacings="[10]">'),
        
        # Announcement alert bar contrast boost
        ('<Rectangle width="1646" height="44" color="0xFFFBEBFF" cornerRoundingRadius="8" />', '<Rectangle width="1646" height="44" color="0xFEF3C7FF" cornerRoundingRadius="8" />'),
        ('blendColor="0xD97706FF" translation="[18, 12]"', 'blendColor="0xB45309FF" translation="[18, 12]"'),
        ('color="0xB45309FF" translation="[48, 11]"', 'color="0x78350FFF" translation="[48, 11]"'),
        ('color="0xB45309FF" translation="[1478, 11]"', 'color="0x78350FFF" translation="[1478, 11]"')
    ]
)

# 2. SidebarNavItem.xml
update_file(
    os.path.join(ROKU_DIR, 'components', 'scenes', 'SidebarNavItem.xml'),
    [
        ('width="210"', 'width="220"'),
        ('translation="[18, 13]"', 'translation="[16, 13]"'),
        ('translation="[50, 11]" width="150"', 'translation="[46, 11]" width="165"')
    ]
)

# 3. FeaturedBookCard.xml
update_file(
    os.path.join(ROKU_DIR, 'components', 'scenes', 'FeaturedBookCard.xml'),
    [
        # Internal layout refinement
        ('<LayoutGroup layoutDirection="vert" translation="[20, 16]" itemSpacings="[4, 4, 10]">', '<LayoutGroup layoutDirection="vert" translation="[18, 14]" itemSpacings="[4, 4, 8]">'),
        ('width="225" wrap="true" maxLines="2"', 'width="235" wrap="true" maxLines="2"'),
        ('width="225"', 'width="235"'),
        ('<Rectangle id="btnBg" width="115" height="30" color="0xF1F5F9FF"', '<Rectangle id="btnBg" width="115" height="28" color="0xF1F5F9FF"'),
        ('<Label id="btnText" text="Learn More →" font="font:SmallBoldSystemFont" color="0x00C9A7FF" translation="[10, 5]" />', '<Label id="btnText" text="Learn More →" font="font:SmallBoldSystemFont" color="0x00C9A7FF" translation="[10, 4]" />'),
        ('<Poster id="coverPoster" width="110" height="132" translation="[265, 16]"', '<Poster id="coverPoster" width="110" height="125" translation="[265, 14]"'),
        ('<Group translation="[265, 154]">', '<Group translation="[265, 148]">'),
        ('<Rectangle width="40" height="40" color="0xF8FAFCFF"', '<Rectangle width="34" height="34" color="0xF8FAFCFF"'),
        ('<Poster width="34" height="34" uri="pkg:/images/fallback_qr.png" translation="[3, 3]" />', '<Poster width="28" height="28" uri="pkg:/images/fallback_qr.png" translation="[3, 3]" />'),
        ('translation="[46, 10]" width="75"', 'translation="[40, 7]" width="75"')
    ]
)

print("Polish script finished.")
