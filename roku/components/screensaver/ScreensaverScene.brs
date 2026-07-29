sub init()
    m.clockText = m.top.findNode("clockText")
    m.dateText = m.top.findNode("dateText")

    m.verseText = m.top.findNode("verseText")
    m.verseRef = m.top.findNode("verseRef")

    m.drawingPoster = m.top.findNode("drawingPoster")
    m.drawingThought = m.top.findNode("drawingThought")

    m.qrCode = m.top.findNode("qrCode")
    m.notificationTicker = m.top.findNode("notificationTicker")

    m.screensaverTask = m.top.findNode("screensaverTask")
    m.screensaverTask.observeField("response", "onDataReceived")

    m.clockTimer = m.top.findNode("clockTimer")
    m.clockTimer.observeField("fire", "updateClock")

    updateClock()

    m.screensaverTask.request = { endpoint: "/roku/dashboard", method: "GET" }
    m.screensaverTask.control = "RUN"
end sub

sub updateClock()
    now = CreateObject("roDateTime")
    now.ToLocalTime()
    m.clockText.text = GetFormattedTime()
    m.dateText.text = now.AsDateString("short-month-short-weekday")
end sub

sub onDataReceived()
    res = m.screensaverTask.response
    if res <> invalid and res.code = 200 and res.data <> invalid
        data = res.data

        ' QR Code
        if data.qrCodeUrl <> invalid and data.qrCodeUrl <> ""
            m.qrCode.uri = data.qrCodeUrl
        end if

        ' Verse of the Day
        if data.verse <> invalid
            m.verseText.text = Chr(34) + data.verse.text + Chr(34)
            m.verseRef.text = "- " + data.verse.reference
        else if data.verseOfTheDay <> invalid and data.verseOfTheDay.verse <> invalid
            m.verseText.text = Chr(34) + data.verseOfTheDay.verse + Chr(34)
            m.verseRef.text = "- " + data.verseOfTheDay.reference
        end if

        ' Drawing of the Day
        if data.drawingUrl <> invalid and data.drawingUrl <> ""
            m.drawingPoster.uri = data.drawingUrl
        else if data.drawing <> invalid and data.drawing.imageUrl <> invalid
            m.drawingPoster.uri = data.drawing.imageUrl
        end if

        if data.drawingThought <> invalid and data.drawingThought <> ""
            m.drawingThought.text = Chr(34) + data.drawingThought + Chr(34)
        end if

        ' Notifications & Reminders Ticker
        reminders = []
        if data.reminders <> invalid
            for each r in data.reminders
                if r.title <> invalid
                    reminders.push(r.title)
                end if
            end for
        end if

        if data.medications <> invalid
            for each mItem in data.medications
                if mItem.name <> invalid
                    reminders.push("Medication Due: " + mItem.name)
                end if
            end for
        end if

        if m.notificationTicker <> invalid
            m.notificationTicker.callFunc("setNotifications", reminders)
        end if
    end if
end sub

function onKeyEvent(key as String, press as Boolean) as Boolean
    ' Any key press exits screensaver
    if press
        m.top.closeRequest = true
        return true
    end if
    return false
end function
