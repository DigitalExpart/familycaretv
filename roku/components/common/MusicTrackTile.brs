sub init()
    m.scaleContainer = m.top.findNode("scaleContainer")
    m.cardBg = m.top.findNode("cardBg")
    m.cardBorder = m.top.findNode("cardBorder")
    m.focusGlow = m.top.findNode("focusGlow")
    m.accentBar = m.top.findNode("accentBar")
    m.icon = m.top.findNode("icon")
    m.titleLabel = m.top.findNode("titleLabel")
    m.metaLabel = m.top.findNode("metaLabel")
    m.focusInAnim = m.top.findNode("focusInAnim")
    m.focusOutAnim = m.top.findNode("focusOutAnim")
end sub

sub OnItemContentChange()
    content = m.top.itemContent
    if content <> invalid
        m.titleLabel.text = content.title
        if content.HDPosterUrl <> invalid and content.HDPosterUrl <> ""
            m.icon.uri = content.HDPosterUrl
        end if
        if content.shortDescriptionLine1 <> invalid and content.shortDescriptionLine1 <> ""
            m.metaLabel.text = content.shortDescriptionLine1
        end if
    end if
end sub

sub OnItemFocusChange()
    if m.top.itemHasFocus
        m.focusGlow.visible = true
        m.cardBg.color = "0xF0FDFBFF"       ' Soft mint focus tint
        m.cardBorder.color = "0x00C9A7FF"   ' Teal border on focus
        m.focusInAnim.control = "start"
    else
        m.focusGlow.visible = false
        m.cardBg.color = "0xFFFFFFFF"       ' White base
        m.cardBorder.color = "0xE2E8F0FF"   ' Subtle slate border
        m.focusOutAnim.control = "start"
    end if
end sub
