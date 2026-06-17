sub init()
    m.background = m.top.findNode("background")
    m.icon = m.top.findNode("icon")
    m.titleLabel = m.top.findNode("titleLabel")
    m.focusAnimation = m.top.findNode("focusAnimation")
    m.scaleInterp = m.top.findNode("scaleInterp")
    m.colorInterp = m.top.findNode("colorInterp")
    
    m.top.observeField("title", "OnTitleChange")
    m.top.observeField("iconUri", "OnIconChange")
end sub

sub OnTitleChange()
    m.titleLabel.text = m.top.title
end sub

sub OnIconChange()
    m.icon.uri = m.top.iconUri
end sub

sub onFocusChange()
    if m.top.hasFocus()
        m.scaleInterp.keyValue = [ [1.0, 1.0], [1.05, 1.05] ]
        m.colorInterp.keyValue = [ 0x2C2C35FF, 0x4B4B6FFF ] ' Indigo Accent on focus
    else
        m.scaleInterp.keyValue = [ [1.05, 1.05], [1.0, 1.0] ]
        m.colorInterp.keyValue = [ 0x4B4B6FFF, 0x2C2C35FF ]
    end if
    m.focusAnimation.control = "start"
end sub

function onKeyEvent(key as String, press as Boolean) as Boolean
    handled = false
    if press
        if key = "OK"
            m.top.itemSelected = true
            handled = true
        end if
    end if
    return handled
end function
