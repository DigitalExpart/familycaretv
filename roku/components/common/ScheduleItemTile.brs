sub init()
    m.focusGlow = m.top.findNode("focusGlow")
    m.cardBorder = m.top.findNode("cardBorder")
    m.cardBg = m.top.findNode("cardBg")
    m.accentBar = m.top.findNode("accentBar")
    m.typeBg = m.top.findNode("typeBg")
    m.typeLabel = m.top.findNode("typeLabel")
    m.timeLabel = m.top.findNode("timeLabel")
    m.titleLabel = m.top.findNode("titleLabel")
end sub

sub OnItemContentChange()
    content = m.top.itemContent
    if content <> invalid
        m.titleLabel.text = content.title
        m.timeLabel.text = content.shortDescriptionLine1

        itemType = "EVENT"
        if content.shortDescriptionLine2 <> invalid and content.shortDescriptionLine2 <> ""
            itemType = UCase(content.shortDescriptionLine2)
        end if

        if itemType = "APPOINTMENT"
            accentColor = "0x8B5CF6FF"
            bgColor = "0x8B5CF620"
            labelText = "APPOINTMENT"
        else if itemType = "MEDICATION" or itemType = "PET_MEDICATION"
            accentColor = "0xF59E0BFF"
            bgColor = "0xF59E0B20"
            labelText = "MEDICATION"
        else if itemType = "TASK" or itemType = "KIDS_TASK"
            accentColor = "0x00C9A7FF"
            bgColor = "0x00C9A720"
            labelText = "TASK"
        else
            accentColor = "0x3B82F6FF"
            bgColor = "0x3B82F620"
            labelText = itemType
        end if

        m.accentBar.color = accentColor
        m.typeBg.color = bgColor
        m.typeLabel.color = accentColor
        m.typeLabel.text = labelText
    end if
end sub

sub OnFocusChange()
    if m.top.focusPercent > 0.5
        m.focusGlow.visible = true
        m.cardBg.color = "0xF0FDFBFF"
    else
        m.focusGlow.visible = false
        m.cardBg.color = "0xFFFFFFFF"
    end if
end sub
