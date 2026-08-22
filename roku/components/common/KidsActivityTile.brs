sub init()
    m.scaleContainer = m.top.findNode("scaleContainer")
    m.cardBg = m.top.findNode("cardBg")
    m.cardBorder = m.top.findNode("cardBorder")
    m.focusGlow = m.top.findNode("focusGlow")
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
        if content.HDPosterUrl <> invalid and content.HDPosterUrl <> ""
            m.icon.uri = content.HDPosterUrl
        end if
        if content.shortDescriptionLine1 <> invalid and content.shortDescriptionLine1 <> ""
            m.descLabel.text = content.shortDescriptionLine1
        end if
    end if
end sub

sub OnItemFocusChange()
    if m.top.itemHasFocus
        m.focusGlow.visible = true
        m.cardBg.color = "0xF5F3FFFF"       ' Soft lavender focus tint
        m.cardBorder.color = "0x7E57C2FF"   ' Purple border on focus
        m.focusInAnim.control = "start"
    else
        m.focusGlow.visible = false
        m.cardBg.color = "0xFFFFFFFF"       ' White base
        m.cardBorder.color = "0xE2E8F0FF"   ' Subtle slate border
        m.focusOutAnim.control = "start"
    end if
end sub
