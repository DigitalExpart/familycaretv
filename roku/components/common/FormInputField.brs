sub init()
    m.fieldLabel = m.top.findNode("fieldLabel")
    m.valueLabel = m.top.findNode("valueLabel")
    m.boxBg = m.top.findNode("boxBg")
    m.borderLine = m.top.findNode("borderLine")
    m.focusGlow = m.top.findNode("focusGlow")
end sub

sub OnDataChange()
    m.fieldLabel.text = m.top.label
    if m.top.value <> invalid and m.top.value <> ""
        m.valueLabel.text = m.top.value
        m.valueLabel.color = "0x1A1A2EFF" ' High contrast dark text
    else
        m.valueLabel.text = m.top.placeholder
        m.valueLabel.color = "0x8E8EA0FF" ' Muted placeholder
    end if
end sub

sub OnFocusChange()
    if m.top.isFocused
        m.focusGlow.visible = true
        m.boxBg.color = "0xFFFFFFFF"
        m.borderLine.color = "0x00A89DFF"
        m.borderLine.height = 3
    else
        m.focusGlow.visible = false
        m.boxBg.color = "0xF5F7FAFF"
        m.borderLine.color = "0xE0E3E8FF"
        m.borderLine.height = 2
    end if
end sub

function onKeyEvent(key as String, press as Boolean) as Boolean
    handled = false
    if press
        if key = "OK"
            m.top.clicked = true
            handled = true
        end if
    end if
    return handled
end function
