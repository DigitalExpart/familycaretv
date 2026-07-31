sub init()
    m.patientsGrid = m.top.findNode("patientsGrid")
    m.addBtnBg = m.top.findNode("addBtnBg")
    m.addBtnFocusBorder = m.top.findNode("addBtnFocusBorder")

    m.loadingOverlay = m.top.findNode("loadingOverlay")
    m.emptyState = m.top.findNode("emptyState")
    m.errorDialog = m.top.findNode("errorDialog")

    m.patientsTask = m.top.findNode("patientsTask")
    m.patientsTask.observeField("response", "OnPatientsResponse")

    m.patientsGrid.observeField("itemSelected", "OnPatientSelected")

    ' 0 = Add Button in Header, 1 = Grid
    m.focusZone = 1

    FetchPatients()
end sub

sub FetchPatients()
    m.loadingOverlay.visible = true
    m.emptyState.visible = false
    m.patientsGrid.visible = false

    m.patientsTask.request = {
        endpoint: "/roku/patients",
        method: "GET"
    }
    m.patientsTask.control = "RUN"
end sub

sub OnPatientsResponse(event as Object)
    m.loadingOverlay.visible = false
    response = event.getData()

    if response <> invalid and response.code = 200 and response.data <> invalid
        m.rawPatientsData = response.data

        content = CreateObject("roSGNode", "ContentNode")

        for each patient in response.data
            item = CreateObject("roSGNode", "ContentNode")
            item.title = patient.fullName

            dobStr = ""
            if patient.dateOfBirth <> invalid and patient.dateOfBirth <> ""
                dobStr = "DOB: " + Left(patient.dateOfBirth, 10)
            end if
            item.shortDescriptionLine1 = dobStr
            item.HDPosterUrl = "pkg:/images/icon_patients.png"
            content.appendChild(item)
        end for

        if response.data.count() = 0
            m.emptyState.visible = true
            SetFocusZone(0) ' Move focus to [+] Add Patient button when empty
        else
            m.patientsGrid.content = content
            m.patientsGrid.visible = true
            SetFocusZone(1) ' Focus grid
        end if
    else
        ' Fallback try /patients directly
        if response <> invalid and response.code = 404
            m.patientsTask.request = {
                endpoint: "/patients",
                method: "GET"
            }
            m.patientsTask.control = "RUN"
            return
        end if

        m.errorDialog.message = "Unable to load patients list. Please check network."
        m.errorDialog.show = true
        SetFocusZone(0)
    end if
end sub

sub SetFocusZone(zone as Integer)
    m.focusZone = zone
    m.addBtnFocusBorder.visible = (zone = 0)

    if zone = 0
        m.addBtnBg.color = "0xF0FDFBFF"
    else
        m.addBtnBg.color = "0x00A89DFF"
        if m.patientsGrid.visible
            m.patientsGrid.setFocus(true)
        end if
    end if
end sub

sub OpenAddPatientForm()
    formScene = CreateObject("roSGNode", "PatientFormScene")
    m.activeSubScene = formScene
    m.top.appendChild(m.activeSubScene)
    m.activeSubScene.setFocus(true)

    m.activeSubScene.observeField("saved", "OnSubSceneSaved")
    m.activeSubScene.observeField("closeRequest", "OnSubSceneClosed")
end sub

sub OnPatientSelected()
    selectedIndex = m.patientsGrid.itemSelected
    if selectedIndex >= 0 and selectedIndex < m.rawPatientsData.count()
        selectedPatient = m.rawPatientsData[selectedIndex]

        detailScene = CreateObject("roSGNode", "PatientDetailScene")
        detailScene.patientData = selectedPatient
        m.activeSubScene = detailScene
        m.top.appendChild(m.activeSubScene)
        m.activeSubScene.setFocus(true)

        m.activeSubScene.observeField("patientUpdated", "OnSubSceneSaved")
        m.activeSubScene.observeField("patientDeleted", "OnSubSceneSaved")
        m.activeSubScene.observeField("closeRequest", "OnSubSceneClosed")
    end if
end sub

sub OnSubSceneSaved()
    if m.activeSubScene <> invalid
        m.top.removeChild(m.activeSubScene)
        m.activeSubScene = invalid
    end if
    FetchPatients()
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
        if m.activeSubScene <> invalid
            ' Handled by child sub-scene
            return false
        end if

        if m.focusZone = 1
            ' Grid focus
            if key = "up"
                focusedIdx = m.patientsGrid.itemFocused
                if focusedIdx < 4
                    SetFocusZone(0)
                    handled = true
                end if
            else if key = "back"
                m.top.navigate = "HomeScene"
                handled = true
            end if
        else if m.focusZone = 0
            ' Add button focus
            if key = "down" and m.patientsGrid.visible
                SetFocusZone(1)
                handled = true
            else if key = "OK"
                OpenAddPatientForm()
                handled = true
            else if key = "back"
                m.top.navigate = "HomeScene"
                handled = true
            end if
        end if
    end if
    return handled
end function
