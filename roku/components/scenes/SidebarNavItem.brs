sub init()
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
    end if
end sub

sub OnFocusChange()
    if m.top.itemHasFocus
        m.bgRect.color = "0x061410FF"
        m.accentBar.visible = true
        m.titleLabel.color = "0xFFFFFFFF"
        m.titleLabel.font = "font:MediumBoldSystemFont"
        m.iconPoster.blendColor = "0x00C9A7FF"
    else
        m.bgRect.color = "0x040408FF"
        m.accentBar.visible = false
        m.titleLabel.color = "0x475569FF"
        m.titleLabel.font = "font:MediumSystemFont"
        m.iconPoster.blendColor = "0x475569FF"
    end if
end sub
