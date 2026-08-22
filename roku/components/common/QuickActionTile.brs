sub init()
    m.scaleContainer = m.top.findNode("scaleContainer")
    m.cardBg = m.top.findNode("cardBg")
    m.cardBorder = m.top.findNode("cardBorder")
    m.focusGlow = m.top.findNode("focusGlow")
    m.accentBar = m.top.findNode("accentBar")
    m.icon = m.top.findNode("icon")
    m.titleLabel = m.top.findNode("titleLabel")
    m.descLabel = m.top.findNode("descLabel")
    m.focusInAnim = m.top.findNode("focusInAnim")
    m.focusOutAnim = m.top.findNode("focusOutAnim")
end sub

sub OnItemContentChange()
    content = m.top.itemContent
    if content <> invalid
        m.titleLabel.text = content.title
        m.icon.uri = content.HDPosterUrl

        ' Set subtitle from shortDescriptionLine1
        desc = content.shortDescriptionLine1
        if desc <> invalid and desc <> ""
            m.descLabel.text = desc
        end if

        ' Assign accent color per category
        title = content.title
        if title = "Patients"
            m.accentBar.color = "0x00C9A7FF"
        else if title = "Calendar"
            m.accentBar.color = "0x42A5F5FF"
        else if title = "Medications"
            m.accentBar.color = "0xFFA726FF"
        else if title = "Music"
            m.accentBar.color = "0xFF6B6BFF"
        else if title = "Kids"
            m.accentBar.color = "0x7E57C2FF"
        else if title = "Pets"
            m.accentBar.color = "0x66BB6AFF"
        else if title = "Notes"
            m.accentBar.color = "0x008F86FF"
        else if title = "Settings"
            m.accentBar.color = "0x64748BFF"
        end if
    end if
end sub

sub OnItemFocusChange()
    if m.top.itemHasFocus
        m.focusGlow.visible = true
        m.cardBg.color = "0xF0FDFBFF"       ' Soft mint tint on focus
        m.cardBorder.color = "0x00C9A7FF"   ' Teal border on focus
        m.focusInAnim.control = "start"
    else
        m.focusGlow.visible = false
        m.cardBg.color = "0xFFFFFFFF"       ' White base
        m.cardBorder.color = "0xE2E8F0FF"   ' Subtle gray border
        m.focusOutAnim.control = "start"
    end if
end sub
