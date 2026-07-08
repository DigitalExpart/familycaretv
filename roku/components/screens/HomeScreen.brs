sub init()
    m.welcomeText = m.top.findNode("welcomeText")
    m.dateText = m.top.findNode("dateText")
    m.verseText = m.top.findNode("verseText")
    m.verseRef = m.top.findNode("verseRef")
    m.dashboardList = m.top.findNode("dashboardList")
    
    m.fetchDashboardTask = m.top.findNode("fetchDashboardTask")
    m.fetchDashboardTask.observeField("response", "onDashboardDataReceived")
    
    m.dashboardList.observeField("itemSelected", "onItemSelected")
    
    m.top.observeField("visible", "onVisibleChange")
end sub

sub onVisibleChange()
    if m.top.visible = true
        loadDashboard()
        m.dashboardList.setFocus(true)
    end if
end sub

sub loadDashboard()
    m.fetchDashboardTask.request = {
        endpoint: "/roku/home",
        method: "GET"
    }
    m.fetchDashboardTask.control = "RUN"
end sub

sub onDashboardDataReceived()
    res = m.fetchDashboardTask.response
    if res <> invalid and res.statusCode = 200 and res.data <> invalid
        data = res.data
        
        if data.user <> invalid
            m.welcomeText.text = "Good Morning, " + data.user.firstName
        end if
        
        now = CreateObject("roDateTime")
        now.ToLocalTime()
        m.dateText.text = now.AsDateString("LongDate")
        
        if data.verseOfTheDay <> invalid
            m.verseText.text = chr(34) + data.verseOfTheDay.verse + chr(34)
            m.verseRef.text = data.verseOfTheDay.reference
        end if
        
        ' Process Reminders for Today's Summary
        medCount = 0
        apptCount = 0
        taskCount = 0
        homeworkCount = 0
        petCount = 0
        
        if data.reminders <> invalid
            for each r in data.reminders
                if r.type = "MEDICATION" then medCount++
                if r.type = "APPOINTMENT" then apptCount++
                if r.type = "TASK" then taskCount++
                if r.type = "HOMEWORK" or r.type = "KIDS_TASK" then homeworkCount++
                if r.type = "PET_REMINDER" or r.type = "PET_VACCINATION" or r.type = "PET_MEDICATION" then petCount++
            end for
        end if
        
        summaryItems = []
        summaryItems.push({ title: medCount.ToStr() + " Medications Due", description: "Today", HDPosterUrl: "pkg:/images/fallback_artwork.png" })
        summaryItems.push({ title: apptCount.ToStr() + " Appointments", description: "Today", HDPosterUrl: "pkg:/images/fallback_artwork.png" })
        summaryItems.push({ title: taskCount.ToStr() + " Tasks", description: "Today", HDPosterUrl: "pkg:/images/fallback_artwork.png" })
        summaryItems.push({ title: homeworkCount.ToStr() + " Homework", description: "Today", HDPosterUrl: "pkg:/images/fallback_artwork.png" })
        summaryItems.push({ title: petCount.ToStr() + " Pet Reminders", description: "Today", HDPosterUrl: "pkg:/images/fallback_artwork.png" })
        
        content = CreateObject("roSGNode", "ContentNode")
        content.appendChild(createRow("Today's Summary", summaryItems))
        
        ' Book of the Day / Featured Book
        bookItems = []
        if data.books <> invalid and data.books.count() > 0
            b = data.books[0]
            bookCover = "pkg:/images/fallback_artwork.png"
            if b.coverUrl <> invalid and b.coverUrl <> "" then bookCover = b.coverUrl
            bookItems.push({ 
                title: b.title, 
                description: b.author, 
                HDPosterUrl: bookCover,
                action: "OPEN_BOOKS"
            })
        end if
        content.appendChild(createRow("Featured Book", bookItems))
        
        ' Notifications
        notifItems = []
        if data.notifications <> invalid
            for each n in data.notifications
                notifItems.push({ title: n.title, description: n.message, HDPosterUrl: "pkg:/images/fallback_artwork.png" })
            end for
        end if
        content.appendChild(createRow("Recent Notifications", notifItems))
        
        m.dashboardList.content = content
    end if
end sub

function createRow(title as String, items as Object) as Object
    row = CreateObject("roSGNode", "ContentNode")
    row.title = title
    if items <> invalid
        for each item in items
            itemNode = CreateObject("roSGNode", "ContentNode")
            itemNode.title = item.title
            itemNode.description = item.description
            itemNode.HDPosterUrl = item.HDPosterUrl
            if item.action <> invalid
                itemNode.Categories = item.action ' Storing action in Categories field as a workaround to pass string
            end if
            row.appendChild(itemNode)
        end for
    end if
    return row
end function

sub onItemSelected()
    row = m.dashboardList.rowItemSelected[0]
    col = m.dashboardList.rowItemSelected[1]
    
    item = m.dashboardList.content.getChild(row).getChild(col)
    if item <> invalid and item.Categories = "OPEN_BOOKS"
        ' Deep link to BooksScreen by firing an event up to MainScene
        m.top.getScene().nextScreen = "BooksScreen"
    end if
end sub
