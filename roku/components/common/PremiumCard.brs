sub init()
    m.background = m.top.findNode("background")
    m.icon = m.top.findNode("icon")
    m.titleLabel = m.top.findNode("titleLabel")
    m.focusAnimation = m.top.findNode("focusAnimation")
    m.scaleInterp = m.top.findNode("scaleInterp")
    m.colorInterp = m.top.findNode("colorInterp")
end sub

sub OnItemContentChange()
    if m.top.itemContent <> invalid
        m.titleLabel.text = m.top.itemContent.title
        m.icon.uri = m.top.itemContent.HDPosterUrl
    end if
end sub

sub OnItemFocusChange()
    if m.top.itemHasFocus
        m.scaleInterp.keyValue = [ [1.0, 1.0], [1.05, 1.05] ]
        m.colorInterp.keyValue = [ 0x2C2C35FF, 0x4B4B6FFF ] ' Indigo Accent on focus
    else
        m.scaleInterp.keyValue = [ [1.05, 1.05], [1.0, 1.0] ]
        m.colorInterp.keyValue = [ 0x4B4B6FFF, 0x2C2C35FF ]
    end if
    m.focusAnimation.control = "start"
end sub
