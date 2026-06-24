sub init()
    m.titleLabel = m.top.findNode("titleLabel")
    m.messageLabel = m.top.findNode("messageLabel")
    m.priorityBar = m.top.findNode("priorityBar")
    m.slideIn = m.top.findNode("slideIn")
    m.slideOut = m.top.findNode("slideOut")
    m.dismissTimer = m.top.findNode("dismissTimer")
    
    m.dismissTimer.observeField("fire", "hideBanner")
end sub

sub showBanner()
    if m.top.notification <> invalid
        notif = m.top.notification
        m.titleLabel.text = notif.title
        m.messageLabel.text = notif.message
        
        ' Set Priority Color based on Notification Type
        colorStr = "0x00FF00" ' Default Green
        if notif.type = "EMERGENCY"
            colorStr = "0xFF0000" ' Red
        else if notif.type = "MEDICATION" or notif.type = "MEDICATION_REMINDER"
            colorStr = "0xFFA500" ' Orange
        else if notif.type = "APPOINTMENT" or notif.type = "APPOINTMENT_REMINDER"
            colorStr = "0x0000FF" ' Blue
        end if
        
        m.priorityBar.color = colorStr
        
        m.top.visible = true
        m.slideIn.control = "start"
        m.dismissTimer.control = "start"
    end if
end sub

sub hideBanner()
    m.slideOut.observeField("state", "onSlideOutState")
    m.slideOut.control = "start"
end sub

sub onSlideOutState()
    if m.slideOut.state = "stopped"
        m.top.visible = false
        m.slideOut.unobserveField("state")
    end if
end sub
