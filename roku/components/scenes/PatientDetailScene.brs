sub init()
    m.nameLabel = m.top.findNode("nameLabel")
    m.dobLabel = m.top.findNode("dobLabel")
    m.doctorsLabel = m.top.findNode("doctorsLabel")
    m.medsLabel = m.top.findNode("medsLabel")
    m.notesCountLabel = m.top.findNode("notesCountLabel")
    m.notesTextLabel = m.top.findNode("notesTextLabel")

    m.editFocusBorder = m.top.findNode("editFocusBorder")
    m.deleteFocusBorder = m.top.findNode("deleteFocusBorder")
    m.backFocusBorder = m.top.findNode("backFocusBorder")

    m.confirmDeleteDialog = m.top.findNode("confirmDeleteDialog")
    m.confirmDeleteDialog.observeField("confirmed", "OnConfirmDelete")

    m.deleteTask = m.top.findNode("deleteTask")
    m.deleteTask.observeField("response", "OnDeleteResponse")

    m.errorDialog = m.top.findNode("errorDialog")
    m.loadingOverlay = m.top.findNode("loadingOverlay")

    ' Focus: 0=Edit, 1=Delete, 2=Back
    m.focusedButton = 0
    UpdateFocus()
end sub

sub OnPatientDataChange()
    data = m.top.patientData
    if data <> invalid
        m.nameLabel.text = data.fullName

        dob = "Not specified"
        if data.dateOfBirth <> invalid and data.dateOfBirth <> ""
            dob = Left(data.dateOfBirth, 10)
        end if
        m.dobLabel.text = "DOB: " + dob

        dCount = 0
        if data.doctors <> invalid then dCount = data.doctors.count()
        m.doctorsLabel.text = "Doctors: " + dCount.toStr()

        mCount = 0
        if data.medications <> invalid then mCount = data.medications.count()
        m.medsLabel.text = "Medications: " + mCount.toStr()

        nCount = 0
        if data.notes <> invalid and type(data.notes) = "roArray" then nCount = data.notes.count()
        m.notesCountLabel.text = "Notes: " + nCount.toStr()

        if data.notes <> invalid and type(data.notes) = "roString" and data.notes <> ""
            m.notesTextLabel.text = data.notes
        else if data.notes <> invalid and type(data.notes) = "roArray" and data.notes.count() > 0
            m.notesTextLabel.text = data.notes[0].content
        else
            m.notesTextLabel.text = "No medical notes recorded for this patient."
        end if
    end if
end sub

sub UpdateFocus()
    m.editFocusBorder.visible = (m.focusedButton = 0)
    m.deleteFocusBorder.visible = (m.focusedButton = 1)
end sub

sub OpenEditForm()
    formScene = CreateObject("roSGNode", "PatientFormScene")
    formScene.patientData = m.top.patientData
    m.formView = formScene
    m.top.appendChild(m.formView)
    m.formView.setFocus(true)

    m.formView.observeField("saved", "OnFormSaved")
    m.formView.observeField("closeRequest", "OnFormClosed")
end sub

sub OnFormSaved()
    m.top.removeChild(m.formView)
    m.formView = invalid
    m.top.patientUpdated = true
end sub

sub OnFormClosed()
    m.top.removeChild(m.formView)
    m.formView = invalid
    m.top.setFocus(true)
    UpdateFocus()
end sub

sub OnConfirmDelete()
    if m.confirmDeleteDialog.confirmed and m.top.patientData <> invalid and m.top.patientData.id <> invalid
        m.loadingOverlay.visible = true
        m.deleteTask.request = {
            endpoint: "/patients/" + m.top.patientData.id,
            method: "DELETE"
        }
        m.deleteTask.control = "RUN"
    end if
end sub

sub OnDeleteResponse(event as Object)
    m.loadingOverlay.visible = false
    response = event.getData()
    if response <> invalid and (response.code = 200 or response.code = 204 or response.success = true)
        m.top.patientDeleted = true
    else
        msg = "Could not delete patient."
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
        if key = "right"
            if m.focusedButton < 1
                m.focusedButton = m.focusedButton + 1
                UpdateFocus()
                handled = true
            end if
        else if key = "left"
            if m.focusedButton > 0
                m.focusedButton = m.focusedButton - 1
                UpdateFocus()
                handled = true
            end if
        else if key = "OK"
            if m.focusedButton = 0
                OpenEditForm()
                handled = true
            else if m.focusedButton = 1
                m.confirmDeleteDialog.show = true
                handled = true
            end if
        else if key = "back"
            m.top.closeRequest = true
            handled = true
        end if
    end if
    return handled
end function
