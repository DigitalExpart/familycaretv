"""
Faithful Mockup Reproduction Pass - Precise visual specification alignment
"""
import os

BASE = r"c:\Users\Shilley Pc\FamilyCare TV Full Platform Build\roku"

# 1. HomeSceneV2.xml
HOME_SCENE_XML = r'''<?xml version="1.0" encoding="utf-8" ?>
<component name="HomeSceneV2" extends="Group">
    <interface>
        <field id="navigate" type="string" />
    </interface>
    <script type="text/brightscript" uri="pkg:/components/scenes/HomeSceneV2.brs" />

    <children>
        <!-- Background Canvas: Off-White #F7F8FA -->
        <Rectangle width="1920" height="1080" color="0xF7F8FAFF" />

        <!-- ========================================== -->
        <!-- SIDEBAR NAVIGATION RAIL  (0–240 px)       -->
        <!-- ========================================== -->
        <Group id="sidebarGroup">
            <Rectangle width="240" height="1080" color="0xFFFFFFFF" />

            <!-- Right border line -->
            <Rectangle width="1" height="1080" color="0xE2E8F0FF" translation="[239, 0]" />

            <!-- Logo area — extra top/left padding -->
            <LayoutGroup layoutDirection="vert" translation="[26, 48]" itemSpacings="[4]">
                <Label text="FamilyCare TV" font="font:SmallBoldSystemFont" color="0x00C9A7FF" />
                <Label text="HEALTH · WELLNESS · FAMILY" font="font:SmallSystemFont" color="0x94A3B8FF" width="188" wrap="true" maxLines="2" />
            </LayoutGroup>

            <Rectangle width="188" height="1" color="0xE2E8F0FF" translation="[26, 114]" />

            <!-- Nav Items List — 46px item height, 8px spacing for extra breathing room -->
            <MarkupGrid id="sidebarNav"
                translation="[0, 128]"
                itemComponentName="SidebarNavItem"
                itemSize="[240, 46]"
                itemSpacing="[0, 8]"
                numColumns="1"
                numRows="9"
                drawFocusFeedback="false" />

            <!-- Notification Bell & Profile -->
            <Group translation="[0, 1008]">
                <Rectangle width="188" height="1" color="0xE2E8F0FF" translation="[26, -2]" />
                
                <!-- Notification Bell -->
                <Group id="navBell" translation="[26, 14]">
                    <Poster width="22" height="22" uri="pkg:/images/icon_settings.png" blendColor="0x64748BFF" />
                    <Rectangle id="navBadge" width="8" height="8" color="0xEF4444FF" translation="[16, -2]" visible="false" />
                </Group>

                <!-- User Profile Avatar -->
                <Group translation="[176, 10]">
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
            <LayoutGroup layoutDirection="vert" translation="[0, 36]" itemSpacings="[4]">
                <Label id="greetingLabel" text="Good morning, Jumat" font="font:MediumBoldSystemFont" color="0x0F172AFF" />
                <Label id="dateLabel" text="" font="font:SmallestSystemFont" color="0x94A3B8FF" />
            </LayoutGroup>

            <!-- Time & Language Badge (top-right) -->
            <Label id="timeLabel" text="" font="font:SmallBoldSystemFont" color="0x0F172AFF" translation="[1316, 38]" width="300" horizAlign="right" />
            <Label id="langLabel" text="EN" font="font:SmallestSystemFont" color="0x94A3B8FF" translation="[1316, 62]" width="300" horizAlign="right" />

            <!-- ====== APPOINTMENT ALERT BAR ====== -->
            <!-- Rich Amber: #F59E0B border, #FEF3C7 fill, increased left/right padding -->
            <Group id="alertBar" translation="[0, 104]">
                <Rectangle width="1618" height="40" color="0xF59E0BFF" translation="[-1, -1]" cornerRoundingRadius="10" />
                <Rectangle width="1616" height="38" color="0xFEF3C7FF" cornerRoundingRadius="10" />
                <Poster width="18" height="18" uri="pkg:/images/icon_calendar.png" blendColor="0xB45309FF" translation="[20, 10]" />
                <Label text="Upcoming — Dr. Sarah Johnson (Cardiology) · Today at 2:30 PM" font="font:SmallestBoldSystemFont" color="0x78350FFF" translation="[48, 9]" />
                <Label text="In 4 hours →" font="font:SmallestBoldSystemFont" color="0x78350FFF" translation="[1396, 9]" width="200" horizAlign="right" />
            </Group>

            <!-- ====== STATS STRIP ====== -->
            <!-- Height 68, 12px corner rounding, subtle 1px border #CBD5E1 -->
            <LayoutGroup layoutDirection="horiz" translation="[0, 168]" itemSpacings="[16]">
                <!-- Stat 1: Patients -->
                <Group>
                    <Rectangle width="390" height="70" color="0xCBD5E1FF" translation="[-1, -1]" cornerRoundingRadius="12" />
                    <Rectangle width="388" height="68" color="0xFFFFFFFF" cornerRoundingRadius="12" />
                    <Label id="statPatients" text="3" font="font:MediumBoldSystemFont" color="0x00C9A7FF" translation="[0, 6]" width="388" horizAlign="center" />
                    <Label text="PATIENTS" font="font:SmallestBoldSystemFont" color="0x64748BFF" translation="[0, 38]" width="388" horizAlign="center" />
                </Group>

                <!-- Stat 2: Today's Meds -->
                <Group>
                    <Rectangle width="390" height="70" color="0xCBD5E1FF" translation="[-1, -1]" cornerRoundingRadius="12" />
                    <Rectangle width="388" height="68" color="0xFFFFFFFF" cornerRoundingRadius="12" />
                    <Label id="statMeds" text="2" font="font:MediumBoldSystemFont" color="0xF59E0BFF" translation="[0, 6]" width="388" horizAlign="center" />
                    <Label text="TODAY'S MEDS" font="font:SmallestBoldSystemFont" color="0x64748BFF" translation="[0, 38]" width="388" horizAlign="center" />
                </Group>

                <!-- Stat 3: Appointments -->
                <Group>
                    <Rectangle width="390" height="70" color="0xCBD5E1FF" translation="[-1, -1]" cornerRoundingRadius="12" />
                    <Rectangle width="388" height="68" color="0xFFFFFFFF" cornerRoundingRadius="12" />
                    <Label id="statAppts" text="1" font="font:MediumBoldSystemFont" color="0x8B5CF6FF" translation="[0, 6]" width="388" horizAlign="center" />
                    <Label text="APPOINTMENTS" font="font:SmallestBoldSystemFont" color="0x64748BFF" translation="[0, 38]" width="388" horizAlign="center" />
                </Group>

                <!-- Stat 4: Pending Tasks -->
                <Group>
                    <Rectangle width="390" height="70" color="0xCBD5E1FF" translation="[-1, -1]" cornerRoundingRadius="12" />
                    <Rectangle width="388" height="68" color="0xFFFFFFFF" cornerRoundingRadius="12" />
                    <Label id="statTasks" text="0" font="font:MediumBoldSystemFont" color="0xEF4444FF" translation="[0, 6]" width="388" horizAlign="center" />
                    <Label text="PENDING TASKS" font="font:SmallestBoldSystemFont" color="0x64748BFF" translation="[0, 38]" width="388" horizAlign="center" />
                </Group>
            </LayoutGroup>

            <!-- ====== LOWER CONTENT REGION ====== -->
            <!-- Increased top spacing (starts at y=264) -->
            <!-- LEFT COLUMN: Verse Section + Featured Book Section -->
            <LayoutGroup layoutDirection="vert" translation="[0, 264]" itemSpacings="[12, 20, 12]">
                <!-- 1. Section label: Verse of the Day (lighter gray 0x64748BFF, smaller weight) -->
                <Label text="VERSE OF THE DAY" font="font:SmallestSystemFont" color="0x64748BFF" />

                <!-- 2. Verse Card (632 x 200) - 12px rounding, subtle border -->
                <Group>
                    <Rectangle width="634" height="202" color="0xCBD5E1FF" translation="[-1, -1]" cornerRoundingRadius="12" />
                    <Rectangle width="632" height="200" color="0xFFFFFFFF" cornerRoundingRadius="12" />
                    <LayoutGroup layoutDirection="vert" translation="[22, 18]" itemSpacings="[14]">
                        <Label id="verseText"
                            text="&quot;For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.&quot;"
                            font="font:SmallSystemFont"
                            color="0x334155FF"
                            width="588"
                            wrap="true"
                            maxLines="6" />
                        <Label id="verseRef"
                            text="— John 3:16"
                            font="font:SmallBoldSystemFont"
                            color="0x00C9A7FF" />
                    </LayoutGroup>
                </Group>

                <!-- 3. Section label: Featured Book -->
                <Label text="FEATURED BOOK" font="font:SmallestSystemFont" color="0x64748BFF" />

                <!-- 4. Featured Book Promotional Card (632 × 230) -->
                <FeaturedBookCard id="featuredBookCard" />
            </LayoutGroup>

            <!-- RIGHT COLUMN: Quick Actions Section -->
            <LayoutGroup layoutDirection="vert" translation="[656, 264]" itemSpacings="[12]">
                <!-- Section label: Quick Actions (lighter gray) -->
                <Label text="QUICK ACTIONS" font="font:SmallestSystemFont" color="0x64748BFF" />

                <!-- Grid of Quick Action Cards (468 x 108 px, 2 cols x 4 rows) -->
                <MarkupGrid id="quickActionsGrid"
                    itemComponentName="QuickActionCard"
                    itemSize="[468, 108]"
                    itemSpacing="[24, 14]"
                    numColumns="2"
                    numRows="4"
                    drawFocusFeedback="false" />
            </LayoutGroup>

        </Group>

        <Timer id="clockTimer" duration="30" repeat="true" />
        <Timer id="idleTimer" duration="300" repeat="false" />
        
        <Group id="loadingOverlay" visible="true">
            <Rectangle width="1920" height="1080" color="0xF7F8FAFF" />
            <LoadingSpinner id="spinner" translation="[930, 450]" />
            <Label text="Loading your dashboard..." font="font:SmallSystemFont" color="0x64748BFF" horizAlign="center" width="1920" translation="[0, 530]" />
        </Group>
    </children>
</component>
'''

# 2. QuickActionCard.xml — Height 108px, 2px thinner bottom accent bar, 12px rounding, subtle border
QUICK_ACTION_CARD_XML = r'''<?xml version="1.0" encoding="utf-8" ?>
<component name="QuickActionCard" extends="Group">
    <interface>
        <field id="itemContent" type="node" onChange="OnContentChange" />
        <field id="itemHasFocus" type="boolean" onChange="OnFocusChange" />
    </interface>
    <script type="text/brightscript" uri="pkg:/components/scenes/QuickActionCard.brs" />
    <children>
        <Group id="scaleContainer" scaleRotateCenter="[234, 54]">
            <!-- Border rectangle: subtle slate-300 border -->
            <Rectangle id="sideBorder" width="468" height="108" color="0xCBD5E1FF" cornerRoundingRadius="12" />
            <!-- Card background -->
            <Rectangle id="cardBg" width="466" height="106" color="0xFFFFFFFF" translation="[1, 1]" cornerRoundingRadius="11" />
            <!-- Thinner bottom accent bar (2px) -->
            <Rectangle id="topAccent" width="468" height="3" color="0x00C9A7FF" translation="[0, 105]" cornerRoundingRadius="0" />
            
            <!-- Content layout -->
            <Poster id="iconPoster" width="30" height="30" translation="[219, 12]" blendColor="0xFFFFFFFF" />
            
            <Label id="titleLabel" font="font:SmallestBoldSystemFont" color="0x0F172AFF" translation="[0, 46]" width="468" horizAlign="center" />
            <Label id="descLabel" font="font:SmallestSystemFont" color="0x94A3B8FF" translation="[16, 68]" width="436" horizAlign="center" wrap="true" maxLines="2" />
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

# 3. FeaturedBookCard.xml — Height 230px, 12px rounding, subtle border
FEATURED_BOOK_CARD_XML = r'''<?xml version="1.0" encoding="utf-8" ?>
<component name="FeaturedBookCard" extends="Group">
    <interface>
        <field id="itemHasFocus" type="boolean" onChange="OnFocusChange" />
        <field id="selected" type="boolean" alwaysNotify="true" />
        <field id="currentBook" type="assocarray" />
    </interface>
    <script type="text/brightscript" uri="pkg:/components/scenes/FeaturedBookCard.brs" />
    <children>
        <Group id="scaleContainer" scaleRotateCenter="[316, 115]">
            <!-- Outer border rectangle: subtle border -->
            <Rectangle id="borderRect" width="634" height="232" color="0xCBD5E1FF" translation="[-1, -1]" cornerRoundingRadius="12" />
            <!-- Main card background -->
            <Rectangle id="bgRect" width="632" height="230" color="0xFFFFFFFF" cornerRoundingRadius="12" />

            <!-- Content group (alpha animated during auto-rotation) -->
            <Group id="contentGroup">
                <LayoutGroup layoutDirection="horiz" translation="[20, 18]" itemSpacings="[20]">
                    
                    <!-- Left: Book Cover Poster -->
                    <Poster id="coverPoster" width="105" height="145" loadDisplayMode="scaleToFit" uri="pkg:/images/fallback_artwork.png" />

                    <!-- Right: Text Column -->
                    <LayoutGroup layoutDirection="vert" itemSpacings="[4, 4, 12]">
                        <!-- Book Title -->
                        <Label id="titleLabel" font="font:SmallestBoldSystemFont" color="0x0F172AFF" width="455" wrap="true" maxLines="2" />
                        <!-- Author -->
                        <Label id="authorLabel" font="font:SmallestSystemFont" color="0x00C9A7FF" width="455" wrap="true" maxLines="1" />
                        <!-- Description -->
                        <Label id="descLabel" font="font:SmallestSystemFont" color="0x475569FF" width="455" wrap="true" maxLines="3" />

                        <!-- Action Button -->
                        <Group id="actionBadge">
                            <Rectangle id="btnBg" width="124" height="30" color="0xEF4444FF" cornerRoundingRadius="6" />
                            <Label id="btnText" text="Featured Book" font="font:SmallestBoldSystemFont" color="0xFFFFFFFF" translation="[12, 6]" />
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

# 4. SidebarNavItem.xml — 46px height
SIDEBAR_NAV_ITEM_XML = r'''<?xml version="1.0" encoding="utf-8" ?>
<component name="SidebarNavItem" extends="Group">
    <interface>
        <field id="itemContent" type="node" onChange="OnContentChange" />
        <field id="itemHasFocus" type="boolean" onChange="OnFocusChange" />
    </interface>
    <script type="text/brightscript" uri="pkg:/components/scenes/SidebarNavItem.brs" />
    <children>
        <Rectangle id="bgRect" width="240" height="46" color="0xFFFFFFFF" />
        <Rectangle id="accentBar" width="4" height="46" color="0x00C9A7FF" visible="false" />
        
        <Poster id="iconPoster" width="22" height="22" translation="[24, 12]" blendColor="0x64748BFF" />
        <Label id="titleLabel" font="font:SmallestSystemFont" color="0x64748BFF" translation="[56, 13]" width="168" />
    </children>
</component>
'''

files = {
    os.path.join(BASE, "components", "scenes", "HomeSceneV2.xml"): HOME_SCENE_XML,
    os.path.join(BASE, "components", "scenes", "QuickActionCard.xml"): QUICK_ACTION_CARD_XML,
    os.path.join(BASE, "components", "scenes", "FeaturedBookCard.xml"): FEATURED_BOOK_CARD_XML,
    os.path.join(BASE, "components", "scenes", "SidebarNavItem.xml"): SIDEBAR_NAV_ITEM_XML,
}

for path, content in files.items():
    with open(path, "w", encoding="utf-8", newline="\r\n") as f:
        f.write(content.lstrip("\n"))
    print(f"Updated: {os.path.relpath(path, BASE)}")

print("Faithful mockup pass applied successfully.")
