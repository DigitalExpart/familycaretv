sub init()
    m.formTitle = m.top.findNode("formTitle")
    m.titleField = m.top.findNode("titleField")
    m.categoryField = m.top.findNode("categoryField")
    m.contentField = m.top.findNode("contentField")

    m.saveFocusBorder = m.top.findNode("saveFocusBorder")
    m.cancelFocusBorder = m.top.findNode("cancelFocusBorder")

    m.saveTask = m.top.findNode("saveTask")
    m.saveTask.observeField("response", "OnSaveResponse")

    m.errorDialog = m.top.findNode("errorDialog")
    m.loadingOverlay = m.top.findNode("loadingOverlay")
    m.keyboardDialog = m.top.findNode("keyboardDialog")

    m.focusedItem = 0
    m.noteId = ""
    m.patientId = ""
    UpdateFocus()
end sub

sub OnNoteDataChange()
    data = m.top.noteData
    if data <> invalid
        if data.patientId <> invalid then m.patientId = data.patientId
        if data.id <> invalid
            m.noteId = data.id
            m.formTitle.text = "Edit Note: " + data.title
            if data.title <> invalid then m.titleField.value = data.title
            if data.category <> invalid and m.categoryField <> invalid then m.categoryField.value = data.category
            if data.content <> invalid then m.contentField.value = data.content
            return
        end if
    end if
    m.noteId = ""
    m.formTitle.text = "Add Personal Note"
end sub

sub UpdateFocus()
    m.titleField.isFocused = (m.focusedItem = 0)
    if m.categoryField <> invalid
        m.categoryField.isFocused = (m.focusedItem = 1)
    end if
    m.contentField.isFocused = (m.focusedItem = 2)

    m.saveFocusBorder.visible = (m.focusedItem = 3)
    m.cancelFocusBorder.visible = (m.focusedItem = 4)
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

    if m.editingFieldIndex = 0
        m.titleField.value = typedText
    else if m.editingFieldIndex = 1
        if m.categoryField <> invalid then m.categoryField.value = typedText
    else if m.editingFieldIndex = 2
        m.contentField.value = typedText
    end if

    UpdateFocus()
    m.top.setFocus(true)
end sub

sub SaveNote()
    title = m.titleField.value
    if title = invalid then title = ""
    if title.Trim() = ""
        m.errorDialog.message = "Please enter a note title."
        m.errorDialog.show = true
        return
    end if

    content = m.contentField.value
    if content = invalid then content = ""
    if content.Trim() = ""
        m.errorDialog.message = "Please enter note content."
        m.errorDialog.show = true
        return
    end if

    body = {
        title: title,
        content: content
    }

    if m.patientId <> invalid and m.patientId <> ""
        body.patientId = m.patientId
    end if

    m.loadingOverlay.visible = true

    if m.noteId <> ""
        m.saveTask.request = {
            endpoint: "/notes/" + m.noteId,
            method: "PATCH",
            body: body
        }
    else
        m.saveTask.request = {
            endpoint: "/notes",
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
        msg = "Failed to save note."
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
            if m.focusedItem < 4
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
            if m.focusedItem = 3
                m.focusedItem = 4
                UpdateFocus()
                handled = true
            end if
        else if key = "left"
            if m.focusedItem = 4
                m.focusedItem = 3
                UpdateFocus()
                handled = true
            end if
        else if key = "OK"
            if m.focusedItem = 0
                OpenKeyboard("Note Title", m.titleField.value, 0)
                handled = true
            else if m.focusedItem = 1
                catVal = ""
                if m.categoryField <> invalid and m.categoryField.value <> invalid
                    catVal = m.categoryField.value
                end if
                OpenKeyboard("Category", catVal, 1)
                handled = true
            else if m.focusedItem = 2
                OpenKeyboard("Note Content", m.contentField.value, 2)
                handled = true
            else if m.focusedItem = 3
                SaveNote()
                handled = true
            else if m.focusedItem = 4
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
