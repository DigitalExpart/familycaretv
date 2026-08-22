sub init()
    m.eventsGrid = m.top.findNode("eventsGrid")
    m.addBtnBg = m.top.findNode("addBtnBg")
    m.addBtnFocusBorder = m.top.findNode("addBtnFocusBorder")
    m.prevBtnBg = m.top.findNode("prevBtnBg")
    m.prevBtnFocusBorder = m.top.findNode("prevBtnFocusBorder")
    m.nextBtnBg = m.top.findNode("nextBtnBg")
    m.nextBtnFocusBorder = m.top.findNode("nextBtnFocusBorder")
    m.monthLabel = m.top.findNode("monthLabel")

    m.loadingOverlay = m.top.findNode("loadingOverlay")
    m.errorDialog = m.top.findNode("errorDialog")

    m.confirmDeleteDialog = m.top.findNode("confirmDeleteDialog")
    m.confirmDeleteDialog.observeField("confirmed", "OnConfirmDelete")

    m.eventsTask = m.top.findNode("eventsTask")
    m.eventsTask.observeField("response", "OnEventsResponse")

    m.deleteTask = m.top.findNode("deleteTask")
    m.deleteTask.observeField("response", "OnDeleteResponse")

    m.eventsGrid.observeField("itemSelected", "OnEventSelected")

    m.focusZone = 1 ' 0 = Header, 1 = Grid
    m.headerFocusIndex = 0 ' 0 = Prev, 1 = Next, 2 = Add Event
    
    ' Calculate current month details
    now = CreateObject("roDateTime")
    now.ToLocalTime()
    m.currentYear = now.GetYear()
    m.currentMonth = now.GetMonth()
    
    m.rawEventsData = []
    UpdateMonthHeader()
    FetchEvents()
end sub

sub UpdateMonthHeader()
    months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    m.monthLabel.text = months[m.currentMonth - 1] + " " + StrI(m.currentYear).Trim() + " - Family Calendar"
end sub

sub ChangeMonth(delta as Integer)
    m.currentMonth = m.currentMonth + delta
    if m.currentMonth < 1
        m.currentMonth = 12
        m.currentYear = m.currentYear - 1
    else if m.currentMonth > 12
        m.currentMonth = 1
        m.currentYear = m.currentYear + 1
    end if
    UpdateMonthHeader()
    BuildCalendarGrid()
end sub

sub FetchEvents()
    m.loadingOverlay.visible = true
    m.eventsGrid.visible = false

    m.eventsTask.request = {
        endpoint: "/roku/dashboard",
        method: "GET"
    }
    m.eventsTask.control = "RUN"
end sub

function GetDaysInMonth(year as Integer, month as Integer) as Integer
    if month = 2
        if (year mod 4 = 0 and year mod 100 <> 0) or (year mod 400 = 0)
            return 29
        else
            return 28
        end if
    else if month = 4 or month = 6 or month = 9 or month = 11
        return 30
    else
        return 31
    end if
end function

sub OnEventsResponse(event as Object)
    m.loadingOverlay.visible = false
    response = event.getData()

    eventsList = []
    if response <> invalid and response.code = 200 and response.data <> invalid
        if response.data.upcomingEvents <> invalid
            eventsList = response.data.upcomingEvents
        else if response.data.reminders <> invalid
            eventsList = response.data.reminders
        else if response.data.events <> invalid
            eventsList = response.data.events
        else if type(response.data) = "roArray"
            eventsList = response.data
        end if
    end if

    m.rawEventsData = eventsList
    BuildCalendarGrid()
    m.eventsGrid.visible = true
    SetFocusZone(1, m.headerFocusIndex)
end sub

sub BuildCalendarGrid()
    daysInMonth = GetDaysInMonth(m.currentYear, m.currentMonth)
    
    firstDay = CreateObject("roDateTime")
    monthStr = StrI(m.currentMonth).Trim()
    if m.currentMonth < 10 then monthStr = "0" + monthStr
    firstDay.FromISO8601String(StrI(m.currentYear).Trim() + "-" + monthStr + "-01T12:00:00Z")
    startDayOfWeek = firstDay.GetDayOfWeek() ' 0 = Sunday
    
    content = CreateObject("roSGNode", "ContentNode")
    
    for i = 0 to 41
        item = CreateObject("roSGNode", "ContentNode")
        
        if i < startDayOfWeek
            item.title = ""
            item.shortDescriptionLine1 = "dimmed"
        else if i >= startDayOfWeek + daysInMonth
            item.title = ""
            item.shortDescriptionLine1 = "dimmed"
        else
            dayNum = i - startDayOfWeek + 1
            item.title = StrI(dayNum).Trim()
            item.shortDescriptionLine1 = "active"
            
            eventsText = ""
            eventCount = 0
            if m.rawEventsData <> invalid
                for each ev in m.rawEventsData
                    evDay = -1
                    evMonth = -1
                    evYear = -1
                    
                    dateVal = ""
                    if ev.startDateTime <> invalid and ev.startDateTime <> ""
                        dateVal = ev.startDateTime
                    else if ev.date <> invalid and ev.date <> ""
                        dateVal = ev.date
                    end if
                    
                    if dateVal <> "" and Len(dateVal) >= 10
                        evYear = Val(Left(dateVal, 4))
                        evMonth = Val(Mid(dateVal, 6, 2))
                        evDay = Val(Mid(dateVal, 9, 2))
                    end if
                    
                    if evDay = dayNum and evMonth = m.currentMonth and evYear = m.currentYear
                        eventCount = eventCount + 1
                        if eventsText = ""
                            eventsText = ev.title
                        end if
                    end if
                end for
            end if
            
            if eventCount > 1
                item.shortDescriptionLine2 = StrI(eventCount).Trim() + " Events"
            else if eventCount = 1
                item.shortDescriptionLine2 = eventsText
            else
                item.shortDescriptionLine2 = ""
            end if
        end if
        
        content.appendChild(item)
    end for

    m.eventsGrid.content = content
end sub

sub SetFocusZone(zone as Integer, headerIdx as Integer)
    m.focusZone = zone
    m.headerFocusIndex = headerIdx

    m.prevBtnFocusBorder.visible = (zone = 0 and headerIdx = 0)
    m.nextBtnFocusBorder.visible = (zone = 0 and headerIdx = 1)
    m.addBtnFocusBorder.visible = (zone = 0 and headerIdx = 2)

    m.prevBtnBg.color = "0xF1F5F9FF"
    m.nextBtnBg.color = "0xF1F5F9FF"
    m.addBtnBg.color = "0x42A5F5FF"

    if zone = 0
        if headerIdx = 0
            m.prevBtnBg.color = "0x42A5F5FF"
        else if headerIdx = 1
            m.nextBtnBg.color = "0x42A5F5FF"
        else if headerIdx = 2
            m.addBtnBg.color = "0x1E88E5FF"
        end if
    else
        if m.eventsGrid.visible
            m.eventsGrid.setFocus(true)
        end if
    end if
end sub

sub OnEventSelected()
    idx = m.eventsGrid.itemSelected
    item = m.eventsGrid.content.getChild(idx)
    
    if item <> invalid and item.shortDescriptionLine1 = "active"
        dayNum = Val(item.title)
        OpenAddEventFormForDay(dayNum)
    end if
end sub

sub OpenAddEventFormForDay(dayNum as Integer)
    formScene = CreateObject("roSGNode", "EventFormScene")
    
    monthStr = StrI(m.currentMonth).Trim()
    if m.currentMonth < 10 then monthStr = "0" + monthStr
    dayStr = StrI(dayNum).Trim()
    if dayNum < 10 then dayStr = "0" + dayStr
    isoDate = StrI(m.currentYear).Trim() + "-" + monthStr + "-" + dayStr + "T09:00:00Z"
    
    formScene.eventData = { startDateTime: isoDate }
    
    m.activeSubScene = formScene
    m.top.appendChild(m.activeSubScene)
    m.activeSubScene.setFocus(true)

    m.activeSubScene.observeField("saved", "OnSubSceneSaved")
    m.activeSubScene.observeField("closed", "OnSubSceneClosed")
end sub

sub OpenAddEventForm()
    formScene = CreateObject("roSGNode", "EventFormScene")
    m.activeSubScene = formScene
    m.top.appendChild(m.activeSubScene)
    m.activeSubScene.setFocus(true)

    m.activeSubScene.observeField("saved", "OnSubSceneSaved")
    m.activeSubScene.observeField("closed", "OnSubSceneClosed")
end sub

sub OnSubSceneSaved()
    if m.activeSubScene <> invalid
        m.top.removeChild(m.activeSubScene)
        m.activeSubScene = invalid
    end if
    SetFocusZone(1, m.headerFocusIndex)
    FetchEvents()
end sub

sub OnSubSceneClosed()
    if m.activeSubScene <> invalid
        m.top.removeChild(m.activeSubScene)
        m.activeSubScene = invalid
    end if
    SetFocusZone(1, m.headerFocusIndex)
end sub

sub OnConfirmDelete()
    m.deleteTask.request = {
        endpoint: "/events/" + m.eventToDelete,
        method: "DELETE"
    }
    m.deleteTask.control = "RUN"
    m.loadingOverlay.visible = true
end sub

sub OnDeleteResponse(event as Object)
    m.loadingOverlay.visible = false
    FetchEvents()
end sub

function onKeyEvent(key as String, press as Boolean) as Boolean
    handled = false
    if press
        if m.activeSubScene <> invalid
            return false
        end if

        if m.confirmDeleteDialog.visible
            if key = "back"
                m.confirmDeleteDialog.visible = false
                SetFocusZone(1, m.headerFocusIndex)
                handled = true
            end if
            return handled
        end if

        if m.focusZone = 0
            if key = "left"
                if m.headerFocusIndex > 0
                    SetFocusZone(0, m.headerFocusIndex - 1)
                    handled = true
                end if
            else if key = "right"
                if m.headerFocusIndex < 2
                    SetFocusZone(0, m.headerFocusIndex + 1)
                    handled = true
                end if
            else if key = "down"
                SetFocusZone(1, m.headerFocusIndex)
                handled = true
            else if key = "OK"
                if m.headerFocusIndex = 0
                    ChangeMonth(-1)
                    handled = true
                else if m.headerFocusIndex = 1
                    ChangeMonth(1)
                    handled = true
                else if m.headerFocusIndex = 2
                    OpenAddEventForm()
                    handled = true
                end if
            else if key = "back"
                m.top.navigate = "HomeScene"
                handled = true
            end if
        else if m.focusZone = 1
            if key = "up"
                if m.eventsGrid.itemFocused < 7
                    col = m.eventsGrid.itemFocused
                    headerIdx = 0
                    if col >= 2 and col <= 4
                        headerIdx = 1
                    else if col >= 5
                        headerIdx = 2
                    end if
                    SetFocusZone(0, headerIdx)
                    handled = true
                end if
            else if key = "back"
                m.top.navigate = "HomeScene"
                handled = true
            end if
        end if
    end if
    return handled
end function
