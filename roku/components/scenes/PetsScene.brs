sub init()
    m.petsGrid = m.top.findNode("petsGrid")
    m.addBtnBg = m.top.findNode("addBtnBg")
    m.addBtnFocusBorder = m.top.findNode("addBtnFocusBorder")

    m.loadingOverlay = m.top.findNode("loadingOverlay")
    m.emptyState = m.top.findNode("emptyState")
    m.errorDialog = m.top.findNode("errorDialog")

    m.confirmDeleteDialog = m.top.findNode("confirmDeleteDialog")
    m.confirmDeleteDialog.observeField("confirmed", "OnConfirmDelete")

    m.petsTask = m.top.findNode("petsTask")
    m.petsTask.observeField("response", "OnPetsResponse")

    m.deleteTask = m.top.findNode("deleteTask")
    m.deleteTask.observeField("response", "OnDeleteResponse")

    m.petsGrid.observeField("itemSelected", "OnPetSelected")

    m.focusZone = 1
    FetchPets()
end sub

sub FetchPets()
    m.loadingOverlay.visible = true
    m.emptyState.visible = false
    m.petsGrid.visible = false

    m.petsTask.request = {
        endpoint: "/roku/pets",
        method: "GET"
    }
    m.petsTask.control = "RUN"
end sub

sub OnPetsResponse(event as Object)
    m.loadingOverlay.visible = false
    response = event.getData()

    petsList = []
    if response <> invalid and response.code = 200 and response.data <> invalid
        if type(response.data) = "roArray"
            petsList = response.data
        else if response.data.pets <> invalid
            petsList = response.data.pets
        end if
    end if

    m.rawPetsData = petsList
    content = CreateObject("roSGNode", "ContentNode")

    for each pet in petsList
        item = CreateObject("roSGNode", "ContentNode")
        item.title = pet.name

        subText = ""
        if pet.species <> invalid and pet.species <> ""
            subText = pet.species
        end if
        if pet.breed <> invalid and pet.breed <> ""
            if subText <> "" then subText = subText + " • "
            subText = subText + pet.breed
        end if

        item.shortDescriptionLine1 = subText
        item.HDPosterUrl = "pkg:/images/icon_pets.png"
        content.appendChild(item)
    end for

    if petsList.count() = 0
        m.emptyState.visible = true
        SetFocusZone(0)
    else
        m.petsGrid.content = content
        m.petsGrid.visible = true
        SetFocusZone(1)
    end if
end sub

sub SetFocusZone(zone as Integer)
    m.focusZone = zone
    m.addBtnFocusBorder.visible = (zone = 0)

    if zone = 0
        m.addBtnBg.color = "0xE8F5E9FF"
    else
        m.addBtnBg.color = "0x66BB6AFF"
        if m.petsGrid.visible
            m.petsGrid.setFocus(true)
        end if
    end if
end sub

sub OpenAddPetForm(existingData = invalid)
    formScene = CreateObject("roSGNode", "PetFormScene")
    if existingData <> invalid
        formScene.petData = existingData
    end if
    m.activeSubScene = formScene
    m.top.appendChild(m.activeSubScene)
    m.activeSubScene.setFocus(true)

    m.activeSubScene.observeField("saved", "OnSubSceneSaved")
    m.activeSubScene.observeField("closeRequest", "OnSubSceneClosed")
end sub

sub OnPetSelected()
    selectedIndex = m.petsGrid.itemSelected
    if selectedIndex >= 0 and selectedIndex < m.rawPetsData.count()
        selectedPet = m.rawPetsData[selectedIndex]
        OpenAddPetForm(selectedPet)
    end if
end sub

sub OnConfirmDelete()
    if m.confirmDeleteDialog.confirmed and m.pendingDeleteId <> invalid and m.pendingDeleteId <> ""
        m.loadingOverlay.visible = true
        m.deleteTask.request = {
            endpoint: "/pets/" + m.pendingDeleteId,
            method: "DELETE"
        }
        m.deleteTask.control = "RUN"
    end if
end sub

sub OnDeleteResponse(event as Object)
    m.loadingOverlay.visible = false
    FetchPets()
end sub

sub OnSubSceneSaved()
    if m.activeSubScene <> invalid
        m.top.removeChild(m.activeSubScene)
        m.activeSubScene = invalid
    end if
    FetchPets()
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
                focusedIdx = m.petsGrid.itemFocused
                if focusedIdx < 4
                    SetFocusZone(0)
                    handled = true
                end if
            else if key = "options" or key = "*"
                focusedIdx = m.petsGrid.itemFocused
                if focusedIdx >= 0 and focusedIdx < m.rawPetsData.count()
                    m.pendingDeleteId = m.rawPetsData[focusedIdx].id
                    m.confirmDeleteDialog.show = true
                    handled = true
                end if
            else if key = "back"
                m.top.navigate = "HomeScene"
                handled = true
            end if
        else if m.focusZone = 0
            if key = "down" and m.petsGrid.visible
                SetFocusZone(1)
                handled = true
            else if key = "OK"
                OpenAddPetForm(invalid)
                handled = true
            else if key = "back"
                m.top.navigate = "HomeScene"
                handled = true
            end if
        end if
    end if
    return handled
end function
