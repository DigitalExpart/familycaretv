sub init()
    m.heroSection = m.top.findNode("heroSection")
    m.heroCover = m.top.findNode("heroCover")
    m.heroTitle = m.top.findNode("heroTitle")
    m.heroAuthor = m.top.findNode("heroAuthor")
    m.heroDesc = m.top.findNode("heroDesc")
    m.heroQR = m.top.findNode("heroQR")
    
    m.bookList = m.top.findNode("bookList")
    
    m.fetchTask = m.top.findNode("fetchTask")
    m.fetchTask.observeField("response", "onDataReceived")
    
    m.top.observeField("visible", "onVisibleChange")
end sub

sub onVisibleChange()
    if m.top.visible = true
        m.fetchTask.request = { endpoint: "/books", method: "GET" }
        m.fetchTask.control = "RUN"
        m.bookList.setFocus(true)
    end if
end sub

sub onDataReceived()
    res = m.fetchTask.response
    if res <> invalid and res.statusCode = 200 and res.data <> invalid
        books = res.data
        if type(books) = "roArray" and books.count() > 0
            ' 1. Hero Section (Book of the Day)
            heroBook = books[0]
            m.heroTitle.text = heroBook.title
            if heroBook.author <> invalid then m.heroAuthor.text = "By " + heroBook.author
            if heroBook.description <> invalid then m.heroDesc.text = heroBook.description
            
            coverUri = "pkg:/images/fallback_artwork.png"
            if heroBook.coverUrl <> invalid and heroBook.coverUrl <> "" then coverUri = heroBook.coverUrl
            m.heroCover.uri = coverUri
            
            ' If backend provides a specific qr code or store URL, we'd use it here.
            ' Defaulting to fallback if none provided.
            if heroBook.qrCodeUrl <> invalid and heroBook.qrCodeUrl <> ""
                m.heroQR.uri = heroBook.qrCodeUrl
            end if
            
            m.heroSection.visible = true
            
            ' 2. Rows
            content = CreateObject("roSGNode", "ContentNode")
            
            featuredEvents = []
            recentEvents = []
            allEvents = []
            
            for i = 1 to books.count() - 1
                b = books[i]
                cUri = "pkg:/images/fallback_artwork.png"
                if b.coverUrl <> invalid and b.coverUrl <> "" then cUri = b.coverUrl
                
                itemData = {
                    title: b.title,
                    description: b.author,
                    HDPosterUrl: cUri
                }
                
                allEvents.push(itemData)
                if i <= 3
                    featuredEvents.push(itemData)
                else if i <= 6
                    recentEvents.push(itemData)
                end if
            end for
            
            content.appendChild(createRow("Featured Books", featuredEvents))
            content.appendChild(createRow("Recently Added", recentEvents))
            content.appendChild(createRow("Browse All Books", allEvents))
            
            m.bookList.content = content
        end if
    end if
end sub

function createRow(title as String, items as Object) as Object
    row = CreateObject("roSGNode", "ContentNode")
    row.title = title
    if items <> invalid
        for each item in items
            itemNode = CreateObject("roSGNode", "ContentNode")
            itemNode.title = item.title
            if itemNode.title = invalid then itemNode.title = "Book"
            itemNode.description = item.description
            if itemNode.description = invalid then itemNode.description = "Author"
            itemNode.HDPosterUrl = item.HDPosterUrl
            row.appendChild(itemNode)
        end for
    end if
    return row
end function

function onKeyEvent(key as String, press as Boolean) as Boolean
    handled = false
    if press then
        if key = "up"
            ' Custom focus logic if needed to focus the hero section's QR code or similar,
            ' but since there are no buttons in the hero section, bookList can retain focus.
        end if
    end if
    return handled
end function
