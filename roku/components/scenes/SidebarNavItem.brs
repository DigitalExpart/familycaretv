sub init()
    m.bgRect = m.top.findNode("bgRect")
    m.highlightPoster = m.top.findNode("highlightPoster")
    m.accentBar = m.top.findNode("accentBar")
    m.iconPoster = m.top.findNode("iconPoster")
    m.titleLabel = m.top.findNode("titleLabel")
end sub

sub OnContentChange()
    content = m.top.itemContent
    if content <> invalid
        m.titleLabel.text = content.title
        m.iconPoster.uri = content.HDPosterUrl
        OnFocusChange()
    end if
end sub

sub OnFocusChange()
    content = m.top.itemContent
    isActiveNode = false
    if content <> invalid and content.hasField("isActive")
        isActiveNode = content.isActive
    end if

    if m.top.itemHasFocus or isActiveNode
        m.highlightPoster.visible = true
        m.accentBar.visible = true
        m.titleLabel.color = "0x0F172AFF"
        m.titleLabel.font = "font:SmallestBoldSystemFont"
        m.iconPoster.blendColor = "0x00C9A7FF"
    else
        m.highlightPoster.visible = false
        m.accentBar.visible = false
        m.titleLabel.color = "0x64748BFF"
        m.titleLabel.font = "font:SmallestSystemFont"
        m.iconPoster.blendColor = "0x64748BFF"
    end if
end sub
