sub init()
    m.screensaverTask = m.top.findNode("screensaverTask")
    m.screensaverTask.observeField("response", "onData")
    m.screensaverTask.request = { endpoint: "/roku/screensaver", method: "GET" }
    m.screensaverTask.control = "RUN"
    
    m.clockText = m.top.findNode("clockText")
    m.dateText = m.top.findNode("dateText")
    m.clockTimer = m.top.findNode("clockTimer")
    m.clockTimer.observeField("fire", "updateClock")
    updateClock()
end sub

sub updateClock()
    now = CreateObject("roDateTime")
    now.ToLocalTime()
    
    hr = now.GetHours()
    ampm = "AM"
    if hr >= 12
        ampm = "PM"
        if hr > 12 then hr = hr - 12
    end if
    if hr = 0 then hr = 12
    
    mn = now.GetMinutes().toStr()
    if Len(mn) = 1 then mn = "0" + mn
    
    m.clockText.text = hr.toStr() + ":" + mn + " " + ampm
    m.dateText.text = now.AsDateString("LongDate")
end sub

sub onData()
    res = m.screensaverTask.response
    if res <> invalid and res.statusCode = 200 and res.data <> invalid
        m.top.findNode("bouncingVerse").callFunc("setData", res.data)
        m.top.findNode("notificationTicker").callFunc("setNotifications", res.data.tickerMessages)
        
        if res.data.qrCodeUrl <> invalid
            ' For MVP, just use a generic QR code placeholder representing the URL
            m.top.findNode("qrCode").uri = "pkg:/images/placeholder_qr.jpg"
        end if
    end if
end sub
