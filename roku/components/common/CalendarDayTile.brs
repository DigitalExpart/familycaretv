sub init()
    m.cardBg = m.top.findNode("cardBg")
    m.cardBorder = m.top.findNode("cardBorder")
    m.focusGlow = m.top.findNode("focusGlow")
    m.dayLabel = m.top.findNode("dayLabel")
    m.eventsGroup = m.top.findNode("eventsGroup")
    m.eventsLabel = m.top.findNode("eventsLabel")
end sub

sub OnItemContentChange()
    content = m.top.itemContent
    if content <> invalid
        m.dayLabel.text = content.title
        
        if content.shortDescriptionLine1 = "dimmed"
            m.cardBg.color = "0xF0F2F5FF"
            m.cardBorder.color = "0xE2E8F0FF"
            m.dayLabel.color = "0x94A3B8FF"
        else
            m.cardBg.color = "0xFFFFFFFF"
            m.cardBorder.color = "0xE2E8F0FF"
            m.dayLabel.color = "0x0F172AFF"
        end if
        
        if content.shortDescriptionLine2 <> invalid and content.shortDescriptionLine2 <> ""
            m.eventsLabel.text = content.shortDescriptionLine2
            m.eventsGroup.visible = true
        else
            m.eventsGroup.visible = false
        end if
    end if
end sub

sub OnFocusChange()
    if m.top.focusPercent > 0.5
        m.focusGlow.visible = true
        m.cardBg.color = "0xF0FDFBFF"
    else
        m.focusGlow.visible = false
        content = m.top.itemContent
        if content <> invalid and content.shortDescriptionLine1 = "dimmed"
            m.cardBg.color = "0xF0F2F5FF"
        else
            m.cardBg.color = "0xFFFFFFFF"
        end if
    end if
end sub
