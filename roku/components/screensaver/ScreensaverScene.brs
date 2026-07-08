sub init()
    m.clockText = m.top.findNode("clockText")
    m.dateText = m.top.findNode("dateText")
    
    m.verseText = m.top.findNode("verseText")
    m.verseRef = m.top.findNode("verseRef")
    
    m.bookCover = m.top.findNode("bookCover")
    m.bookTitle = m.top.findNode("bookTitle")
    m.bookAuthor = m.top.findNode("bookAuthor")
    
    m.qrCode = m.top.findNode("qrCode")
    m.notificationTicker = m.top.findNode("notificationTicker")
    
    m.screensaverTask = m.top.findNode("screensaverTask")
    m.screensaverTask.observeField("response", "onDataReceived")
    
    m.clockTimer = m.top.findNode("clockTimer")
    m.clockTimer.observeField("fire", "updateClock")
    
    ' Initial clock update
    updateClock()
    
    ' Fetch screensaver payload
    m.screensaverTask.request = { endpoint: "/roku/screensaver", method: "GET" }
    m.screensaverTask.control = "RUN"
end sub

sub updateClock()
    now = CreateObject("roDateTime")
    now.ToLocalTime()
    m.clockText.text = now.AsTimeString("short-hms")
    m.dateText.text = now.AsDateString("LongDate")
end sub

sub onDataReceived()
    res = m.screensaverTask.response
    if res <> invalid and res.statusCode = 200 and res.data <> invalid
        data = res.data
        
        ' Update QR Code
        qrUrl = "pkg:/images/fallback_qr.png"
        if data.qrCodeUrl <> invalid and data.qrCodeUrl <> ""
            qrUrl = data.qrCodeUrl
        end if
        m.qrCode.uri = qrUrl
        
        ' Note: /roku/screensaver might not return all these fields natively yet, 
        ' but based on the plan it should. The backend was augmented.
        if data.verse <> invalid
            m.verseText.text = chr(34) + data.verse.text + chr(34)
            m.verseRef.text = data.verse.reference
        else if data.verseOfTheDay <> invalid ' fallback to home structure
            m.verseText.text = chr(34) + data.verseOfTheDay.verse + chr(34)
            m.verseRef.text = data.verseOfTheDay.reference
        end if
        
        ' Book of the Day
        if data.featuredBook <> invalid
            b = data.featuredBook
            m.bookTitle.text = b.title
            m.bookAuthor.text = b.author
            cUri = "pkg:/images/fallback_artwork.png"
            if b.coverUrl <> invalid and b.coverUrl <> "" then cUri = b.coverUrl
            m.bookCover.uri = cUri
        else if data.books <> invalid and data.books.count() > 0
            b = data.books[0]
            m.bookTitle.text = b.title
            m.bookAuthor.text = b.author
            cUri = "pkg:/images/fallback_artwork.png"
            if b.coverUrl <> invalid and b.coverUrl <> "" then cUri = b.coverUrl
            m.bookCover.uri = cUri
        end if
        
        ' Notifications Ticker
        ' The ticker expects an array of strings or nodes. Assuming it exposes an interface for this.
        if data.reminders <> invalid and m.notificationTicker <> invalid
            messages = []
            for each r in data.reminders
                messages.push(r.title)
            end for
            m.notificationTicker.callFunc("setMessages", messages)
        end if
    end if
end sub
