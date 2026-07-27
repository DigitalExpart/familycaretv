sub init()
    m.formTitle = m.top.findNode("formTitle")
    m.titleField = m.top.findNode("titleField")
    m.dateField = m.top.findNode("dateField")
    m.typeField = m.top.findNode("typeField")
    m.descField = m.top.findNode("descField")

    m.saveFocusBorder = m.top.findNode("saveFocusBorder")
    m.cancelFocusBorder = m.top.findNode("cancelFocusBorder")

    m.saveTask = m.top.findNode("saveTask")
    m.saveTask.observeField("response", "OnSaveResponse")

    m.errorDialog = m.top.findNode("errorDialog")
    m.loadingOverlay = m.top.findNode("loadingOverlay")
    m.keyboardDialog = m.top.findNode("keyboardDialog")

    m.focusedItem = 0
    m.eventId = ""
    UpdateFocus()
end sub

sub OnEventDataChange()
    data = m.top.eventData
    if data <> invalid and data.id <> invalid
        m.eventId = data.id
        m.formTitle.text = "Edit Event: " + data.title
        if data.title <> invalid then m.titleField.value = data.title
        if data.startDateTime <> invalid then m.dateField.value = Left(data.startDateTime, 16)
        if data.type <> invalid then m.typeField.value = data.type
        if data.description <> invalid then m.descField.value = data.description
    else
        m.eventId = ""
        m.formTitle.text = "Add Calendar Event"
        m.typeField.value = "APPOINTMENT"
    end if
end sub

sub UpdateFocus()
    m.titleField.isFocused = (m.focusedItem = 0)
    m.dateField.isFocused = (m.focusedItem = 1)
    m.typeField.isFocused = (m.focusedItem = 2)
    m.descField.isFocused = (m.focusedItem = 3)

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
            m.titleField.value = typedText
        else if m.editingFieldIndex = 1
            m.dateField.value = typedText
        else if m.editingFieldIndex = 2
            m.typeField.value = UCase(typedText)
        else if m.editingFieldIndex = 3
            m.descField.value = typedText
        end if
    end if

    UpdateFocus()
    m.top.setFocus(true)
end sub

sub SaveEvent()
    title = m.titleField.value
    if title = invalid or Trim(title) = ""
        m.errorDialog.message = "Please enter an event title."
        m.errorDialog.show = true
        return
    end if

    dateStr = m.dateField.value
    if dateStr = invalid or Trim(dateStr) = ""
        now = CreateObject("roDateTime")
        dateStr = now.ToISOString()
    else if Len(dateStr) = 16
        dateStr = dateStr + ":00.000Z"
    end if

    eventType = m.typeField.value
    if eventType <> "MEDICATION" and eventType <> "TASK" and eventType <> "OTHER"
        eventType = "APPOINTMENT"
    end if

    body = {
        title: title,
        startDateTime: dateStr,
        type: eventType,
        description: m.descField.value
    }

    m.loadingOverlay.visible = true

    if m.eventId <> ""
        m.saveTask.request = {
            endpoint: "/events/" + m.eventId,
            method: "PATCH",
            body: body
        }
    else
        m.saveTask.request = {
            endpoint: "/events",
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
        msg = "Failed to save calendar event."
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
                OpenKeyboard("Event Title", m.titleField.value, 0)
                handled = true
            else if m.focusedItem = 1
                OpenKeyboard("Date & Time (YYYY-MM-DD HH:MM)", m.dateField.value, 1)
                handled = true
            else if m.focusedItem = 2
                OpenKeyboard("Event Type (APPOINTMENT, MEDICATION, TASK)", m.typeField.value, 2)
                handled = true
            else if m.focusedItem = 3
                OpenKeyboard("Description / Location", m.descField.value, 3)
                handled = true
            else if m.focusedItem = 4
                SaveEvent()
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
