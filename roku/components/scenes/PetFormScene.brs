sub init()
    m.formTitle = m.top.findNode("formTitle")
    m.nameField = m.top.findNode("nameField")
    m.speciesField = m.top.findNode("speciesField")
    m.breedField = m.top.findNode("breedField")
    m.notesField = m.top.findNode("notesField")

    m.saveFocusBorder = m.top.findNode("saveFocusBorder")
    m.cancelFocusBorder = m.top.findNode("cancelFocusBorder")

    m.saveTask = m.top.findNode("saveTask")
    m.saveTask.observeField("response", "OnSaveResponse")

    m.errorDialog = m.top.findNode("errorDialog")
    m.loadingOverlay = m.top.findNode("loadingOverlay")
    m.keyboardDialog = m.top.findNode("keyboardDialog")

    m.focusedItem = 0
    m.petId = ""
    UpdateFocus()
end sub

sub OnPetDataChange()
    data = m.top.petData
    if data <> invalid and data.id <> invalid
        m.petId = data.id
        m.formTitle.text = "Edit Pet: " + data.name
        if data.name <> invalid then m.nameField.value = data.name
        if data.species <> invalid then m.speciesField.value = data.species
        if data.breed <> invalid then m.breedField.value = data.breed
        if data.notes <> invalid then m.notesField.value = data.notes
    else
        m.petId = ""
        m.formTitle.text = "Add Pet Profile"
    end if
end sub

sub UpdateFocus()
    m.nameField.isFocused = (m.focusedItem = 0)
    m.speciesField.isFocused = (m.focusedItem = 1)
    m.breedField.isFocused = (m.focusedItem = 2)
    m.notesField.isFocused = (m.focusedItem = 3)

    m.saveFocusBorder.visible = (m.focusedItem = 4)
    m.cancelFocusBorder.visible = (m.focusedItem = 5)
end sub

sub OpenKeyboard(title as String, initialText as String, fieldIndex as Integer)
    m.editingFieldIndex = fieldIndex
    m.keyboardDialog.title = title
    m.keyboardDialog.text = initialText
    m.keyboardDialog.visible = true
    m.keyboardDialog.setFocus(true)
    m.keyboardDialog.observeField("buttonSelected", "OnKeyboardButtonSelected")
end sub

sub OnKeyboardButtonSelected(event as Object)
    buttonIdx = event.getData()
    typedText = m.keyboardDialog.text
    m.keyboardDialog.visible = false

    if buttonIdx = 0 or buttonIdx = invalid
        if m.editingFieldIndex = 0
            m.nameField.value = typedText
        else if m.editingFieldIndex = 1
            m.speciesField.value = typedText
        else if m.editingFieldIndex = 2
            m.breedField.value = typedText
        else if m.editingFieldIndex = 3
            m.notesField.value = typedText
        end if
    end if

    UpdateFocus()
    m.top.setFocus(true)
end sub

sub SavePet()
    name = m.nameField.value
    if name = invalid or Trim(name) = ""
        m.errorDialog.message = "Please enter the pet's name."
        m.errorDialog.show = true
        return
    end if

    species = m.speciesField.value
    if species = invalid or Trim(species) = ""
        species = "Dog"
    end if

    body = {
        name: name,
        species: species,
        breed: m.breedField.value,
        notes: m.notesField.value
    }

    m.loadingOverlay.visible = true

    if m.petId <> ""
        m.saveTask.request = {
            endpoint: "/pets/" + m.petId,
            method: "PATCH",
            body: body
        }
    else
        m.saveTask.request = {
            endpoint: "/pets",
            method: "POST",
            body: body
        }
    end if

    m.saveTask.control = "RUN"
end sub

sub OnSaveResponse(event as Object)
    m.loadingOverlay.visible = false
    response = event.getData()

    if response <> invalid and (response.code = 200 or response.code = 201)
        m.top.saved = true
    else
        msg = "Failed to save pet profile."
        if response <> invalid and response.error <> invalid
            msg = response.error
        end if
        m.errorDialog.message = msg
        m.errorDialog.show = true
    end if
end sub

function onKeyEvent(key as String, press as Boolean) as Boolean
    handled = false
    if press
        if key = "down"
            if m.focusedItem < 5
                m.focusedItem = m.focusedItem + 1
                UpdateFocus()
                handled = true
            end if
        else if key = "up"
            if m.focusedItem > 0
                m.focusedItem = m.focusedItem - 1
                UpdateFocus()
                handled = true
            end if
        else if key = "right"
            if m.focusedItem = 4
                m.focusedItem = 5
                UpdateFocus()
                handled = true
            end if
        else if key = "left"
            if m.focusedItem = 5
                m.focusedItem = 4
                UpdateFocus()
                handled = true
            end if
        else if key = "OK"
            if m.focusedItem = 0
                OpenKeyboard("Pet Name", m.nameField.value, 0)
                handled = true
            else if m.focusedItem = 1
                OpenKeyboard("Species (e.g. Dog, Cat)", m.speciesField.value, 1)
                handled = true
            else if m.focusedItem = 2
                OpenKeyboard("Breed / Color", m.breedField.value, 2)
                handled = true
            else if m.focusedItem = 3
                OpenKeyboard("Care Notes & Vet Info", m.notesField.value, 3)
                handled = true
            else if m.focusedItem = 4
                SavePet()
                handled = true
            else if m.focusedItem = 5
                m.top.closeRequest = true
                handled = true
            end if
        else if key = "back"
            m.top.closeRequest = true
            handled = true
        end if
    end if
    return handled
end function
