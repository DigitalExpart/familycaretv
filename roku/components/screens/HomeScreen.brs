sub init()
    m.welcomeText = m.top.findNode("welcomeText")
    m.dateText = m.top.findNode("dateText")
    m.verseText = m.top.findNode("verseText")
    m.verseRef = m.top.findNode("verseRef")
    m.drawingPoster = m.top.findNode("drawingPoster")
    m.dashboardList = m.top.findNode("dashboardList")
    
    m.fetchDashboardTask = m.top.findNode("fetchDashboardTask")
    m.fetchDashboardTask.observeField("response", "onDashboardDataReceived")
    
    m.top.observeField("visible", "onVisibleChange")
end sub

sub onVisibleChange()
    if m.top.visible = true
        loadDashboard()
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

        if data.drawingOfTheDay <> invalid and data.drawingOfTheDay.imageUrl <> invalid
            m.drawingPoster.uri = data.drawingOfTheDay.imageUrl
        end if
        
        content = CreateObject("roSGNode", "ContentNode")
        
        content.appendChild(createRow("Today's Tasks", data.todayTasks))
        content.appendChild(createRow("Today's Appointments", data.appointments))
        content.appendChild(createRow("Medication Reminders", data.medications))
        content.appendChild(createRow("Kids Summary", data.kids))
        content.appendChild(createRow("Pets Summary", data.pets))
        content.appendChild(createRow("Notification Center", data.notifications))
        
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
            if item.message <> invalid
                itemNode.description = item.message
            else if item.name <> invalid
                itemNode.title = item.name
                itemNode.description = "Profile"
            else
                itemNode.description = "Item"
            end if
            itemNode.HDPosterUrl = "pkg:/images/placeholder.jpg"
            row.appendChild(itemNode)
        end for
    end if
    return row
end function
