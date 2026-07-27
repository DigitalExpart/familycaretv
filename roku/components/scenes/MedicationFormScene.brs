sub init()
    m.formTitle = m.top.findNode("formTitle")
    m.nameField = m.top.findNode("nameField")
    m.dosageField = m.top.findNode("dosageField")
    m.frequencyField = m.top.findNode("frequencyField")
    m.purposeField = m.top.findNode("purposeField")

    m.saveFocusBorder = m.top.findNode("saveFocusBorder")
    m.cancelFocusBorder = m.top.findNode("cancelFocusBorder")

    m.saveTask = m.top.findNode("saveTask")
    m.saveTask.observeField("response", "OnSaveResponse")

    m.errorDialog = m.top.findNode("errorDialog")
    m.loadingOverlay = m.top.findNode("loadingOverlay")
    m.keyboardDialog = m.top.findNode("keyboardDialog")

    m.focusedItem = 0
    m.medicationId = ""
    UpdateFocus()
end sub

sub OnMedDataChange()
    data = m.top.medicationData
    if data <> invalid and data.id <> invalid
        m.medicationId = data.id
        m.formTitle.text = "Edit Medication: " + data.name
        if data.name <> invalid then m.nameField.value = data.name
        if data.dosage <> invalid then m.dosageField.value = data.dosage
        if data.frequency <> invalid then m.frequencyField.value = data.frequency
        if data.purpose <> invalid then m.purposeField.value = data.purpose
    else
        m.medicationId = ""
        m.formTitle.text = "Add Medication"
    end if
end sub

sub UpdateFocus()
    m.nameField.isFocused = (m.focusedItem = 0)
    m.dosageField.isFocused = (m.focusedItem = 1)
    m.frequencyField.isFocused = (m.focusedItem = 2)
    m.purposeField.isFocused = (m.focusedItem = 3)

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
            m.dosageField.value = typedText
        else if m.editingFieldIndex = 2
            m.frequencyField.value = typedText
        else if m.editingFieldIndex = 3
            m.purposeField.value = typedText
        end if
    end if

    UpdateFocus()
    m.top.setFocus(true)
end sub

sub SaveMedication()
    name = m.nameField.value
    if name = invalid or Trim(name) = ""
        m.errorDialog.message = "Please enter the medication name."
        m.errorDialog.show = true
        return
    end if

    body = {
        name: name,
        dosage: m.dosageField.value,
        frequency: m.frequencyField.value,
        purpose: m.purposeField.value
    }

    m.loadingOverlay.visible = true

    if m.medicationId <> ""
        m.saveTask.request = {
            endpoint: "/medications/" + m.medicationId,
            method: "PATCH",
            body: body
        }
    else
        m.saveTask.request = {
            endpoint: "/medications",
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
        msg = "Failed to save medication."
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
                OpenKeyboard("Medication Name", m.nameField.value, 0)
                handled = true
            else if m.focusedItem = 1
                OpenKeyboard("Dosage (e.g. 10mg)", m.dosageField.value, 1)
                handled = true
            else if m.focusedItem = 2
                OpenKeyboard("Frequency / Schedule", m.frequencyField.value, 2)
                handled = true
            else if m.focusedItem = 3
                OpenKeyboard("Purpose / Reason", m.purposeField.value, 3)
                handled = true
            else if m.focusedItem = 4
                SaveMedication()
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
