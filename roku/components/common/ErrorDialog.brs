sub init()
    m.overlay = m.top.findNode("overlay")
    m.dialogBox = m.top.findNode("dialogBox")
    m.messageLabel = m.top.findNode("messageLabel")
    
    m.top.observeField("message", "OnMessageChange")
    m.top.observeField("show", "OnShowChange")
end sub

sub OnMessageChange()
    m.messageLabel.text = m.top.message
end sub

sub OnShowChange()
    m.overlay.visible = m.top.show
    m.dialogBox.visible = m.top.show
    if m.top.show
        m.top.setFocus(true)
    end if
end sub

function onKeyEvent(key as String, press as Boolean) as Boolean
    handled = false
    if press and m.top.show
        if key = "OK" or key = "back"
            m.top.show = false
            m.top.dismissed = true
            handled = true
        else
            ' Consume all other keys when dialog is open
            handled = true
        end if
    end if
    return handled
end function
