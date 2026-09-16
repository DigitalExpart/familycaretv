sub init()
    m.formTitle = m.top.findNode("formTitle")
    m.formSubtitle = m.top.findNode("formSubtitle")
    m.cancelLabel = m.top.findNode("cancelLabel")
    m.saveLabel = m.top.findNode("saveLabel")
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
    m.patientId = ""

    ApplyLocalization()
    UpdateFocus()
    m.top.observeField("visible", "OnVisibleChange")
end sub

sub OnVisibleChange()
    if m.top.visible = true
        ApplyLocalization()
    end if
end sub

sub ApplyLocalization()
    if m.cancelLabel <> invalid then m.cancelLabel.text = GetStr("cancel")
    if m.saveLabel <> invalid then m.saveLabel.text = GetStr("save_med_btn")
    if m.formSubtitle <> invalid then m.formSubtitle.text = GetStr("med_form_sub")
    if m.nameField <> invalid then m.nameField.label = GetStr("med_name_label")
    if m.dosageField <> invalid then m.dosageField.label = GetStr("med_dosage_label")
    if m.frequencyField <> invalid then m.frequencyField.label = GetStr("med_frequency_label")
    if m.purposeField <> invalid then m.purposeField.label = GetStr("med_purpose_label")
    UpdateTitle()
end sub

sub UpdateTitle()
    if m.medicationId <> "" and m.currentMedName <> invalid and m.currentMedName <> ""
        m.formTitle.text = GetStr("edit_med_title") + ": " + m.currentMedName
    else
        m.formTitle.text = GetStr("add_med_title")
    end if
end sub

sub OnMedDataChange()
    data = m.top.medicationData
    if data <> invalid
        if data.patientId <> invalid then m.patientId = data.patientId
        if data.id <> invalid
            m.medicationId = data.id
            m.currentMedName = data.name
            UpdateTitle()
            if data.name <> invalid then m.nameField.value = data.name
            if data.dosage <> invalid then m.dosageField.value = data.dosage
            if data.frequency <> invalid then m.frequencyField.value = data.frequency
            if data.purpose <> invalid then m.purposeField.value = data.purpose
            return
        end if
    end if
    m.medicationId = ""
    m.currentMedName = ""
    UpdateTitle()
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
    m.keyboardDialog.observeField("wasClosed", "OnKeyboardClosed")
end sub

sub OnKeyboardClosed(event as Object)
    typedText = m.keyboardDialog.text
    m.keyboardDialog.visible = false

    if true
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
    if name = invalid then name = ""
    if name.Trim() = ""
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

    if m.patientId <> invalid and m.patientId <> ""
        body.patientId = m.patientId
    end if

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
