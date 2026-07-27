sub init()
    m.formTitle = m.top.findNode("formTitle")
    m.nameField = m.top.findNode("nameField")
    m.dobField = m.top.findNode("dobField")
    m.genderField = m.top.findNode("genderField")
    m.notesField = m.top.findNode("notesField")

    m.saveFocusBorder = m.top.findNode("saveFocusBorder")
    m.cancelFocusBorder = m.top.findNode("cancelFocusBorder")
    m.saveBg = m.top.findNode("saveBg")
    m.cancelBg = m.top.findNode("cancelBg")

    m.saveTask = m.top.findNode("saveTask")
    m.saveTask.observeField("response", "OnSaveResponse")

    m.errorDialog = m.top.findNode("errorDialog")
    m.loadingOverlay = m.top.findNode("loadingOverlay")
    m.keyboardDialog = m.top.findNode("keyboardDialog")

    ' Focus state: 0=name, 1=dob, 2=gender, 3=notes, 4=saveBtn, 5=cancelBtn
    m.focusedItem = 0
    m.patientId = ""

    UpdateFocus()
end sub

sub OnPatientDataChange()
    data = m.top.patientData
    if data <> invalid and data.id <> invalid
        m.patientId = data.id
        m.formTitle.text = "Edit Patient: " + data.fullName
        if data.fullName <> invalid then m.nameField.value = data.fullName
        if data.dateOfBirth <> invalid then m.dobField.value = Left(data.dateOfBirth, 10)
        if data.gender <> invalid then m.genderField.value = data.gender
        if data.notes <> invalid then m.notesField.value = data.notes
    else
        m.patientId = ""
        m.formTitle.text = "Add New Patient"
    end if
end sub

sub UpdateFocus()
    m.nameField.isFocused = (m.focusedItem = 0)
    m.dobField.isFocused = (m.focusedItem = 1)
    m.genderField.isFocused = (m.focusedItem = 2)
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

    ' 0 is typically OK / Done in KeyboardDialog
    if buttonIdx = 0 or buttonIdx = invalid
        if m.editingFieldIndex = 0
            m.nameField.value = typedText
        else if m.editingFieldIndex = 1
            m.dobField.value = typedText
        else if m.editingFieldIndex = 2
            m.genderField.value = typedText
        else if m.editingFieldIndex = 3
            m.notesField.value = typedText
        end if
    end if

    UpdateFocus()
    m.top.setFocus(true)
end sub

sub SavePatient()
    name = m.nameField.value
    if name = invalid or Trim(name) = ""
        m.errorDialog.message = "Please enter the patient's full name."
        m.errorDialog.show = true
        return
    end if

    dob = m.dobField.value
    if dob = invalid or Trim(dob) = ""
        dob = "1960-01-01"
    end if

    gender = m.genderField.value
    notes = m.notesField.value

    body = {
        fullName: name,
        dateOfBirth: dob,
        gender: gender,
        notes: notes
    }

    m.loadingOverlay.visible = true

    if m.patientId <> ""
        ' Update existing patient
        m.saveTask.request = {
            endpoint: "/patients/" + m.patientId,
            method: "PATCH",
            body: body
        }
    else
        ' Create new patient
        m.saveTask.request = {
            endpoint: "/patients",
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
        msg = "Failed to save patient."
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
                OpenKeyboard("Enter Patient Full Name", m.nameField.value, 0)
                handled = true
            else if m.focusedItem = 1
                OpenKeyboard("Enter DOB (YYYY-MM-DD)", m.dobField.value, 1)
                handled = true
            else if m.focusedItem = 2
                OpenKeyboard("Enter Gender", m.genderField.value, 2)
                handled = true
            else if m.focusedItem = 3
                OpenKeyboard("Enter Notes", m.notesField.value, 3)
                handled = true
            else if m.focusedItem = 4
                SavePatient()
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
