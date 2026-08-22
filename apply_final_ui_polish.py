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
        # Sidebar width -> 230px
        ('<Rectangle width="220" height="1080" color="0xFFFFFFFF" />', '<Rectangle width="230" height="1080" color="0xFFFFFFFF" />'),
        ('<Rectangle width="1" height="1080" color="0xE2E8F0FF" translation="[219, 0]" />', '<Rectangle width="1" height="1080" color="0xE2E8F0FF" translation="[229, 0]" />'),
        
        # Subtitle & Divider width
        ('<Label text="HEALTH · WELLNESS · FAMILY" font="font:SmallSystemFont" color="0x64748BFF" width="180" wrap="true" maxLines="2" />', '<Label text="HEALTH · WELLNESS · FAMILY" font="font:SmallSystemFont" color="0x64748BFF" width="190" wrap="true" maxLines="2" />'),
        ('<Rectangle width="180" height="1" color="0xE2E8F0FF" translation="[20, 106]" />', '<Rectangle width="190" height="1" color="0xE2E8F0FF" translation="[20, 106]" />'),
        ('itemSize="[220, 48]"', 'itemSize="[230, 48]"'),
        ('<Rectangle width="180" height="1" color="0xE2E8F0FF" translation="[20, -2]" />', '<Rectangle width="190" height="1" color="0xE2E8F0FF" translation="[20, -2]" />'),
        ('<Group translation="[162, 6]">', '<Group translation="[172, 6]">'),
        
        # Main Content Area translation offset (230 sidebar + 46 gutter = 276px, +24px horizontal space from logo to greeting)
        ('<Group id="mainContent" translation="[252, 0]">', '<Group id="mainContent" translation="[276, 0]">')
    ]
)

# 2. SidebarNavItem.xml
update_file(
    os.path.join(ROKU_DIR, 'components', 'scenes', 'SidebarNavItem.xml'),
    [
        ('width="220"', 'width="230"'),
        ('translation="[46, 11]" width="165"', 'translation="[46, 11]" width="180"')
    ]
)

# 3. FeaturedBookCard.xml (Fixed positions for Learn More button & QR Code / Scan label)
featured_book_xml = """<?xml version="1.0" encoding="utf-8" ?>
<component name="FeaturedBookCard" extends="Group">
    <interface>
        <field id="itemHasFocus" type="boolean" onChange="OnFocusChange" />
        <field id="selected" type="boolean" alwaysNotify="true" />
        <field id="currentBook" type="assocarray" />
    </interface>
    <script type="text/brightscript" uri="pkg:/components/scenes/FeaturedBookCard.brs" />
    <children>
        <Group id="scaleContainer" scaleRotateCenter="[197.5, 110]">
            <!-- Outer border rectangle -->
            <Rectangle id="borderRect" width="397" height="222" color="0xE2E8F0FF" translation="[-1, -1]" cornerRoundingRadius="8" />
            <!-- Main card background -->
            <Rectangle id="bgRect" width="395" height="220" color="0xFFFFFFFF" cornerRoundingRadius="8" />

            <!-- Content group (alpha animated during auto-rotation) -->
            <Group id="contentGroup">
                <!-- Left Column (70% width = ~245px) -->
                <LayoutGroup layoutDirection="vert" translation="[16, 14]" itemSpacings="[3, 3]">
                    <!-- Book Title (MediumBold, allows 2-line wrap) -->
                    <Label id="titleLabel" font="font:MediumBoldSystemFont" color="0x0F172AFF" width="245" wrap="true" maxLines="2" />
                    <!-- Author -->
                    <Label id="authorLabel" font="font:SmallBoldSystemFont" color="0x00C9A7FF" width="245" />
                    <!-- Description -->
                    <Label id="descLabel" font="font:SmallSystemFont" color="0x475569FF" width="245" wrap="true" maxLines="2" />
                </LayoutGroup>

                <!-- Action Button / Badge (fixed position at Y=172 so it is NEVER cut off) -->
                <Group id="actionBadge" translation="[16, 172]">
                    <Rectangle id="btnBg" width="115" height="28" color="0xF1F5F9FF" cornerRoundingRadius="6" />
                    <Label id="btnText" text="Learn More →" font="font:SmallBoldSystemFont" color="0x00C9A7FF" translation="[10, 4]" />
                </Group>

                <!-- Right Column (30% width = ~100px): Cover Poster -->
                <Poster id="coverPoster" width="98" height="112" translation="[276, 14]" loadDisplayMode="scaleToFit" uri="pkg:/images/fallback_artwork.png" />
                
                <!-- QR Code Info Area (fixed position at Y=138 so Scan label is NEVER clipped) -->
                <Group translation="[276, 138]">
                    <Rectangle width="34" height="34" color="0xF8FAFCFF" cornerRoundingRadius="6" />
                    <Poster width="28" height="28" uri="pkg:/images/fallback_qr.png" translation="[3, 3]" />
                    <Label text="Scan to read" font="font:SmallSystemFont" color="0x64748BFF" translation="[40, 7]" width="75" />
                </Group>
            </Group>
        </Group>

        <!-- Focus Animations -->
        <Animation id="focusInAnim" duration="0.15" easeFunction="outQuad">
            <Vector2DFieldInterpolator key="[0.0, 1.0]" keyValue="[ [1.0, 1.0], [1.04, 1.04] ]" fieldToInterp="scaleContainer.scale" />
        </Animation>
        
        <Animation id="focusOutAnim" duration="0.15" easeFunction="outQuad">
            <Vector2DFieldInterpolator key="[0.0, 1.0]" keyValue="[ [1.04, 1.04], [1.0, 1.0] ]" fieldToInterp="scaleContainer.scale" />
        </Animation>

        <!-- Rotation Transition Animations -->
        <Animation id="fadeOutAnim" duration="0.25" easeFunction="linear">
            <FloatInterpolator key="[0.0, 1.0]" keyValue="[ [1.0], [0.0] ]" fieldToInterp="contentGroup.alpha" />
        </Animation>
        
        <Animation id="fadeInAnim" duration="0.25" easeFunction="linear">
            <FloatInterpolator key="[0.0, 1.0]" keyValue="[ [0.0], [1.0] ]" fieldToInterp="contentGroup.alpha" />
        </Animation>

        <!-- Auto-rotation Timer (10 seconds) -->
        <Timer id="rotationTimer" duration="10" repeat="true" />
    </children>
</component>
"""

with open(os.path.join(ROKU_DIR, 'components', 'scenes', 'FeaturedBookCard.xml'), 'w', encoding='utf-8') as f:
    f.write(featured_book_xml)
print("Updated: components\\scenes\\FeaturedBookCard.xml")

print("Final polish script finished.")
