import os

ROKU_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'roku')

# 1. HomeSceneV2.xml
homescene_v2_xml = """<?xml version="1.0" encoding="utf-8" ?>
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
        <!-- Spacious 240px rail with comfortable margins-->
        <!-- ========================================== -->
        <Group id="sidebarGroup">
            <Rectangle width="240" height="1080" color="0xFFFFFFFF" />

            <!-- Right border line -->
            <Rectangle width="1" height="1080" color="0xE2E8F0FF" translation="[239, 0]" />

            <!-- Logo area — 40 px top padding -->
            <LayoutGroup layoutDirection="vert" translation="[20, 40]" itemSpacings="[4]">
                <Label text="FamilyCare TV" font="font:SmallBoldSystemFont" color="0x00C9A7FF" />
                <Label text="HEALTH · WELLNESS · FAMILY" font="font:SmallSystemFont" color="0x64748BFF" width="200" wrap="true" maxLines="2" />
            </LayoutGroup>

            <Rectangle width="200" height="1" color="0xE2E8F0FF" translation="[20, 106]" />

            <!-- Nav Items List -->
            <MarkupGrid id="sidebarNav"
                translation="[0, 120]"
                itemComponentName="SidebarNavItem"
                itemSize="[240, 48]"
                itemSpacing="[0, 4]"
                numColumns="1"
                numRows="9"
                drawFocusFeedback="false" />

            <!-- Notification Bell & Profile -->
            <Group translation="[0, 1010]">
                <Rectangle width="200" height="1" color="0xE2E8F0FF" translation="[20, -2]" />
                
                <!-- Notification Bell -->
                <Group id="navBell" translation="[20, 10]">
                    <Poster width="28" height="28" uri="pkg:/images/icon_settings.png" blendColor="0x64748BFF" />
                    <Rectangle id="navBadge" width="10" height="10" color="0xEF4444FF" translation="[20, -2]" visible="false" />
                </Group>

                <!-- User Profile Avatar -->
                <Group translation="[182, 6]">
                    <Rectangle width="38" height="38" color="0xCCFBF1FF" translation="[-1, -1]" cornerRoundingRadius="4" />
                    <Rectangle width="36" height="36" color="0xF0FDFAFF" cornerRoundingRadius="4" />
                    <Label text="J" font="font:SmallBoldSystemFont" color="0x00C9A7FF" translation="[12, 6]" />
                </Group>
            </Group>
        </Group>

        <!-- ========================================== -->
        <!-- MAIN CONTENT AREA  (290 px → 1888 px)     -->
        <!-- Sidebar 240 + Gutter 50 = 290 px offset   -->
        <!-- Content Width = 1600 px                    -->
        <!-- ========================================== -->
        <Group id="mainContent" translation="[290, 0]">
            
            <!-- ====== HEADER ROW ====== -->
            <!-- Greeting & Date in Vertical LayoutGroup -->
            <LayoutGroup layoutDirection="vert" translation="[0, 32]" itemSpacings="[8]">
                <Label id="greetingLabel" text="Good morning, Jumat" font="font:LargeBoldSystemFont" color="0x0F172AFF" />
                <Label id="dateLabel" text="" font="font:SmallSystemFont" color="0x64748BFF" />
            </LayoutGroup>

            <!-- Time & Language Badge (top-right) -->
            <Label id="timeLabel" text="" font="font:LargeBoldSystemFont" color="0x0F172AFF" translation="[1298, 36]" width="300" horizAlign="right" />
            <Label id="langLabel" text="EN" font="font:SmallBoldSystemFont" color="0x64748BFF" translation="[1298, 80]" width="300" horizAlign="right" />

            <!-- ====== APPOINTMENT ALERT BAR ====== -->
            <!-- 32 px gap below Header (y = 122) -->
            <Group id="alertBar" translation="[0, 122]">
                <Rectangle width="1600" height="46" color="0xF59E0BFF" translation="[-1, -1]" cornerRoundingRadius="8" />
                <Rectangle width="1598" height="44" color="0xFEF3C7FF" cornerRoundingRadius="8" />
                <Poster width="20" height="20" uri="pkg:/images/icon_calendar.png" blendColor="0xB45309FF" translation="[18, 12]" />
                <Label text="Upcoming — Dr. Sarah Johnson (Cardiology) · Today at 2:30 PM" font="font:SmallBoldSystemFont" color="0x78350FFF" translation="[48, 11]" />
                <Label text="In 4 hours →" font="font:SmallBoldSystemFont" color="0x78350FFF" translation="[1400, 11]" width="180" horizAlign="right" />
            </Group>

            <!-- ====== STATS STRIP ====== -->
            <!-- 24 px gap below Alert Bar (y = 190) -->
            <LayoutGroup layoutDirection="horiz" translation="[0, 190]" itemSpacings="[18]">
                <!-- Stat 1: Patients -->
                <Group>
                    <Rectangle width="387" height="92" color="0xE2E8F0FF" translation="[-1, -1]" cornerRoundingRadius="8" />
                    <Rectangle width="385" height="90" color="0xFFFFFFFF" cornerRoundingRadius="8" />
                    <Label id="statPatients" text="3" font="font:LargeBoldSystemFont" color="0x00C9A7FF" translation="[24, 12]" />
                    <Label text="PATIENTS" font="font:SmallBoldSystemFont" color="0x64748BFF" translation="[24, 52]" />
                </Group>

                <!-- Stat 2: Today's Meds -->
                <Group>
                    <Rectangle width="387" height="92" color="0xE2E8F0FF" translation="[-1, -1]" cornerRoundingRadius="8" />
                    <Rectangle width="385" height="90" color="0xFFFFFFFF" cornerRoundingRadius="8" />
                    <Label id="statMeds" text="2" font="font:LargeBoldSystemFont" color="0xF59E0BFF" translation="[24, 12]" />
                    <Label text="TODAY'S MEDS" font="font:SmallBoldSystemFont" color="0x64748BFF" translation="[24, 52]" />
                </Group>

                <!-- Stat 3: Appointments -->
                <Group>
                    <Rectangle width="387" height="92" color="0xE2E8F0FF" translation="[-1, -1]" cornerRoundingRadius="8" />
                    <Rectangle width="385" height="90" color="0xFFFFFFFF" cornerRoundingRadius="8" />
                    <Label id="statAppts" text="1" font="font:LargeBoldSystemFont" color="0x8B5CF6FF" translation="[24, 12]" />
                    <Label text="APPOINTMENTS" font="font:SmallBoldSystemFont" color="0x64748BFF" translation="[24, 52]" />
                </Group>

                <!-- Stat 4: Pending Tasks -->
                <Group>
                    <Rectangle width="387" height="92" color="0xE2E8F0FF" translation="[-1, -1]" cornerRoundingRadius="8" />
                    <Rectangle width="385" height="90" color="0xFFFFFFFF" cornerRoundingRadius="8" />
                    <Label id="statTasks" text="0" font="font:LargeBoldSystemFont" color="0xEF4444FF" translation="[24, 12]" />
                    <Label text="PENDING TASKS" font="font:SmallBoldSystemFont" color="0x64748BFF" translation="[24, 52]" />
                </Group>
            </LayoutGroup>

            <!-- ====== LOWER CONTENT REGION ====== -->
            <!-- 28 px gap below Stats Strip (y = 308) -->

            <!-- LEFT COLUMN: Verse Section + Featured Book Section (Vertical LayoutGroup) -->
            <LayoutGroup layoutDirection="vert" translation="[0, 308]" itemSpacings="[18, 28, 18]">
                <!-- 1. Section label: Verse of the Day -->
                <Label text="VERSE OF THE DAY" font="font:SmallBoldSystemFont" color="0x475569FF" />

                <!-- 2. Verse Card (385 × 330) -->
                <Group>
                    <Rectangle width="387" height="332" color="0xE2E8F0FF" translation="[-1, -1]" cornerRoundingRadius="8" />
                    <Rectangle width="385" height="330" color="0xFFFFFFFF" cornerRoundingRadius="8" />
                    <Label id="verseText"
                        text="&#34;For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.&#34;"
                        font="font:SmallSystemFont"
                        color="0x334155FF"
                        translation="[24, 20]"
                        width="337"
                        wrap="true"
                        maxLines="8" />
                    <Label id="verseRef"
                        text="— John 3:16"
                        font="font:SmallBoldSystemFont"
                        color="0x00C9A7FF"
                        translation="[24, 280]" />
                </Group>

                <!-- 3. Section label: Featured Book -->
                <Label text="FEATURED BOOK" font="font:SmallBoldSystemFont" color="0x475569FF" />

                <!-- 4. Featured Book Promotional Card (385 × 220) -->
                <FeaturedBookCard id="featuredBookCard" />
            </LayoutGroup>

            <!-- RIGHT COLUMN: Quick Actions Section (Vertical LayoutGroup) -->
            <!-- Offset: 385 left col + 31 gap = 416 px -->
            <LayoutGroup layoutDirection="vert" translation="[416, 308]" itemSpacings="[18]">
                <!-- Section label: Quick Actions -->
                <Label text="QUICK ACTIONS" font="font:SmallBoldSystemFont" color="0x475569FF" />

                <!-- Grid of Quick Action Cards (280 × 215 px) -->
                <MarkupGrid id="quickActionsGrid"
                    itemComponentName="QuickActionCard"
                    itemSize="[280, 215]"
                    itemSpacing="[16, 20]"
                    numColumns="4"
                    numRows="2"
                    drawFocusFeedback="false" />
            </LayoutGroup>

        </Group>

        <Timer id="clockTimer" duration="30" repeat="true" />
        <Timer id="idleTimer" duration="300" repeat="false" />
        
        <Group id="loadingOverlay" visible="true">
            <Rectangle width="1920" height="1080" color="0xF8F9FBFF" />
            <LoadingSpinner id="spinner" translation="[930, 450]" />
            <Label text="Loading your dashboard..." font="font:MediumSystemFont" color="0x64748BFF" horizAlign="center" width="1920" translation="[0, 530]" />
        </Group>
    </children>
</component>
"""

with open(os.path.join(ROKU_DIR, 'components', 'scenes', 'HomeSceneV2.xml'), 'w', encoding='utf-8') as f:
    f.write(homescene_v2_xml)
print("Updated: components\\scenes\\HomeSceneV2.xml")


# 2. SidebarNavItem.xml
sidebar_item_xml = """<?xml version="1.0" encoding="utf-8" ?>
<component name="SidebarNavItem" extends="Group">
    <interface>
        <field id="itemContent" type="node" onChange="OnContentChange" />
        <field id="itemHasFocus" type="boolean" onChange="OnFocusChange" />
    </interface>
    <script type="text/brightscript" uri="pkg:/components/scenes/SidebarNavItem.brs" />
    <children>
        <Rectangle id="bgRect" width="240" height="48" color="0xFFFFFFFF" />
        <Rectangle id="accentBar" width="4" height="48" color="0x00C9A7FF" visible="false" />
        
        <Poster id="iconPoster" width="22" height="22" translation="[16, 13]" blendColor="0x64748BFF" />
        <Label id="titleLabel" font="font:SmallBoldSystemFont" color="0x64748BFF" translation="[46, 13]" width="185" />
    </children>
</component>
"""

with open(os.path.join(ROKU_DIR, 'components', 'scenes', 'SidebarNavItem.xml'), 'w', encoding='utf-8') as f:
    f.write(sidebar_item_xml)
print("Updated: components\\scenes\\SidebarNavItem.xml")


# 3. SidebarNavItem.brs
sidebar_item_brs = """sub init()
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
        m.titleLabel.font = "font:SmallBoldSystemFont"
        m.iconPoster.blendColor = "0x00C9A7FF"
    else
        m.bgRect.color = "0xFFFFFFFF"
        m.accentBar.visible = false
        m.titleLabel.color = "0x64748BFF"
        m.titleLabel.font = "font:SmallBoldSystemFont"
        m.iconPoster.blendColor = "0x64748BFF"
    end if
end sub
"""

with open(os.path.join(ROKU_DIR, 'components', 'scenes', 'SidebarNavItem.brs'), 'w', encoding='utf-8') as f:
    f.write(sidebar_item_brs)
print("Updated: components\\scenes\\SidebarNavItem.brs")


# 4. FeaturedBookCard.xml
featured_book_xml = """<?xml version="1.0" encoding="utf-8" ?>
<component name="FeaturedBookCard" extends="Group">
    <interface>
        <field id="itemHasFocus" type="boolean" onChange="OnFocusChange" />
        <field id="selected" type="boolean" alwaysNotify="true" />
        <field id="currentBook" type="assocarray" />
    </interface>
    <script type="text/brightscript" uri="pkg:/components/scenes/FeaturedBookCard.brs" />
    <children>
        <Group id="scaleContainer" scaleRotateCenter="[192.5, 110]">
            <!-- Outer border rectangle -->
            <Rectangle id="borderRect" width="387" height="222" color="0xE2E8F0FF" translation="[-1, -1]" cornerRoundingRadius="8" />
            <!-- Main card background -->
            <Rectangle id="bgRect" width="385" height="220" color="0xFFFFFFFF" cornerRoundingRadius="8" />

            <!-- Content group (alpha animated during auto-rotation) -->
            <Group id="contentGroup">
                <!-- Left Column (70% width = ~245px) -->
                <Group translation="[18, 16]">
                    <!-- Book Title (MediumBold, allows 2-line wrap) -->
                    <Label id="titleLabel" font="font:MediumBoldSystemFont" color="0x0F172AFF" translation="[0, 0]" width="240" wrap="true" maxLines="2" />
                    <!-- Author -->
                    <Label id="authorLabel" font="font:SmallBoldSystemFont" color="0x00C9A7FF" translation="[0, 56]" width="240" wrap="true" maxLines="1" />
                    <!-- Description -->
                    <Label id="descLabel" font="font:SmallSystemFont" color="0x475569FF" translation="[0, 82]" width="240" wrap="true" maxLines="2" />
                </Group>

                <!-- Action Button / Badge (fixed position at Y=158 so it is NEVER cut off) -->
                <Group id="actionBadge" translation="[18, 158]">
                    <Rectangle id="btnBg" width="125" height="34" color="0xF1F5F9FF" cornerRoundingRadius="6" />
                    <Label id="btnText" text="Learn More →" font="font:SmallBoldSystemFont" color="0x00C9A7FF" translation="[12, 7]" />
                </Group>

                <!-- Right Column (30% width = ~100px): Cover Poster -->
                <Poster id="coverPoster" width="102" height="116" translation="[268, 16]" loadDisplayMode="scaleToFit" uri="pkg:/images/fallback_artwork.png" />
                
                <!-- QR Code Info Area (fixed position at Y=145 so Scan label is NEVER clipped) -->
                <Group translation="[268, 145]">
                    <Rectangle width="34" height="34" color="0xF8FAFCFF" cornerRoundingRadius="6" />
                    <Poster width="28" height="28" uri="pkg:/images/fallback_qr.png" translation="[3, 3]" />
                    <Label text="Scan" font="font:SmallBoldSystemFont" color="0x64748BFF" translation="[42, 8]" width="65" />
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

print("Screenshot fixes script finished.")
