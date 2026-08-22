sub init()
    m.scaleContainer = m.top.findNode("scaleContainer")
    m.cardBg = m.top.findNode("cardBg")
    m.cardFocusedBg = m.top.findNode("cardFocusedBg")
    m.topAccent = m.top.findNode("topAccent")
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
        end if
    end if
end sub

sub OnFocusChange()
    if m.top.itemHasFocus
        m.cardFocusedBg.visible = true
        m.cardBg.visible = false
        m.focusInAnim.control = "start"
    else
        m.cardFocusedBg.visible = false
        m.cardBg.visible = true
        m.focusOutAnim.control = "start"
    end if
end sub
