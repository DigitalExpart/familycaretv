sub init()
    m.topNavBar = m.top.findNode("topNavBar")
    m.patientsLabel = m.top.findNode("patientsLabel")
    m.eventsLabel = m.top.findNode("eventsLabel")
    m.medsLabel = m.top.findNode("medsLabel")
    m.verseLabel = m.top.findNode("verseLabel")
    m.drawingPoster = m.top.findNode("drawingPoster")
    m.navGrid = m.top.findNode("navGrid")
    m.errorDialog = m.top.findNode("errorDialog")
    
    m.topNavBar.title = tr("Home_Welcome")
    
    ' Populate Quick Nav Grid
    content = CreateObject("roSGNode", "ContentNode")
    
    AddItem(content, tr("Nav_Patients"), "pkg:/images/icon_patients.png", "PatientsScene")
    AddItem(content, tr("Nav_Calendar"), "pkg:/images/icon_calendar.png", "CalendarScene")
    AddItem(content, tr("Nav_Music"), "pkg:/images/icon_music.png", "MusicScene")
    AddItem(content, tr("Nav_Kids"), "pkg:/images/icon_kids.png", "KidsScene")
    AddItem(content, tr("Nav_Settings"), "pkg:/images/icon_settings.png", "SettingsScene")
    
    m.navGrid.content = content
    m.navGrid.observeField("itemSelected", "OnGridItemSelected")
    
    m.dashboardTask = m.top.findNode("dashboardTask")
    m.dashboardTask.observeField("response", "OnDashboardResponse")
    
    m.dashboardTask.request = {
        endpoint: "/roku/dashboard",
        method: "GET"
    }
    m.dashboardTask.control = "RUN"
    
    m.navGrid.setFocus(true)
end sub

sub AddItem(parent as Object, title as String, iconUri as String, targetScene as String)
    item = CreateObject("roSGNode", "ContentNode")
    item.title = title
    item.HDPosterUrl = iconUri
    item.description = targetScene
    parent.appendChild(item)
end sub

sub OnDashboardResponse(event as Object)
    response = event.getData()
    if response <> invalid and response.code = 200 and response.data <> invalid
        data = response.data
        
        m.patientsLabel.text = tr("Home_PatientCount") + ": " + (data.patientCount).toStr()
        m.eventsLabel.text = tr("Home_Events") + ": " + (data.eventsCount).toStr()
        m.medsLabel.text = tr("Home_Meds") + ": " + (data.medsCount).toStr()
        
        if data.verse <> invalid
            m.verseLabel.text = tr("Home_Verse") + ": " + Chr(10) + data.verse.text + " - " + data.verse.reference
        end if
        
        if data.drawingUrl <> invalid
            m.drawingPoster.uri = data.drawingUrl
        end if
    else
        m.errorDialog.message = tr("Error_Network")
        m.errorDialog.show = true
    end if
end sub

sub OnGridItemSelected()
    selectedItem = m.navGrid.content.getChild(m.navGrid.itemSelected)
    if selectedItem <> invalid
        m.top.navigate = selectedItem.description
    end if
end sub

function onKeyEvent(key as String, press as Boolean) as Boolean
    handled = false
    if press
        if key = "up"
            handled = true
        else if key = "down"
            m.navGrid.setFocus(true)
            handled = true
        end if
    end if
    return handled
end function
