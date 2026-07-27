sub init()
    m.eventsGrid = m.top.findNode("eventsGrid")
    m.addBtnBg = m.top.findNode("addBtnBg")
    m.addBtnFocusBorder = m.top.findNode("addBtnFocusBorder")

    m.loadingOverlay = m.top.findNode("loadingOverlay")
    m.emptyState = m.top.findNode("emptyState")
    m.errorDialog = m.top.findNode("errorDialog")

    m.confirmDeleteDialog = m.top.findNode("confirmDeleteDialog")
    m.confirmDeleteDialog.observeField("confirmed", "OnConfirmDelete")

    m.eventsTask = m.top.findNode("eventsTask")
    m.eventsTask.observeField("response", "OnEventsResponse")

    m.deleteTask = m.top.findNode("deleteTask")
    m.deleteTask.observeField("response", "OnDeleteResponse")

    m.eventsGrid.observeField("itemSelected", "OnEventSelected")

    m.focusZone = 1
    FetchEvents()
end sub

sub FetchEvents()
    m.loadingOverlay.visible = true
    m.emptyState.visible = false
    m.eventsGrid.visible = false

    m.eventsTask.request = {
        endpoint: "/roku/dashboard",
        method: "GET"
    }
    m.eventsTask.control = "RUN"
end sub

sub OnEventsResponse(event as Object)
    m.loadingOverlay.visible = false
    response = event.getData()

    eventsList = []
    if response <> invalid and response.code = 200 and response.data <> invalid
        if response.data.reminders <> invalid
            eventsList = response.data.reminders
        else if response.data.events <> invalid
            eventsList = response.data.events
        else if type(response.data) = "roArray"
            eventsList = response.data
        end if
    end if

    m.rawEventsData = eventsList
    content = CreateObject("roSGNode", "ContentNode")

    for each ev in eventsList
        item = CreateObject("roSGNode", "ContentNode")
        item.title = ev.title

        descStr = ""
        if ev.startDateTime <> invalid and ev.startDateTime <> ""
            descStr = Left(ev.startDateTime, 10)
        else if ev.date <> invalid and ev.date <> ""
            descStr = Left(ev.date, 10)
        end if
        if ev.type <> invalid and ev.type <> ""
            if descStr <> "" then descStr = descStr + " • "
            descStr = descStr + ev.type
        end if

        item.shortDescriptionLine1 = descStr
        item.HDPosterUrl = "pkg:/images/icon_calendar.png"
        content.appendChild(item)
    end for

    if eventsList.count() = 0
        m.emptyState.visible = true
        SetFocusZone(0)
    else
        m.eventsGrid.content = content
        m.eventsGrid.visible = true
        SetFocusZone(1)
    end if
end sub

sub SetFocusZone(zone as Integer)
    m.focusZone = zone
    m.addBtnFocusBorder.visible = (zone = 0)

    if zone = 0
        m.addBtnBg.color = "0xE3F2FDFF"
    else
        m.addBtnBg.color = "0x42A5F5FF"
        if m.eventsGrid.visible
            m.eventsGrid.setFocus(true)
        end if
    end if
end sub

sub OpenAddEventForm(existingData = invalid)
    formScene = CreateObject("roSGNode", "EventFormScene")
    if existingData <> invalid
        formScene.eventData = existingData
    end if
    m.activeSubScene = formScene
    m.top.appendChild(m.activeSubScene)
    m.activeSubScene.setFocus(true)

    m.activeSubScene.observeField("saved", "OnSubSceneSaved")
    m.activeSubScene.observeField("closeRequest", "OnSubSceneClosed")
end sub

sub OnEventSelected()
    selectedIndex = m.eventsGrid.itemSelected
    if selectedIndex >= 0 and selectedIndex < m.rawEventsData.count()
        selectedEvent = m.rawEventsData[selectedIndex]
        OpenAddEventForm(selectedEvent)
    end if
end sub

sub OnConfirmDelete()
    if m.confirmDeleteDialog.confirmed and m.pendingDeleteId <> invalid and m.pendingDeleteId <> ""
        m.loadingOverlay.visible = true
        m.deleteTask.request = {
            endpoint: "/events/" + m.pendingDeleteId,
            method: "DELETE"
        }
        m.deleteTask.control = "RUN"
    end if
end sub

sub OnDeleteResponse(event as Object)
    m.loadingOverlay.visible = false
    FetchEvents()
end sub

sub OnSubSceneSaved()
    if m.activeSubScene <> invalid
        m.top.removeChild(m.activeSubScene)
        m.activeSubScene = invalid
    end if
    FetchEvents()
end sub

sub OnSubSceneClosed()
    if m.activeSubScene <> invalid
        m.top.removeChild(m.activeSubScene)
        m.activeSubScene = invalid
    end if
    SetFocusZone(m.focusZone)
end sub

function onKeyEvent(key as String, press as Boolean) as Boolean
    handled = false
    if press
        if m.activeSubScene <> invalid then return false

        if m.focusZone = 1
            if key = "up"
                focusedIdx = m.eventsGrid.itemFocused
                if focusedIdx < 4
                    SetFocusZone(0)
                    handled = true
                end if
            else if key = "options" or key = "*"
                focusedIdx = m.eventsGrid.itemFocused
                if focusedIdx >= 0 and focusedIdx < m.rawEventsData.count()
                    m.pendingDeleteId = m.rawEventsData[focusedIdx].id
                    m.confirmDeleteDialog.show = true
                    handled = true
                end if
            else if key = "back"
                m.top.navigate = "HomeScene"
                handled = true
            end if
        else if m.focusZone = 0
            if key = "down" and m.eventsGrid.visible
                SetFocusZone(1)
                handled = true
            else if key = "OK"
                OpenAddEventForm(invalid)
                handled = true
            else if key = "back"
                m.top.navigate = "HomeScene"
                handled = true
            end if
        end if
    end if
    return handled
end function
