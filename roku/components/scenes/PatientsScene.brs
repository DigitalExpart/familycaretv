sub init()
    m.navBar = m.top.findNode("navBar")
    m.navBar.title = "Patients"
    
    m.loadingLabel = m.top.findNode("loadingLabel")
    m.loadingLabel.text = "Loading..."
    m.patientsGrid = m.top.findNode("patientsGrid")
    m.errorDialog = m.top.findNode("errorDialog")
    
    m.patientsTask = m.top.findNode("patientsTask")
    m.patientsTask.observeField("response", "OnPatientsResponse")
    
    m.patientsTask.request = {
        endpoint: "/roku/patients",
        method: "GET"
    }
    m.patientsTask.control = "RUN"
    
    m.patientsGrid.observeField("itemSelected", "OnPatientSelected")
end sub

sub OnPatientsResponse(event as Object)
    response = event.getData()
    m.loadingLabel.visible = false
    
    if response <> invalid and response.code = 200 and response.data <> invalid
        m.patientsData = response.data ' Store raw data
        content = CreateObject("roSGNode", "ContentNode")
        
        for each patient in response.data
            item = CreateObject("roSGNode", "ContentNode")
            item.title = patient.fullName
            item.HDPosterUrl = "pkg:/images/icon_user.png"
            content.appendChild(item)
        end for
        
        if response.data.count() = 0
            m.loadingLabel.text = "No patients found."
            m.loadingLabel.visible = true
            m.top.setFocus(true)
        else
            m.patientsGrid.content = content
            m.patientsGrid.visible = true
            m.patientsGrid.setFocus(true)
        end if
    else
        m.errorDialog.message = "Network error occurred. Please try again."
        m.errorDialog.show = true
        m.top.setFocus(true)
    end if
end sub

sub OnPatientSelected()
    selectedIndex = m.patientsGrid.itemSelected
    selectedPatient = m.patientsData[selectedIndex]
    
    detailScene = CreateObject("roSGNode", "PatientDetailScene")
    detailScene.patientData = selectedPatient
    
    m.detailView = detailScene
    m.top.appendChild(m.detailView)
    m.detailView.visible = true
    m.detailView.setFocus(true)
    
    ' Observe close event
    m.detailView.observeField("closeRequest", "OnDetailClose")
end sub

sub OnDetailClose()
    m.top.removeChild(m.detailView)
    m.detailView = invalid
    m.patientsGrid.setFocus(true)
end sub

function onKeyEvent(key as String, press as Boolean) as Boolean
    handled = false
    if press
        if key = "back" and m.detailView <> invalid
            ' Handled by PatientDetailScene returning focus, or we handle it here
            handled = false
        end if
    end if
    return handled
end function
