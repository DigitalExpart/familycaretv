sub init()
    m.pageTitle = m.top.findNode("pageTitle")
    m.nameLabel = m.top.findNode("nameLabel")
    m.dobLabel = m.top.findNode("dobLabel")
    m.doctorsLabel = m.top.findNode("doctorsLabel")
    m.medsLabel = m.top.findNode("medsLabel")
    m.notesCountLabel = m.top.findNode("notesCountLabel")
    m.notesSectionLabel = m.top.findNode("notesSectionLabel")
    m.notesTextLabel = m.top.findNode("notesTextLabel")
    m.editBtnLabel = m.top.findNode("editBtnLabel")
    m.deleteBtnLabel = m.top.findNode("deleteBtnLabel")

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
    ApplyLocalization()
    m.top.observeField("visible", "OnVisibleChange")
end sub

sub ApplyLocalization()
    if m.pageTitle <> invalid then m.pageTitle.text = GetStr("patient_detail_title")
    if m.editBtnLabel <> invalid then m.editBtnLabel.text = GetStr("edit_patient_btn")
    if m.deleteBtnLabel <> invalid then m.deleteBtnLabel.text = GetStr("delete_patient_btn")
    if m.notesSectionLabel <> invalid then m.notesSectionLabel.text = GetStr("medical_notes_section")
    if m.confirmDeleteDialog <> invalid
        m.confirmDeleteDialog.title = GetStr("confirm_delete_title")
        m.confirmDeleteDialog.message = GetStr("confirm_delete_msg")
        m.confirmDeleteDialog.confirmText = GetStr("confirm_delete_yes")
        m.confirmDeleteDialog.cancelText = GetStr("cancel")
    end if
    OnPatientDataChange()
end sub

sub OnVisibleChange()
    if m.top.visible = true
        ApplyLocalization()
    end if
end sub

sub OnPatientDataChange()
    data = m.top.patientData
    if data <> invalid
        m.nameLabel.text = data.fullName

        dob = GetStr("not_specified")
        if data.dateOfBirth <> invalid and data.dateOfBirth <> ""
            dob = Left(data.dateOfBirth, 10)
        end if
        m.dobLabel.text = GetStr("dob_prefix") + ": " + dob

        dCount = 0
        if data.doctors <> invalid then dCount = data.doctors.count()
        m.doctorsLabel.text = GetStr("doctors_prefix") + ": " + dCount.toStr()

        mCount = 0
        if data.medications <> invalid then mCount = data.medications.count()
        m.medsLabel.text = GetStr("medications_prefix") + ": " + mCount.toStr()

        nCount = 0
        if data.notes <> invalid and type(data.notes) = "roArray" then nCount = data.notes.count()
        m.notesCountLabel.text = GetStr("notes_prefix") + ": " + nCount.toStr()

        if data.notes <> invalid and type(data.notes) = "roString" and data.notes <> ""
            m.notesTextLabel.text = data.notes
        else if data.notes <> invalid and type(data.notes) = "roArray" and data.notes.count() > 0
            m.notesTextLabel.text = data.notes[0].content
        else
            m.notesTextLabel.text = GetStr("no_medical_notes")
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
        else if key = "OK" or key = "select" or key = "Select"
            if m.focusedButton = 0
                OpenEditForm()
                handled = true
            else if m.focusedButton = 1
                m.confirmDeleteDialog.show = true
                handled = true
            end if
        else if key = "back" or key = "Back"
            m.top.closeRequest = true
            handled = true
        end if
    end if
    return handled
end function
