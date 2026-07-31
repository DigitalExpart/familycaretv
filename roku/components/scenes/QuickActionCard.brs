sub init()
    m.scaleContainer = m.top.findNode("scaleContainer")
    m.cardBg = m.top.findNode("cardBg")
    m.topAccent = m.top.findNode("topAccent")
    m.glowRing = m.top.findNode("glowRing")
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
        
        ' Optionally, store a color string in description2
        if content.shortDescriptionLine2 <> invalid and content.shortDescriptionLine2 <> ""
            m.topAccent.color = content.shortDescriptionLine2
            m.glowRing.color = content.shortDescriptionLine2
        end if
    end if
end sub

sub OnFocusChange()
    if m.top.itemHasFocus
        m.glowRing.visible = true
        m.cardBg.color = "0x1E2D40FF" ' Hover bg
        m.focusInAnim.control = "start"
    else
        m.glowRing.visible = false
        m.cardBg.color = "0x111827FF" ' Normal bg
        m.focusOutAnim.control = "start"
    end if
end sub
