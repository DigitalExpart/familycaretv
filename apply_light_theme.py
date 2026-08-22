import os
import re

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

# 1. MainScene.xml
update_file(
    os.path.join(ROKU_DIR, 'components', 'scenes', 'MainScene.xml'),
    [('color="0x0B0C11FF"', 'color="0xF8F9FBFF"')]
)

# 2. HomeSceneV2.xml
update_file(
    os.path.join(ROKU_DIR, 'components', 'scenes', 'HomeSceneV2.xml'),
    [
        # Main background
        ('<Rectangle width="1920" height="1080" color="0x0B0C11FF" />', '<Rectangle width="1920" height="1080" color="0xF8F9FBFF" />'),
        # Sidebar background & border
        ('<Rectangle width="210" height="1080" color="0x040408FF" />', '<Rectangle width="210" height="1080" color="0xFFFFFFFF" />'),
        ('<Rectangle width="1" height="1080" color="0x0D0D18FF" translation="[209, 0]" />', '<Rectangle width="1" height="1080" color="0xE2E8F0FF" translation="[209, 0]" />'),
        ('<Rectangle width="170" height="1" color="0x1E293BFF" translation="[20, 106]" />', '<Rectangle width="170" height="1" color="0xE2E8F0FF" translation="[20, 106]" />'),
        ('<Rectangle width="170" height="1" color="0x0D0D18FF" translation="[20, -2]" />', '<Rectangle width="170" height="1" color="0xE2E8F0FF" translation="[20, -2]" />'),
        ('<Poster width="28" height="28" uri="pkg:/images/icon_settings.png" blendColor="0x475569FF" />', '<Poster width="28" height="28" uri="pkg:/images/icon_settings.png" blendColor="0x64748BFF" />'),
        ('<Rectangle width="38" height="38" color="0x1A3D35FF" translation="[-1, -1]" cornerRoundingRadius="4" />', '<Rectangle width="38" height="38" color="0xCCFBF1FF" translation="[-1, -1]" cornerRoundingRadius="4" />'),
        ('<Rectangle width="36" height="36" color="0x111825FF" cornerRoundingRadius="4" />', '<Rectangle width="36" height="36" color="0xF0FDFAFF" cornerRoundingRadius="4" />'),
        # Header greeting, time, lang
        ('id="greetingLabel" text="Good morning, Jumat" font="font:LargeBoldSystemFont" color="0xFFFFFFFF"', 'id="greetingLabel" text="Good morning, Jumat" font="font:LargeBoldSystemFont" color="0x0F172AFF"'),
        ('id="timeLabel" text="" font="font:LargeBoldSystemFont" color="0xE2E8F0FF"', 'id="timeLabel" text="" font="font:LargeBoldSystemFont" color="0x0F172AFF"'),
        # Alert bar
        ('<Rectangle width="1646" height="44" color="0x1E1508FF" cornerRoundingRadius="8" />', '<Rectangle width="1646" height="44" color="0xFFFBEBFF" cornerRoundingRadius="8" />'),
        ('blendColor="0xF59E0BFF" translation="[18, 12]"', 'blendColor="0xD97706FF" translation="[18, 12]"'),
        ('text="Upcoming — Dr. Sarah Johnson (Cardiology) · Today at 2:30 PM" font="font:SmallSystemFont" color="0xF59E0BFF"', 'text="Upcoming — Dr. Sarah Johnson (Cardiology) · Today at 2:30 PM" font="font:SmallSystemFont" color="0xB45309FF"'),
        ('text="In 4 hours →" font="font:SmallBoldSystemFont" color="0xF59E0BFF"', 'text="In 4 hours →" font="font:SmallBoldSystemFont" color="0xB45309FF"'),
        # Stats strip
        ('<Rectangle width="397" height="92" color="0x1E293BFF" translation="[-1, -1]" cornerRoundingRadius="8" />', '<Rectangle width="397" height="92" color="0xE2E8F0FF" translation="[-1, -1]" cornerRoundingRadius="8" />'),
        ('<Rectangle width="395" height="90" color="0x0C0C13FF" cornerRoundingRadius="8" />', '<Rectangle width="395" height="90" color="0xFFFFFFFF" cornerRoundingRadius="8" />'),
        # Verse section & card
        ('<Label text="VERSE OF THE DAY" font="font:SmallBoldSystemFont" color="0x64748BFF" />', '<Label text="VERSE OF THE DAY" font="font:SmallBoldSystemFont" color="0x475569FF" />'),
        ('<Rectangle width="397" height="332" color="0x1E293BFF" translation="[-1, -1]" cornerRoundingRadius="8" />', '<Rectangle width="397" height="332" color="0xE2E8F0FF" translation="[-1, -1]" cornerRoundingRadius="8" />'),
        ('<Rectangle width="395" height="330" color="0x0C0C13FF" cornerRoundingRadius="8" />', '<Rectangle width="395" height="330" color="0xFFFFFFFF" cornerRoundingRadius="8" />'),
        ('color="0x94A3B8FF"', 'color="0x334155FF"'),
        # Section labels
        ('<Label text="FEATURED BOOK" font="font:SmallBoldSystemFont" color="0x64748BFF" />', '<Label text="FEATURED BOOK" font="font:SmallBoldSystemFont" color="0x475569FF" />'),
        ('<Label text="QUICK ACTIONS" font="font:SmallBoldSystemFont" color="0x64748BFF" />', '<Label text="QUICK ACTIONS" font="font:SmallBoldSystemFont" color="0x475569FF" />'),
        # Loading overlay
        ('<Rectangle width="1920" height="1080" color="0x0B0C11FF" />\n            <LoadingSpinner', '<Rectangle width="1920" height="1080" color="0xF8F9FBFF" />\n            <LoadingSpinner'),
        ('color="0x6B7280FF" horizAlign="center"', 'color="0x64748BFF" horizAlign="center"')
    ]
)

# 3. SidebarNavItem.xml
update_file(
    os.path.join(ROKU_DIR, 'components', 'scenes', 'SidebarNavItem.xml'),
    [
        ('color="0x040408FF"', 'color="0xFFFFFFFF"'),
        ('blendColor="0x475569FF"', 'blendColor="0x64748BFF"'),
        ('color="0x475569FF"', 'color="0x64748BFF"')
    ]
)

# 4. SidebarNavItem.brs
update_file(
    os.path.join(ROKU_DIR, 'components', 'scenes', 'SidebarNavItem.brs'),
    [
        ('m.bgRect.color = "0x061410FF"', 'm.bgRect.color = "0xE6F7F4FF"'),
        ('m.titleLabel.color = "0xFFFFFFFF"', 'm.titleLabel.color = "0x0F172AFF"'),
        ('m.bgRect.color = "0x040408FF"', 'm.bgRect.color = "0xFFFFFFFF"'),
        ('m.titleLabel.color = "0x475569FF"', 'm.titleLabel.color = "0x64748BFF"'),
        ('m.iconPoster.blendColor = "0x475569FF"', 'm.iconPoster.blendColor = "0x64748BFF"')
    ]
)

# 5. QuickActionCard.xml
update_file(
    os.path.join(ROKU_DIR, 'components', 'scenes', 'QuickActionCard.xml'),
    [
        ('color="0x1E293BFF" translation="[0, 3]"', 'color="0xE2E8F0FF" translation="[0, 3]"'),
        ('color="0x0C0C13FF" translation="[1, 4]"', 'color="0xFFFFFFFF" translation="[1, 4]"'),
        ('color="0xE2E8F0FF" translation="[0, 94]"', 'color="0x0F172AFF" translation="[0, 94]"'),
        ('color="0x64748BFF" translation="[16, 126]"', 'color="0x64748BFF" translation="[16, 126]"')
    ]
)

# 6. QuickActionCard.brs
update_file(
    os.path.join(ROKU_DIR, 'components', 'scenes', 'QuickActionCard.brs'),
    [
        ('m.cardBg.color = "0x1A2535FF"', 'm.cardBg.color = "0xF0FDFAFF"'),
        ('m.sideBorder.color = "0x1E293BFF"', 'm.sideBorder.color = "0xE2E8F0FF"'),
        ('m.cardBg.color = "0x0C0C13FF"', 'm.cardBg.color = "0xFFFFFFFF"')
    ]
)

# 7. FeaturedBookCard.xml
update_file(
    os.path.join(ROKU_DIR, 'components', 'scenes', 'FeaturedBookCard.xml'),
    [
        ('<Rectangle id="borderRect" width="397" height="222" color="0x1E293BFF"', '<Rectangle id="borderRect" width="397" height="222" color="0xE2E8F0FF"'),
        ('<Rectangle id="bgRect" width="395" height="220" color="0x0C0C13FF"', '<Rectangle id="bgRect" width="395" height="220" color="0xFFFFFFFF"'),
        ('color="0xE2E8F0FF" width="225" wrap="true" maxLines="2"', 'color="0x0F172AFF" width="225" wrap="true" maxLines="2"'),
        ('color="0x94A3B8FF" width="225" wrap="true" maxLines="2"', 'color="0x475569FF" width="225" wrap="true" maxLines="2"'),
        ('<Rectangle id="btnBg" width="115" height="30" color="0x1E293BFF"', '<Rectangle id="btnBg" width="115" height="30" color="0xF1F5F9FF"'),
        ('<Rectangle width="40" height="40" color="0x111827FF"', '<Rectangle width="40" height="40" color="0xF8FAFCFF"'),
        ('color="0x64748BFF" translation="[46, 10]"', 'color="0x64748BFF" translation="[46, 10]"')
    ]
)

# 8. FeaturedBookCard.brs
update_file(
    os.path.join(ROKU_DIR, 'components', 'scenes', 'FeaturedBookCard.brs'),
    [
        ('m.bgRect.color = "0x1A2535FF"', 'm.bgRect.color = "0xF0FDFAFF"'),
        ('m.btnText.color = "0x0C0C13FF"', 'm.btnText.color = "0xFFFFFFFF"'),
        ('m.borderRect.color = "0x1E293BFF"', 'm.borderRect.color = "0xE2E8F0FF"'),
        ('m.bgRect.color = "0x0C0C13FF"', 'm.bgRect.color = "0xFFFFFFFF"'),
        ('m.btnBg.color = "0x1E293BFF"', 'm.btnBg.color = "0xF1F5F9FF"')
    ]
)

# 9. HomeScreen.xml & SidebarMenu.xml & PremiumCard.xml & QuickActionTile.xml
update_file(
    os.path.join(ROKU_DIR, 'components', 'screens', 'HomeScreen.xml'),
    [
        ('color="0x121212FF"', 'color="0xF8F9FBFF"'),
        ('color="0x222222FF"', 'color="0xFFFFFFFF"'),
        ('color="0xAAAAAAFF"', 'color="0x64748BFF"'),
        ('color="0xCCCCCCFF"', 'color="0x00C9A7FF"')
    ]
)

update_file(
    os.path.join(ROKU_DIR, 'components', 'screens', 'SidebarMenu.xml'),
    [
        ('color="0x222222FF"', 'color="0xFFFFFFFF"'),
        ('color="0xAAAAAAFF"', 'color="0x64748BFF"'),
        ('focusedColor="0xFFFFFFFF"', 'focusedColor="0x00C9A7FF"')
    ]
)

update_file(
    os.path.join(ROKU_DIR, 'components', 'common', 'PremiumCard.xml'),
    [
        ('color="0x2C2C35FF"', 'color="0xFFFFFFFF"'),
        ('keyValue=\'[ "0x2C2C35FF", "0x4B4B6FFF" ]\'', 'keyValue=\'[ "0xFFFFFFFF", "0xF0FDFAFF" ]\'')
    ]
)

update_file(
    os.path.join(ROKU_DIR, 'components', 'common', 'PremiumCard.brs'),
    [
        ('"0x2C2C35FF", "0x4B4B6FFF"', '"0xFFFFFFFF", "0xF0FDFAFF"'),
        ('"0x4B4B6FFF", "0x2C2C35FF"', '"0xF0FDFAFF", "0xFFFFFFFF"')
    ]
)

update_file(
    os.path.join(ROKU_DIR, 'components', 'common', 'QuickActionTile.xml'),
    [
        ('color="0x242424FF"', 'color="0xFFFFFFFF"'),
        ('color="0x8E8EA0FF"', 'color="0x64748BFF"')
    ]
)

print("Light theme script finished.")
