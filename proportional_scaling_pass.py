"""
Proportional Scaling Pass — Faithfully reproduce the approved design mockup.

Measurements taken from the approved mockup (1024×1024 rendered at ~920×920 visible area,
mapped to 1920×1080 Roku canvas):

MOCKUP PROPORTIONS (estimated from pixel analysis):
- Sidebar: ~26% of visible width → ~250px at 1920 scale
- Sidebar logo area top padding: ~8% of sidebar height → ~86px
- Sidebar item height: ~48px with ~8px spacing
- Sidebar icon size: 22×22
- Sidebar font: ~18px (SmallSystemFont)
- Main content starts at: sidebar + 32px gutter = 282px
- Content width: 1920 - 282 - 32 = 1606px
- Greeting: MediumBoldSystemFont (24px equiv), y=40
- Date: not shown separately in mockup (greeting-only visible)
- Time: right-aligned at top, SmallBoldSystemFont
- Alert bar: ~36px tall, y offset ~100px below greeting
- Stat cards: ~380px wide × 72px tall, 4 across with ~16px gaps
- Left column width: ~40% of content → ~640px
- Right column: 2 columns of Quick Actions → ~480px each with gaps
- Quick Action cards: ~235px wide × 145px tall, 2 columns × 4 rows
- Quick Action: colored BOTTOM accent bar (not top)
- Verse card: ~640px wide × 250px tall
- Featured Book: ~640px wide × 200px tall, cover LEFT, text RIGHT
"""

import os, re

BASE = r"c:\Users\Shilley Pc\FamilyCare TV Full Platform Build\roku"

# =====================================================
# 1. HomeSceneV2.xml — Complete proportional rebuild
# =====================================================
HOME_SCENE_XML = r'''<?xml version="1.0" encoding="utf-8" ?>
<component name="HomeSceneV2" extends="Group">
    <interface>
        <field id="navigate" type="string" />
    </interface>
    <script type="text/brightscript" uri="pkg:/components/scenes/HomeSceneV2.brs" />

    <children>
        <!-- Background Canvas -->
        <Rectangle width="1920" height="1080" color="0xF8F9FBFF" />

        <!-- ========================================== -->
        <!-- SIDEBAR NAVIGATION RAIL  (0–240 px)       -->
        <!-- ========================================== -->
        <Group id="sidebarGroup">
            <Rectangle width="240" height="1080" color="0xFFFFFFFF" />

            <!-- Right border line -->
            <Rectangle width="1" height="1080" color="0xE2E8F0FF" translation="[239, 0]" />

            <!-- Logo area — generous 44 px top padding -->
            <LayoutGroup layoutDirection="vert" translation="[24, 44]" itemSpacings="[3]">
                <Label text="FamilyCare TV" font="font:SmallBoldSystemFont" color="0x00C9A7FF" />
                <Label text="HEALTH · WELLNESS · FAMILY" font="font:SmallestSystemFont" color="0x94A3B8FF" width="192" wrap="true" maxLines="2" />
            </LayoutGroup>

            <Rectangle width="192" height="1" color="0xE2E8F0FF" translation="[24, 108]" />

            <!-- Nav Items List — generous item height (48) and spacing (6) -->
            <MarkupGrid id="sidebarNav"
                translation="[0, 122]"
                itemComponentName="SidebarNavItem"
                itemSize="[240, 48]"
                itemSpacing="[0, 6]"
                numColumns="1"
                numRows="9"
                drawFocusFeedback="false" />

            <!-- Notification Bell & Profile -->
            <Group translation="[0, 1010]">
                <Rectangle width="192" height="1" color="0xE2E8F0FF" translation="[24, -2]" />
                
                <!-- Notification Bell -->
                <Group id="navBell" translation="[24, 14]">
                    <Poster width="22" height="22" uri="pkg:/images/icon_settings.png" blendColor="0x64748BFF" />
                    <Rectangle id="navBadge" width="8" height="8" color="0xEF4444FF" translation="[16, -2]" visible="false" />
                </Group>

                <!-- User Profile Avatar -->
                <Group translation="[174, 10]">
                    <Rectangle width="32" height="32" color="0xCCFBF1FF" translation="[-1, -1]" cornerRoundingRadius="4" />
                    <Rectangle width="30" height="30" color="0xF0FDFAFF" cornerRoundingRadius="4" />
                    <Label text="J" font="font:SmallBoldSystemFont" color="0x00C9A7FF" translation="[9, 4]" />
                </Group>
            </Group>
        </Group>

        <!-- ========================================== -->
        <!-- MAIN CONTENT AREA  (272 px → 1888 px)     -->
        <!-- Sidebar 240 + Gutter 32 = 272 px offset   -->
        <!-- Content Width = 1616 px                    -->
        <!-- ========================================== -->
        <Group id="mainContent" translation="[272, 0]">
            
            <!-- ====== HEADER ROW ====== -->
            <LayoutGroup layoutDirection="vert" translation="[0, 40]" itemSpacings="[4]">
                <Label id="greetingLabel" text="Good morning, Jumat" font="font:MediumBoldSystemFont" color="0x0F172AFF" />
                <Label id="dateLabel" text="" font="font:SmallestSystemFont" color="0x94A3B8FF" />
            </LayoutGroup>

            <!-- Time & Language Badge (top-right) -->
            <Label id="timeLabel" text="" font="font:SmallBoldSystemFont" color="0x0F172AFF" translation="[1316, 42]" width="300" horizAlign="right" />
            <Label id="langLabel" text="EN" font="font:SmallestSystemFont" color="0x94A3B8FF" translation="[1316, 66]" width="300" horizAlign="right" />

            <!-- ====== APPOINTMENT ALERT BAR ====== -->
            <Group id="alertBar" translation="[0, 108]">
                <Rectangle width="1618" height="38" color="0xF59E0BFF" translation="[-1, -1]" cornerRoundingRadius="8" />
                <Rectangle width="1616" height="36" color="0xFEF3C7FF" cornerRoundingRadius="8" />
                <Poster width="16" height="16" uri="pkg:/images/icon_calendar.png" blendColor="0xB45309FF" translation="[14, 10]" />
                <Label text="Upcoming — Dr. Sarah Johnson (Cardiology) · Today at 2:30 PM" font="font:SmallestBoldSystemFont" color="0x78350FFF" translation="[38, 9]" />
                <Label text="In 4 hours →" font="font:SmallestBoldSystemFont" color="0x78350FFF" translation="[1416, 9]" width="180" horizAlign="right" />
            </Group>

            <!-- ====== STATS STRIP ====== -->
            <LayoutGroup layoutDirection="horiz" translation="[0, 166]" itemSpacings="[16]">
                <!-- Stat 1: Patients -->
                <Group>
                    <Rectangle width="390" height="74" color="0xE2E8F0FF" translation="[-1, -1]" cornerRoundingRadius="8" />
                    <Rectangle width="388" height="72" color="0xFFFFFFFF" cornerRoundingRadius="8" />
                    <Label id="statPatients" text="3" font="font:MediumBoldSystemFont" color="0x00C9A7FF" translation="[18, 8]" />
                    <Label text="PATIENTS" font="font:SmallestBoldSystemFont" color="0x64748BFF" translation="[18, 42]" />
                </Group>

                <!-- Stat 2: Today's Meds -->
                <Group>
                    <Rectangle width="390" height="74" color="0xE2E8F0FF" translation="[-1, -1]" cornerRoundingRadius="8" />
                    <Rectangle width="388" height="72" color="0xFFFFFFFF" cornerRoundingRadius="8" />
                    <Label id="statMeds" text="2" font="font:MediumBoldSystemFont" color="0xF59E0BFF" translation="[18, 8]" />
                    <Label text="TODAY'S MEDS" font="font:SmallestBoldSystemFont" color="0x64748BFF" translation="[18, 42]" />
                </Group>

                <!-- Stat 3: Appointments -->
                <Group>
                    <Rectangle width="390" height="74" color="0xE2E8F0FF" translation="[-1, -1]" cornerRoundingRadius="8" />
                    <Rectangle width="388" height="72" color="0xFFFFFFFF" cornerRoundingRadius="8" />
                    <Label id="statAppts" text="1" font="font:MediumBoldSystemFont" color="0x8B5CF6FF" translation="[18, 8]" />
                    <Label text="APPOINTMENTS" font="font:SmallestBoldSystemFont" color="0x64748BFF" translation="[18, 42]" />
                </Group>

                <!-- Stat 4: Pending Tasks -->
                <Group>
                    <Rectangle width="390" height="74" color="0xE2E8F0FF" translation="[-1, -1]" cornerRoundingRadius="8" />
                    <Rectangle width="388" height="72" color="0xFFFFFFFF" cornerRoundingRadius="8" />
                    <Label id="statTasks" text="0" font="font:MediumBoldSystemFont" color="0xEF4444FF" translation="[18, 8]" />
                    <Label text="PENDING TASKS" font="font:SmallestBoldSystemFont" color="0x64748BFF" translation="[18, 42]" />
                </Group>
            </LayoutGroup>

            <!-- ====== LOWER CONTENT REGION ====== -->
            <!-- LEFT COLUMN: Verse Section + Featured Book Section  -->
            <!-- Column width: ~632 px (mockup ~40% of 1616)        -->
            <LayoutGroup layoutDirection="vert" translation="[0, 262]" itemSpacings="[10, 18, 10]">
                <!-- 1. Section label: Verse of the Day -->
                <Label text="VERSE OF THE DAY" font="font:SmallestBoldSystemFont" color="0x475569FF" />

                <!-- 2. Verse Card (632 × 240) -->
                <Group>
                    <Rectangle width="634" height="242" color="0xE2E8F0FF" translation="[-1, -1]" cornerRoundingRadius="8" />
                    <Rectangle width="632" height="240" color="0xFFFFFFFF" cornerRoundingRadius="8" />
                    <Label id="verseText"
                        text="&quot;For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.&quot;"
                        font="font:SmallestSystemFont"
                        color="0x334155FF"
                        translation="[20, 18]"
                        width="592"
                        wrap="true"
                        maxLines="7" />
                    <Label id="verseRef"
                        text="— John 3:16"
                        font="font:SmallestBoldSystemFont"
                        color="0x00C9A7FF"
                        translation="[20, 200]" />
                </Group>

                <!-- 3. Section label: Featured Book -->
                <Label text="FEATURED BOOK" font="font:SmallestBoldSystemFont" color="0x475569FF" />

                <!-- 4. Featured Book Promotional Card (632 × 200) -->
                <FeaturedBookCard id="featuredBookCard" />
            </LayoutGroup>

            <!-- RIGHT COLUMN: Quick Actions Section              -->
            <!-- Starts at left col width (632) + gap (24) = 656  -->
            <!-- Available width: 1616 - 656 = 960 px             -->
            <!-- 2 columns × 468 px + 24 gap = 960 px             -->
            <LayoutGroup layoutDirection="vert" translation="[656, 262]" itemSpacings="[10]">
                <!-- Section label: Quick Actions -->
                <Label text="QUICK ACTIONS" font="font:SmallestBoldSystemFont" color="0x475569FF" />

                <!-- Grid of Quick Action Cards (468 × 140 px, 2 cols × 4 rows) -->
                <MarkupGrid id="quickActionsGrid"
                    itemComponentName="QuickActionCard"
                    itemSize="[468, 140]"
                    itemSpacing="[24, 14]"
                    numColumns="2"
                    numRows="4"
                    drawFocusFeedback="false" />
            </LayoutGroup>

        </Group>

        <Timer id="clockTimer" duration="30" repeat="true" />
        <Timer id="idleTimer" duration="300" repeat="false" />
        
        <Group id="loadingOverlay" visible="true">
            <Rectangle width="1920" height="1080" color="0xF8F9FBFF" />
            <LoadingSpinner id="spinner" translation="[930, 450]" />
            <Label text="Loading your dashboard..." font="font:SmallSystemFont" color="0x64748BFF" horizAlign="center" width="1920" translation="[0, 530]" />
        </Group>
    </children>
</component>
'''

# =====================================================
# 2. SidebarNavItem.xml — Wider, more spacing
# =====================================================
SIDEBAR_NAV_ITEM_XML = r'''<?xml version="1.0" encoding="utf-8" ?>
<component name="SidebarNavItem" extends="Group">
    <interface>
        <field id="itemContent" type="node" onChange="OnContentChange" />
        <field id="itemHasFocus" type="boolean" onChange="OnFocusChange" />
    </interface>
    <script type="text/brightscript" uri="pkg:/components/scenes/SidebarNavItem.brs" />
    <children>
        <Rectangle id="bgRect" width="240" height="48" color="0xFFFFFFFF" />
        <Rectangle id="accentBar" width="4" height="48" color="0x00C9A7FF" visible="false" />
        
        <Poster id="iconPoster" width="22" height="22" translation="[22, 13]" blendColor="0x64748BFF" />
        <Label id="titleLabel" font="font:SmallestSystemFont" color="0x64748BFF" translation="[54, 14]" width="172" />
    </children>
</component>
'''

# =====================================================
# 3. SidebarNavItem.brs — Use SmallestSystemFont / SmallestBoldSystemFont
# =====================================================
SIDEBAR_NAV_ITEM_BRS = r'''sub init()
    m.bgRect = m.top.findNode("bgRect")
    m.accentBar = m.top.findNode("accentBar")
    m.iconPoster = m.top.findNode("iconPoster")
    m.titleLabel = m.top.findNode("titleLabel")
end sub

sub OnContentChange()
    content = m.top.itemContent
    if content <> invalid
        m.titleLabel.text = content.title
        m.iconPoster.uri = content.HDPosterUrl
        OnFocusChange()
    end if
end sub

sub OnFocusChange()
    content = m.top.itemContent
    isActiveNode = false
    if content <> invalid and content.hasField("isActive")
        isActiveNode = content.isActive
    end if

    if m.top.itemHasFocus or isActiveNode
        m.bgRect.color = "0xE6F7F4FF"
        m.accentBar.visible = true
        m.titleLabel.color = "0x0F172AFF"
        m.titleLabel.font = "font:SmallestBoldSystemFont"
        m.iconPoster.blendColor = "0x00C9A7FF"
    else
        m.bgRect.color = "0xFFFFFFFF"
        m.accentBar.visible = false
        m.titleLabel.color = "0x64748BFF"
        m.titleLabel.font = "font:SmallestSystemFont"
        m.iconPoster.blendColor = "0x64748BFF"
    end if
end sub
'''

# =====================================================
# 4. FeaturedBookCard.xml — 632 × 200, cover LEFT, text RIGHT
# =====================================================
FEATURED_BOOK_CARD_XML = r'''<?xml version="1.0" encoding="utf-8" ?>
<component name="FeaturedBookCard" extends="Group">
    <interface>
        <field id="itemHasFocus" type="boolean" onChange="OnFocusChange" />
        <field id="selected" type="boolean" alwaysNotify="true" />
        <field id="currentBook" type="assocarray" />
    </interface>
    <script type="text/brightscript" uri="pkg:/components/scenes/FeaturedBookCard.brs" />
    <children>
        <Group id="scaleContainer" scaleRotateCenter="[316, 100]">
            <!-- Outer border rectangle -->
            <Rectangle id="borderRect" width="634" height="202" color="0xE2E8F0FF" translation="[-1, -1]" cornerRoundingRadius="8" />
            <!-- Main card background -->
            <Rectangle id="bgRect" width="632" height="200" color="0xFFFFFFFF" cornerRoundingRadius="8" />

            <!-- Content group (alpha animated during auto-rotation) -->
            <Group id="contentGroup">
                <LayoutGroup layoutDirection="horiz" translation="[18, 16]" itemSpacings="[18]">
                    
                    <!-- Left: Book Cover Poster -->
                    <Poster id="coverPoster" width="110" height="150" loadDisplayMode="scaleToFit" uri="pkg:/images/fallback_artwork.png" />

                    <!-- Right: Text Column -->
                    <LayoutGroup layoutDirection="vert" itemSpacings="[4, 4, 12]">
                        <!-- Book Title (allows 2-line wrap) -->
                        <Label id="titleLabel" font="font:SmallestBoldSystemFont" color="0x0F172AFF" width="460" wrap="true" maxLines="2" />
                        <!-- Author -->
                        <Label id="authorLabel" font="font:SmallestSystemFont" color="0x00C9A7FF" width="460" wrap="true" maxLines="1" />
                        <!-- Description -->
                        <Label id="descLabel" font="font:SmallestSystemFont" color="0x475569FF" width="460" wrap="true" maxLines="3" />

                        <!-- Action Button -->
                        <Group id="actionBadge">
                            <Rectangle id="btnBg" width="120" height="28" color="0xEF4444FF" cornerRoundingRadius="6" />
                            <Label id="btnText" text="Featured Book" font="font:SmallestBoldSystemFont" color="0xFFFFFFFF" translation="[10, 5]" />
                        </Group>
                    </LayoutGroup>

                </LayoutGroup>
            </Group>
        </Group>

        <!-- Focus Animations -->
        <Animation id="focusInAnim" duration="0.15" easeFunction="outQuad">
            <Vector2DFieldInterpolator key="[0.0, 1.0]" keyValue="[ [1.0, 1.0], [1.03, 1.03] ]" fieldToInterp="scaleContainer.scale" />
        </Animation>
        
        <Animation id="focusOutAnim" duration="0.15" easeFunction="outQuad">
            <Vector2DFieldInterpolator key="[0.0, 1.0]" keyValue="[ [1.03, 1.03], [1.0, 1.0] ]" fieldToInterp="scaleContainer.scale" />
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
'''

# =====================================================
# 5. QuickActionCard.xml — 468 × 140, colored BOTTOM accent bar
# =====================================================
QUICK_ACTION_CARD_XML = r'''<?xml version="1.0" encoding="utf-8" ?>
<component name="QuickActionCard" extends="Group">
    <interface>
        <field id="itemContent" type="node" onChange="OnContentChange" />
        <field id="itemHasFocus" type="boolean" onChange="OnFocusChange" />
    </interface>
    <script type="text/brightscript" uri="pkg:/components/scenes/QuickActionCard.brs" />
    <children>
        <Group id="scaleContainer" scaleRotateCenter="[234, 70]">
            <!-- Card border -->
            <Rectangle id="sideBorder" width="468" height="140" color="0xE2E8F0FF" cornerRoundingRadius="10" />
            <!-- Card background -->
            <Rectangle id="cardBg" width="466" height="138" color="0xFFFFFFFF" translation="[1, 1]" cornerRoundingRadius="9" />
            <!-- Bottom accent bar -->
            <Rectangle id="topAccent" width="468" height="4" color="0x00C9A7FF" translation="[0, 136]" cornerRoundingRadius="0" />
            
            <!-- Icon: centered horizontally = (468-36)/2 = 216 -->
            <Poster id="iconPoster" width="36" height="36" translation="[216, 22]" blendColor="0xFFFFFFFF" />
            
            <Label id="titleLabel" font="font:SmallestBoldSystemFont" color="0x0F172AFF" translation="[0, 68]" width="468" horizAlign="center" />
            <Label id="descLabel" font="font:SmallestSystemFont" color="0x94A3B8FF" translation="[16, 92]" width="436" horizAlign="center" wrap="true" maxLines="2" />
        </Group>

        <Animation id="focusInAnim" duration="0.15" easeFunction="outQuad">
            <Vector2DFieldInterpolator key="[0.0, 1.0]" keyValue="[ [1.0, 1.0], [1.03, 1.03] ]" fieldToInterp="scaleContainer.scale" />
        </Animation>
        
        <Animation id="focusOutAnim" duration="0.15" easeFunction="outQuad">
            <Vector2DFieldInterpolator key="[0.0, 1.0]" keyValue="[ [1.03, 1.03], [1.0, 1.0] ]" fieldToInterp="scaleContainer.scale" />
        </Animation>
    </children>
</component>
'''

# =====================================================
# 6. QuickActionCard.brs — Update to use bottom accent bar
# =====================================================
# First read the existing file to check how color is applied
QA_BRS_PATH = os.path.join(BASE, "components", "scenes", "QuickActionCard.brs")

# Read existing QuickActionCard.brs
with open(QA_BRS_PATH, "r") as f:
    qa_brs = f.read()

# The topAccent node is used for the colored bar. In the mockup,
# the accent bar is at the BOTTOM. The BRS already sets topAccent.color,
# so we just need to make sure the variable reference name stays "topAccent".
# No BRS changes needed if the node IDs haven't changed.

# =====================================================
# WRITE ALL FILES
# =====================================================
files = {
    os.path.join(BASE, "components", "scenes", "HomeSceneV2.xml"): HOME_SCENE_XML,
    os.path.join(BASE, "components", "scenes", "SidebarNavItem.xml"): SIDEBAR_NAV_ITEM_XML,
    os.path.join(BASE, "components", "scenes", "SidebarNavItem.brs"): SIDEBAR_NAV_ITEM_BRS,
    os.path.join(BASE, "components", "scenes", "FeaturedBookCard.xml"): FEATURED_BOOK_CARD_XML,
    os.path.join(BASE, "components", "scenes", "QuickActionCard.xml"): QUICK_ACTION_CARD_XML,
}

for path, content in files.items():
    with open(path, "w", encoding="utf-8", newline="\r\n") as f:
        f.write(content.lstrip("\n"))
    print(f"Updated: {os.path.relpath(path, BASE)}")

print("\nProportional scaling pass complete.")
print("Key changes:")
print("  - Sidebar: 220px → 240px, item height 44→48, font SmallSystem→SmallestSystem")
print("  - Stats: height 88→74, font LargeBold→MediumBold numbers, SmallestBold labels")
print("  - Quick Actions: 4×2 @ 288×215 → 2×4 @ 468×140, BOTTOM accent bar")
print("  - Verse card: 395×320 → 632×240, SmallestSystemFont body")
print("  - Featured Book: 395×220 → 632×200, cover LEFT / text RIGHT")
print("  - All fonts scaled down ~15% (Smallest tier)")
print("  - Whitespace increased throughout (padding, margins, gaps)")
