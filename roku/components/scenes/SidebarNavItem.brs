sub init()
    m.bgRect = m.top.findNode("bgRect")
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
        m.bgRect.color = "0x00C9A720"
        m.titleLabel.color = "0x00C9A7FF"
        m.iconPoster.blendColor = "0x00C9A7FF"
    else
        m.bgRect.color = "0x0D1220FF"
        m.titleLabel.color = "0x6B7280FF"
        m.iconPoster.blendColor = "0x6B7280FF"
    end if
end sub
