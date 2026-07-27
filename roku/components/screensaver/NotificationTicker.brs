sub init()
end sub
function setNotifications(notifications as Object)
    if notifications <> invalid and notifications.count() > 0
        text = "" 
        for each n in notifications
            text += n + "   •   " 
        end for
        m.top.findNode("tickerText").text = text
    else
        m.top.findNode("tickerText").text = "FamilyCare TV • Health • Wellness • Family"
    end if
    
    ' Start scrolling
    m.top.findNode("scrollAnim").control = "start"
end function

function setMessages(messages as Object)
    setNotifications(messages)
end function
