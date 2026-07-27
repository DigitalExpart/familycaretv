sub init()
    m.notesGrid = m.top.findNode("notesGrid")
    m.addBtnBg = m.top.findNode("addBtnBg")
    m.addBtnFocusBorder = m.top.findNode("addBtnFocusBorder")

    m.loadingOverlay = m.top.findNode("loadingOverlay")
    m.emptyState = m.top.findNode("emptyState")
    m.errorDialog = m.top.findNode("errorDialog")

    m.confirmDeleteDialog = m.top.findNode("confirmDeleteDialog")
    m.confirmDeleteDialog.observeField("confirmed", "OnConfirmDelete")

    m.notesTask = m.top.findNode("notesTask")
    m.notesTask.observeField("response", "OnNotesResponse")

    m.deleteTask = m.top.findNode("deleteTask")
    m.deleteTask.observeField("response", "OnDeleteResponse")

    m.notesGrid.observeField("itemSelected", "OnNoteSelected")

    m.focusZone = 1
    FetchNotes()
end sub

sub FetchNotes()
    m.loadingOverlay.visible = true
    m.emptyState.visible = false
    m.notesGrid.visible = false

    m.notesTask.request = {
        endpoint: "/roku/dashboard",
        method: "GET"
    }
    m.notesTask.control = "RUN"
end sub

sub OnNotesResponse(event as Object)
    m.loadingOverlay.visible = false
    response = event.getData()

    notesList = []
    if response <> invalid and response.code = 200 and response.data <> invalid
        if response.data.notes <> invalid
            notesList = response.data.notes
        else if type(response.data) = "roArray"
            notesList = response.data
        end if
    end if

    m.rawNotesData = notesList
    content = CreateObject("roSGNode", "ContentNode")

    for each note in notesList
        item = CreateObject("roSGNode", "ContentNode")
        item.title = note.title

        contentSnippet = ""
        if note.content <> invalid and note.content <> ""
            contentSnippet = Left(note.content, 45)
        end if
        item.shortDescriptionLine1 = contentSnippet
        item.HDPosterUrl = "pkg:/images/icon_notes.png"
        content.appendChild(item)
    end for

    if notesList.count() = 0
        m.emptyState.visible = true
        SetFocusZone(0)
    else
        m.notesGrid.content = content
        m.notesGrid.visible = true
        SetFocusZone(1)
    end if
end sub

sub SetFocusZone(zone as Integer)
    m.focusZone = zone
    m.addBtnFocusBorder.visible = (zone = 0)

    if zone = 0
        m.addBtnBg.color = "0xE0F2F1FF"
    else
        m.addBtnBg.color = "0x008F86FF"
        if m.notesGrid.visible
            m.notesGrid.setFocus(true)
        end if
    end if
end sub

sub OpenAddNoteForm(existingData = invalid)
    formScene = CreateObject("roSGNode", "NoteFormScene")
    if existingData <> invalid
        formScene.noteData = existingData
    end if
    m.activeSubScene = formScene
    m.top.appendChild(m.activeSubScene)
    m.activeSubScene.setFocus(true)

    m.activeSubScene.observeField("saved", "OnSubSceneSaved")
    m.activeSubScene.observeField("closeRequest", "OnSubSceneClosed")
end sub

sub OnNoteSelected()
    selectedIndex = m.notesGrid.itemSelected
    if selectedIndex >= 0 and selectedIndex < m.rawNotesData.count()
        selectedNote = m.rawNotesData[selectedIndex]
        OpenAddNoteForm(selectedNote)
    end if
end sub

sub OnConfirmDelete()
    if m.confirmDeleteDialog.confirmed and m.pendingDeleteId <> invalid and m.pendingDeleteId <> ""
        m.loadingOverlay.visible = true
        m.deleteTask.request = {
            endpoint: "/notes/" + m.pendingDeleteId,
            method: "DELETE"
        }
        m.deleteTask.control = "RUN"
    end if
end sub

sub OnDeleteResponse(event as Object)
    m.loadingOverlay.visible = false
    FetchNotes()
end sub

sub OnSubSceneSaved()
    if m.activeSubScene <> invalid
        m.top.removeChild(m.activeSubScene)
        m.activeSubScene = invalid
    end if
    FetchNotes()
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
                focusedIdx = m.notesGrid.itemFocused
                if focusedIdx < 4
                    SetFocusZone(0)
                    handled = true
                end if
            else if key = "options" or key = "*"
                focusedIdx = m.notesGrid.itemFocused
                if focusedIdx >= 0 and focusedIdx < m.rawNotesData.count()
                    m.pendingDeleteId = m.rawNotesData[focusedIdx].id
                    m.confirmDeleteDialog.show = true
                    handled = true
                end if
            else if key = "back"
                m.top.navigate = "HomeScene"
                handled = true
            end if
        else if m.focusZone = 0
            if key = "down" and m.notesGrid.visible
                SetFocusZone(1)
                handled = true
            else if key = "OK"
                OpenAddNoteForm(invalid)
                handled = true
            else if key = "back"
                m.top.navigate = "HomeScene"
                handled = true
            end if
        end if
    end if
    return handled
end function
