sub init()
    m.nameLabel = m.top.findNode("nameLabel")
    m.dobLabel = m.top.findNode("dobLabel")
    m.doctorsLabel = m.top.findNode("doctorsLabel")
    m.medsLabel = m.top.findNode("medsLabel")
    m.notesLabel = m.top.findNode("notesLabel")
    
    m.top.observeField("patientData", "OnPatientDataChange")
end sub

sub OnPatientDataChange()
    data = m.top.patientData
    if data <> invalid
        m.nameLabel.text = data.fullName
        m.dobLabel.text = "DOB: " + data.dateOfBirth
        m.doctorsLabel.text = "Doctors: " + data.doctors.count().toStr()
        m.medsLabel.text = "Medications: " + data.medications.count().toStr()
        m.notesLabel.text = "Notes: " + data.notes.count().toStr()
    end if
end sub

function onKeyEvent(key as String, press as Boolean) as Boolean
    handled = false
    if press
        if key = "back"
            m.top.closeRequest = true
            handled = true
        end if
    end if
    return handled
end function
