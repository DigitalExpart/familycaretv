sub init()
    m.scaleContainer = m.top.findNode("scaleContainer")
    m.cardBg = m.top.findNode("cardBg")
    m.topAccent = m.top.findNode("topAccent")
    m.focusBorder = m.top.findNode("focusBorder")
    m.iconPoster = m.top.findNode("iconPoster")
    m.titleLabel = m.top.findNode("titleLabel")
    m.descLabel = m.top.findNode("descLabel")
    m.focusInAnim = m.top.findNode("focusInAnim")
    m.focusOutAnim = m.top.findNode("focusOutAnim")
end sub

sub OnContentChange()
    content = m.top.itemContent
    if content <> invalid
        m.titleLabel.text = content.title
        m.descLabel.text = content.shortDescriptionLine1
        m.iconPoster.uri = content.HDPosterUrl
        
        if content.shortDescriptionLine2 <> invalid and content.shortDescriptionLine2 <> ""
            m.topAccent.color = content.shortDescriptionLine2
            m.iconPoster.blendColor = content.shortDescriptionLine2
            m.focusBorder.color = content.shortDescriptionLine2
        end if
    end if
end sub

sub OnFocusChange()
    if m.top.itemHasFocus
        m.focusBorder.visible = true
        m.cardBg.color = "0x1A2535FF"
        m.focusInAnim.control = "start"
    else
        m.focusBorder.visible = false
        m.cardBg.color = "0x0C0C13FF"
        m.focusOutAnim.control = "start"
    end if
end sub
