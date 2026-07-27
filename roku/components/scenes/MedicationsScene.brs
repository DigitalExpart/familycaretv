sub init()
    m.medsGrid = m.top.findNode("medsGrid")
    m.addBtnBg = m.top.findNode("addBtnBg")
    m.addBtnFocusBorder = m.top.findNode("addBtnFocusBorder")

    m.loadingOverlay = m.top.findNode("loadingOverlay")
    m.emptyState = m.top.findNode("emptyState")
    m.errorDialog = m.top.findNode("errorDialog")

    m.confirmDeleteDialog = m.top.findNode("confirmDeleteDialog")
    m.confirmDeleteDialog.observeField("confirmed", "OnConfirmDelete")

    m.medsTask = m.top.findNode("medsTask")
    m.medsTask.observeField("response", "OnMedsResponse")

    m.deleteTask = m.top.findNode("deleteTask")
    m.deleteTask.observeField("response", "OnDeleteResponse")

    m.medsGrid.observeField("itemSelected", "OnMedSelected")

    ' 0 = Add button, 1 = Grid
    m.focusZone = 1

    FetchMedications()
end sub

sub FetchMedications()
    m.loadingOverlay.visible = true
    m.emptyState.visible = false
    m.medsGrid.visible = false

    m.medsTask.request = {
        endpoint: "/roku/dashboard",
        method: "GET"
    }
    m.medsTask.control = "RUN"
end sub

sub OnMedsResponse(event as Object)
    m.loadingOverlay.visible = false
    response = event.getData()

    medsList = []
    if response <> invalid and response.code = 200 and response.data <> invalid
        if response.data.medications <> invalid
            medsList = response.data.medications
        else if type(response.data) = "roArray"
            medsList = response.data
        end if
    end if

    m.rawMedsData = medsList
    content = CreateObject("roSGNode", "ContentNode")

    for each med in medsList
        item = CreateObject("roSGNode", "ContentNode")
        item.title = med.name

        subText = ""
        if med.dosage <> invalid and med.dosage <> ""
            subText = "Dosage: " + med.dosage
        end if
        if med.frequency <> invalid and med.frequency <> ""
            if subText <> "" then subText = subText + " • "
            subText = subText + med.frequency
        end if

        item.shortDescriptionLine1 = subText
        item.HDPosterUrl = "pkg:/images/icon_medications.png"
        content.appendChild(item)
    end for

    if medsList.count() = 0
        m.emptyState.visible = true
        SetFocusZone(0)
    else
        m.medsGrid.content = content
        m.medsGrid.visible = true
        SetFocusZone(1)
    end if
end sub

sub SetFocusZone(zone as Integer)
    m.focusZone = zone
    m.addBtnFocusBorder.visible = (zone = 0)

    if zone = 0
        m.addBtnBg.color = "0xFFF3E0FF"
    else
        m.addBtnBg.color = "0xFFA726FF"
        if m.medsGrid.visible
            m.medsGrid.setFocus(true)
        end if
    end if
end sub

sub OpenAddMedForm(existingData = invalid)
    formScene = CreateObject("roSGNode", "MedicationFormScene")
    if existingData <> invalid
        formScene.medicationData = existingData
    end if
    m.activeSubScene = formScene
    m.top.appendChild(m.activeSubScene)
    m.activeSubScene.setFocus(true)

    m.activeSubScene.observeField("saved", "OnSubSceneSaved")
    m.activeSubScene.observeField("closeRequest", "OnSubSceneClosed")
end sub

sub OnMedSelected()
    selectedIndex = m.medsGrid.itemSelected
    if selectedIndex >= 0 and selectedIndex < m.rawMedsData.count()
        selectedMed = m.rawMedsData[selectedIndex]
        OpenAddMedForm(selectedMed)
    end if
end sub

sub OnConfirmDelete()
    if m.confirmDeleteDialog.confirmed and m.pendingDeleteId <> invalid and m.pendingDeleteId <> ""
        m.loadingOverlay.visible = true
        m.deleteTask.request = {
            endpoint: "/medications/" + m.pendingDeleteId,
            method: "DELETE"
        }
        m.deleteTask.control = "RUN"
    end if
end sub

sub OnDeleteResponse(event as Object)
    m.loadingOverlay.visible = false
    FetchMedications()
end sub

sub OnSubSceneSaved()
    if m.activeSubScene <> invalid
        m.top.removeChild(m.activeSubScene)
        m.activeSubScene = invalid
    end if
    FetchMedications()
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
                focusedIdx = m.medsGrid.itemFocused
                if focusedIdx < 4
                    SetFocusZone(0)
                    handled = true
                end if
            else if key = "options" or key = "*"
                focusedIdx = m.medsGrid.itemFocused
                if focusedIdx >= 0 and focusedIdx < m.rawMedsData.count()
                    m.pendingDeleteId = m.rawMedsData[focusedIdx].id
                    m.confirmDeleteDialog.show = true
                    handled = true
                end if
            else if key = "back"
                m.top.navigate = "HomeScene"
                handled = true
            end if
        else if m.focusZone = 0
            if key = "down" and m.medsGrid.visible
                SetFocusZone(1)
                handled = true
            else if key = "OK"
                OpenAddMedForm(invalid)
                handled = true
            else if key = "back"
                m.top.navigate = "HomeScene"
                handled = true
            end if
        end if
    end if
    return handled
end function
