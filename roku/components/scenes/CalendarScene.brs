sub init()
    m.navBar = m.top.findNode("navBar")
    m.navBar.title = "Calendar"
    
    m.loadingLabel = m.top.findNode("loadingLabel")
    m.loadingLabel.text = "Loading..."
    m.eventsGrid = m.top.findNode("eventsGrid")
    m.errorDialog = m.top.findNode("errorDialog")
    
    m.eventsTask = m.top.findNode("eventsTask")
    m.eventsTask.observeField("response", "OnEventsResponse")
    
    m.eventsTask.request = {
        endpoint: "/events",
        method: "GET"
    }
    m.eventsTask.control = "RUN"
end sub

sub OnEventsResponse(event as Object)
    response = event.getData()
    m.loadingLabel.visible = false
    
    if response <> invalid and response.code = 200 and response.data <> invalid
        content = CreateObject("roSGNode", "ContentNode")
        
        for each evt in response.data
            item = CreateObject("roSGNode", "ContentNode")
            ' Assume the date is ISO string, simple format here or just display
            item.title = evt.title + Chr(10) + evt.startDateTime
            item.HDPosterUrl = "pkg:/images/icon_event.png"
            content.appendChild(item)
        end for
        
        if response.data.count() = 0
            m.loadingLabel.text = "No events found."
            m.loadingLabel.visible = true
            m.top.setFocus(true)
        else
            m.eventsGrid.content = content
            m.eventsGrid.visible = true
            m.eventsGrid.setFocus(true)
        end if
    else
        m.errorDialog.message = "Network error occurred. Please try again."
        m.errorDialog.show = true
        m.top.setFocus(true)
    end if
end sub
