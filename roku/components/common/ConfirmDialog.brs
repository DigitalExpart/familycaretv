sub init()
    m.titleLabel = m.top.findNode("titleLabel")
    m.messageLabel = m.top.findNode("messageLabel")
    m.confirmLabel = m.top.findNode("confirmLabel")
    m.cancelLabel = m.top.findNode("cancelLabel")

    m.confirmBg = m.top.findNode("confirmBg")
    m.cancelBg = m.top.findNode("cancelBg")
    m.confirmFocusBorder = m.top.findNode("confirmFocusBorder")
    m.cancelFocusBorder = m.top.findNode("cancelFocusBorder")

    ' 0 = Confirm (Yes), 1 = Cancel
    m.focusedButton = 1
    m.top.visible = false
end sub

sub OnTextChange()
    m.titleLabel.text = m.top.title
    m.messageLabel.text = m.top.message
    m.confirmLabel.text = m.top.confirmText
    m.cancelLabel.text = m.top.cancelText
end sub

sub OnShowChange()
    m.top.visible = m.top.show
    if m.top.show
        m.focusedButton = 1 ' Default focus to Cancel for safety
        UpdateFocus()
        m.top.setFocus(true)
    end if
end sub

sub UpdateFocus()
    m.confirmFocusBorder.visible = (m.focusedButton = 0)
    m.cancelFocusBorder.visible = (m.focusedButton = 1)
end sub

function onKeyEvent(key as String, press as Boolean) as Boolean
    handled = false
    if press and m.top.visible
        if key = "left" or key = "right"
            if m.focusedButton = 0
                m.focusedButton = 1
            else
                m.focusedButton = 0
            end if
            UpdateFocus()
            handled = true
        else if key = "OK"
            m.top.show = false
            if m.focusedButton = 0
                m.top.confirmed = true
            else
                m.top.cancelled = true
            end if
            handled = true
        else if key = "back"
            m.top.show = false
            m.top.cancelled = true
            handled = true
        end if
    end if
    return handled
end function
