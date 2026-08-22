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
        <!-- SIDEBAR NAVIGATION RAIL  (0–220 px)       -->
        <!-- ========================================== -->
        <Group id="sidebarGroup">
            <Rectangle width="220" height="1080" color="0xFFFFFFFF" />

            <!-- Right border line -->
            <Rectangle width="1" height="1080" color="0xE2E8F0FF" translation="[219, 0]" />

            <!-- Logo area — 36 px top padding -->
            <LayoutGroup layoutDirection="vert" translation="[20, 36]" itemSpacings="[4]">
                <Label text="FamilyCare TV" font="font:SmallBoldSystemFont" color="0x00C9A7FF" />
                <Label text="HEALTH · WELLNESS · FAMILY" font="font:SmallSystemFont" color="0x64748BFF" width="180" wrap="true" maxLines="2" />
            </LayoutGroup>

            <Rectangle width="180" height="1" color="0xE2E8F0FF" translation="[20, 106]" />

            <!-- Nav Items List -->
            <MarkupGrid id="sidebarNav"
                translation="[0, 116]"
                itemComponentName="SidebarNavItem"
                itemSize="[220, 44]"
                itemSpacing="[0, 4]"
                numColumns="1"
                numRows="9"
                drawFocusFeedback="false" />

            <!-- Notification Bell & Profile -->
            <Group translation="[0, 1010]">
                <Rectangle width="180" height="1" color="0xE2E8F0FF" translation="[20, -2]" />
                
                <!-- Notification Bell -->
                <Group id="navBell" translation="[20, 10]">
                    <Poster width="26" height="26" uri="pkg:/images/icon_settings.png" blendColor="0x64748BFF" />
                    <Rectangle id="navBadge" width="10" height="10" color="0xEF4444FF" translation="[18, -2]" visible="false" />
                </Group>

                <!-- User Profile Avatar -->
                <Group translation="[162, 6]">
                    <Rectangle width="36" height="36" color="0xCCFBF1FF" translation="[-1, -1]" cornerRoundingRadius="4" />
                    <Rectangle width="34" height="34" color="0xF0FDFAFF" cornerRoundingRadius="4" />
                    <Label text="J" font="font:SmallBoldSystemFont" color="0x00C9A7FF" translation="[11, 5]" />
                </Group>
            </Group>
        </Group>

        <!-- ========================================== -->
        <!-- MAIN CONTENT AREA  (252 px → 1888 px)     -->
        <!-- Sidebar 220 + Gutter 32 = 252 px offset   -->
        <!-- Content Width = 1636 px                    -->
        <!-- ========================================== -->
        <Group id="mainContent" translation="[252, 0]">
            
            <!-- ====== HEADER ROW ====== -->
            <LayoutGroup layoutDirection="vert" translation="[0, 32]" itemSpacings="[6]">
                <Label id="greetingLabel" text="Good morning, Jumat" font="font:MediumBoldSystemFont" color="0x0F172AFF" />
                <Label id="dateLabel" text="" font="font:SmallSystemFont" color="0x64748BFF" />
            </LayoutGroup>

            <!-- Time & Language Badge (top-right) -->
            <Label id="timeLabel" text="" font="font:MediumBoldSystemFont" color="0x0F172AFF" translation="[1336, 32]" width="300" horizAlign="right" />
            <Label id="langLabel" text="EN" font="font:SmallBoldSystemFont" color="0x64748BFF" translation="[1336, 70]" width="300" horizAlign="right" />

            <!-- ====== APPOINTMENT ALERT BAR ====== -->
            <Group id="alertBar" translation="[0, 116]">
                <Rectangle width="1638" height="44" color="0xF59E0BFF" translation="[-1, -1]" cornerRoundingRadius="8" />
                <Rectangle width="1636" height="42" color="0xFEF3C7FF" cornerRoundingRadius="8" />
                <Poster width="18" height="18" uri="pkg:/images/icon_calendar.png" blendColor="0xB45309FF" translation="[16, 12]" />
                <Label text="Upcoming — Dr. Sarah Johnson (Cardiology) · Today at 2:30 PM" font="font:SmallBoldSystemFont" color="0x78350FFF" translation="[44, 10]" />
                <Label text="In 4 hours →" font="font:SmallBoldSystemFont" color="0x78350FFF" translation="[1440, 10]" width="180" horizAlign="right" />
            </Group>

            <!-- ====== STATS STRIP ====== -->
            <LayoutGroup layoutDirection="horiz" translation="[0, 180]" itemSpacings="[18]">
                <!-- Stat 1: Patients -->
                <Group>
                    <Rectangle width="397" height="88" color="0xE2E8F0FF" translation="[-1, -1]" cornerRoundingRadius="8" />
                    <Rectangle width="395" height="86" color="0xFFFFFFFF" cornerRoundingRadius="8" />
                    <Label id="statPatients" text="3" font="font:LargeBoldSystemFont" color="0x00C9A7FF" translation="[20, 10]" />
                    <Label text="PATIENTS" font="font:SmallBoldSystemFont" color="0x64748BFF" translation="[20, 50]" />
                </Group>

                <!-- Stat 2: Today's Meds -->
                <Group>
                    <Rectangle width="397" height="88" color="0xE2E8F0FF" translation="[-1, -1]" cornerRoundingRadius="8" />
                    <Rectangle width="395" height="86" color="0xFFFFFFFF" cornerRoundingRadius="8" />
                    <Label id="statMeds" text="2" font="font:LargeBoldSystemFont" color="0xF59E0BFF" translation="[20, 10]" />
                    <Label text="TODAY'S MEDS" font="font:SmallBoldSystemFont" color="0x64748BFF" translation="[20, 50]" />
                </Group>

                <!-- Stat 3: Appointments -->
                <Group>
                    <Rectangle width="397" height="88" color="0xE2E8F0FF" translation="[-1, -1]" cornerRoundingRadius="8" />
                    <Rectangle width="395" height="86" color="0xFFFFFFFF" cornerRoundingRadius="8" />
                    <Label id="statAppts" text="1" font="font:LargeBoldSystemFont" color="0x8B5CF6FF" translation="[20, 10]" />
                    <Label text="APPOINTMENTS" font="font:SmallBoldSystemFont" color="0x64748BFF" translation="[20, 50]" />
                </Group>

                <!-- Stat 4: Pending Tasks -->
                <Group>
                    <Rectangle width="397" height="88" color="0xE2E8F0FF" translation="[-1, -1]" cornerRoundingRadius="8" />
                    <Rectangle width="395" height="86" color="0xFFFFFFFF" cornerRoundingRadius="8" />
                    <Label id="statTasks" text="0" font="font:LargeBoldSystemFont" color="0xEF4444FF" translation="[20, 10]" />
                    <Label text="PENDING TASKS" font="font:SmallBoldSystemFont" color="0x64748BFF" translation="[20, 50]" />
                </Group>
            </LayoutGroup>

            <!-- ====== LOWER CONTENT REGION ====== -->
            <!-- LEFT COLUMN: Verse Section + Featured Book Section -->
            <LayoutGroup layoutDirection="vert" translation="[0, 290]" itemSpacings="[14, 24, 14]">
                <!-- 1. Section label: Verse of the Day -->
                <Label text="VERSE OF THE DAY" font="font:SmallBoldSystemFont" color="0x475569FF" />

                <!-- 2. Verse Card (395 × 320) -->
                <Group>
                    <Rectangle width="397" height="322" color="0xE2E8F0FF" translation="[-1, -1]" cornerRoundingRadius="8" />
                    <Rectangle width="395" height="320" color="0xFFFFFFFF" cornerRoundingRadius="8" />
                    <Label id="verseText"
                        text="&#34;For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.&#34;"
                        font="font:SmallSystemFont"
                        color="0x334155FF"
                        translation="[20, 18]"
                        width="355"
                        wrap="true"
                        maxLines="8" />
                    <Label id="verseRef"
                        text="— John 3:16"
                        font="font:SmallBoldSystemFont"
                        color="0x00C9A7FF"
                        translation="[20, 275]" />
                </Group>

                <!-- 3. Section label: Featured Book -->
                <Label text="FEATURED BOOK" font="font:SmallBoldSystemFont" color="0x475569FF" />

                <!-- 4. Featured Book Promotional Card (395 × 220) -->
                <FeaturedBookCard id="featuredBookCard" />
            </LayoutGroup>

            <!-- RIGHT COLUMN: Quick Actions Section -->
            <LayoutGroup layoutDirection="vert" translation="[420, 290]" itemSpacings="[14]">
                <!-- Section label: Quick Actions -->
                <Label text="QUICK ACTIONS" font="font:SmallBoldSystemFont" color="0x475569FF" />

                <!-- Grid of Quick Action Cards (288 × 215 px) -->
                <MarkupGrid id="quickActionsGrid"
                    itemComponentName="QuickActionCard"
                    itemSize="[288, 215]"
                    itemSpacing="[16, 16]"
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
        <Rectangle id="bgRect" width="220" height="44" color="0xFFFFFFFF" />
        <Rectangle id="accentBar" width="4" height="44" color="0x00C9A7FF" visible="false" />
        
        <Poster id="iconPoster" width="20" height="20" translation="[18, 12]" blendColor="0x64748BFF" />
        <Label id="titleLabel" font="font:SmallSystemFont" color="0x64748BFF" translation="[48, 11]" width="160" />
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
        m.titleLabel.font = "font:SmallSystemFont"
        m.iconPoster.blendColor = "0x64748BFF"
    end if
end sub
"""

with open(os.path.join(ROKU_DIR, 'components', 'scenes', 'SidebarNavItem.brs'), 'w', encoding='utf-8') as f:
    f.write(sidebar_item_brs)
print("Updated: components\\scenes\\SidebarNavItem.brs")


# 4. FeaturedBookCard.xml (pure LayoutGroup internal architecture)
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
                <LayoutGroup layoutDirection="horiz" translation="[18, 16]" itemSpacings="[16]">
                    
                    <!-- Left Column (70% width) -->
                    <LayoutGroup layoutDirection="vert" itemSpacings="[4, 4, 10]">
                        <!-- Book Title (SmallBold, allows 2-line wrap) -->
                        <Label id="titleLabel" font="font:SmallBoldSystemFont" color="0x0F172AFF" width="235" wrap="true" maxLines="2" />
                        <!-- Author -->
                        <Label id="authorLabel" font="font:SmallSystemFont" color="0x00C9A7FF" width="235" wrap="true" maxLines="1" />
                        <!-- Description -->
                        <Label id="descLabel" font="font:SmallSystemFont" color="0x475569FF" width="235" wrap="true" maxLines="2" />

                        <!-- Action Button / Badge -->
                        <Group id="actionBadge">
                            <Rectangle id="btnBg" width="115" height="30" color="0xF1F5F9FF" cornerRoundingRadius="6" />
                            <Label id="btnText" text="Learn More →" font="font:SmallBoldSystemFont" color="0x00C9A7FF" translation="[10, 5]" />
                        </Group>
                    </LayoutGroup>

                    <!-- Right Column (30% width) -->
                    <LayoutGroup layoutDirection="vert" itemSpacings="[10]">
                        <!-- Book Cover Poster -->
                        <Poster id="coverPoster" width="95" height="115" loadDisplayMode="scaleToFit" uri="pkg:/images/fallback_artwork.png" />
                        
                        <!-- QR Code Info Area -->
                        <LayoutGroup layoutDirection="horiz" itemSpacings="[8]">
                            <Group>
                                <Rectangle width="30" height="30" color="0xF8FAFCFF" cornerRoundingRadius="6" />
                                <Poster width="24" height="24" uri="pkg:/images/fallback_qr.png" translation="[3, 3]" />
                            </Group>
                            <Label text="Scan" font="font:SmallSystemFont" color="0x64748BFF" translation="[0, 5]" />
                        </LayoutGroup>
                    </LayoutGroup>

                </LayoutGroup>
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


# 5. QuickActionCard.xml
quick_action_xml = """<?xml version="1.0" encoding="utf-8" ?>
<component name="QuickActionCard" extends="Group">
    <interface>
        <field id="itemContent" type="node" onChange="OnContentChange" />
        <field id="itemHasFocus" type="boolean" onChange="OnFocusChange" />
    </interface>
    <script type="text/brightscript" uri="pkg:/components/scenes/QuickActionCard.brs" />
    <children>
        <Group id="scaleContainer" scaleRotateCenter="[144, 107.5]">
            <!-- Border rectangles -->
            <Rectangle id="topAccent" width="288" height="215" color="0x00C9A7FF" cornerRoundingRadius="12" />
            <Rectangle id="sideBorder" width="288" height="212" color="0xE2E8F0FF" translation="[0, 3]" cornerRoundingRadius="12" />
            <Rectangle id="cardBg" width="286" height="210" color="0xFFFFFFFF" translation="[1, 4]" cornerRoundingRadius="11" />
            
            <!-- Icon size 42x42, centered = (288-42)/2 = 123 -->
            <Poster id="iconPoster" width="42" height="42" translation="[123, 28]" blendColor="0xFFFFFFFF" />
            
            <Label id="titleLabel" font="font:SmallBoldSystemFont" color="0x0F172AFF" translation="[0, 88]" width="288" horizAlign="center" />
            <Label id="descLabel" font="font:SmallSystemFont" color="0x64748BFF" translation="[16, 118]" width="256" horizAlign="center" wrap="true" maxLines="2" />
        </Group>

        <Animation id="focusInAnim" duration="0.15" easeFunction="outQuad">
            <Vector2DFieldInterpolator key="[0.0, 1.0]" keyValue="[ [1.0, 1.0], [1.04, 1.04] ]" fieldToInterp="scaleContainer.scale" />
        </Animation>
        
        <Animation id="focusOutAnim" duration="0.15" easeFunction="outQuad">
            <Vector2DFieldInterpolator key="[0.0, 1.0]" keyValue="[ [1.04, 1.04], [1.0, 1.0] ]" fieldToInterp="scaleContainer.scale" />
        </Animation>
    </children>
</component>
"""

with open(os.path.join(ROKU_DIR, 'components', 'scenes', 'QuickActionCard.xml'), 'w', encoding='utf-8') as f:
    f.write(quick_action_xml)
print("Updated: components\\scenes\\QuickActionCard.xml")

print("Reproduce approved mockup script finished.")
