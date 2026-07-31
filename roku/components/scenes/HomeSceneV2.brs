sub init()
    m.loadingOverlay = m.top.findNode("loadingOverlay")
    
    m.sidebarNav = m.top.findNode("sidebarNav")
    m.navBadge = m.top.findNode("navBadge")
    
    m.dateLabel = m.top.findNode("dateLabel")
    m.greetingLabel = m.top.findNode("greetingLabel")
    m.clockLabel = m.top.findNode("clockLabel")
    
    m.statPatients = m.top.findNode("statPatients")
    m.statMeds = m.top.findNode("statMeds")
    m.statAppts = m.top.findNode("statAppts")
    m.statTasks = m.top.findNode("statTasks")
    
    m.quickActionsGrid = m.top.findNode("quickActionsGrid")
    
    m.clockTimer = m.top.findNode("clockTimer")
    m.clockTimer.observeField("fire", "UpdateClock")
    
    m.idleTimer = m.top.findNode("idleTimer")
    m.idleTimer.observeField("fire", "OnIdleTimeout")
    
    m.sidebarNav.observeField("itemSelected", "OnSidebarSelected")
    m.quickActionsGrid.observeField("itemSelected", "OnQuickActionSelected")
    
    SetupSidebar()
    SetupQuickActions()
    UpdateClock()
    
    ' Simulating dashboard fetch complete
    m.loadingOverlay.visible = false
    m.sidebarNav.setFocus(true)
    
    m.idleTimer.control = "start"
end sub

sub UpdateClock()
    date = CreateObject("roDateTime")
    date.ToLocalTime()
    months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    dayStr = date.GetWeekday()
    monthStr = months[date.GetMonth() - 1]
    
    m.dateLabel.text = dayStr + ", " + date.GetDay().ToStr() + " " + monthStr + " " + date.GetYear().ToStr()
    
    hour = date.GetHours()
    minute = date.GetMinutes()
    ampm = "AM"
    if hour >= 12
        ampm = "PM"
        if hour > 12 then hour = hour - 12
    end if
    if hour = 0 then hour = 12
    
    minStr = minute.ToStr()
    if minute < 10 then minStr = "0" + minStr
    
    m.clockLabel.text = hour.ToStr() + ":" + minStr + " " + ampm
end sub

sub SetupSidebar()
    navItems = [
        { title: "Home", icon: "pkg:/images/icon_settings.png", target: "HomeScene" },
        { title: "Patients", icon: "pkg:/images/icon_patients.png", target: "PatientsScene" },
        { title: "Calendar", icon: "pkg:/images/icon_calendar.png", target: "CalendarScene" },
        { title: "Medications", icon: "pkg:/images/icon_medications.png", target: "MedicationsScene" },
        { title: "Notes", icon: "pkg:/images/icon_notes.png", target: "NotesScene" },
        { title: "Music", icon: "pkg:/images/icon_music.png", target: "MusicScene" },
        { title: "Kids", icon: "pkg:/images/icon_kids.png", target: "KidsScene" },
        { title: "Pets", icon: "pkg:/images/icon_pets.png", target: "PetsScene" },
        { title: "Settings", icon: "pkg:/images/icon_settings.png", target: "SettingsScreen" }
    ]
    
    m.navTargets = []
    
    content = CreateObject("roSGNode", "ContentNode")
    for each item in navItems
        node = CreateObject("roSGNode", "ContentNode")
        node.title = item.title
        node.HDPosterUrl = item.icon
        content.appendChild(node)
        m.navTargets.Push(item.target)
    end for
    
    m.sidebarNav.content = content
end sub

sub SetupQuickActions()
    actions = [
        { title: "Patients", desc: "View & manage", icon: "pkg:/images/icon_patients.png", color: "0x00C9A7FF", target: "PatientsScene" },
        { title: "Calendar", desc: "Events & appointments", icon: "pkg:/images/icon_calendar.png", color: "0x8B5CF6FF", target: "CalendarScene" },
        { title: "Medications", desc: "Reminders & dosages", icon: "pkg:/images/icon_medications.png", color: "0xF59E0BFF", target: "MedicationsScene" },
        { title: "Music", desc: "Relaxing playlists", icon: "pkg:/images/icon_music.png", color: "0xF472B6FF", target: "MusicScene" },
        { title: "Kids", desc: "Coloring & activities", icon: "pkg:/images/icon_kids.png", color: "0xFB923CFF", target: "KidsScene" },
        { title: "Pets", desc: "Pet care tracker", icon: "pkg:/images/icon_pets.png", color: "0x4ADE80FF", target: "PetsScene" },
        { title: "Notes", desc: "Personal notes", icon: "pkg:/images/icon_notes.png", color: "0x60A5FAFF", target: "NotesScene" },
        { title: "Settings", desc: "App preferences", icon: "pkg:/images/icon_settings.png", color: "0x9CA3AFFF", target: "SettingsScreen" }
    ]
    
    m.actionTargets = []
    
    content = CreateObject("roSGNode", "ContentNode")
    for each item in actions
        node = CreateObject("roSGNode", "ContentNode")
        node.title = item.title
        node.shortDescriptionLine1 = item.desc
        node.shortDescriptionLine2 = item.color
        node.HDPosterUrl = item.icon
        content.appendChild(node)
        m.actionTargets.Push(item.target)
    end for
    
    m.quickActionsGrid.content = content
end sub

sub OnSidebarSelected()
    idx = m.sidebarNav.itemSelected
    if idx >= 0 and idx < m.navTargets.count()
        target = m.navTargets[idx]
        if target <> "HomeScene"
            m.top.navigate = target
        end if
    end if
end sub

sub OnQuickActionSelected()
    idx = m.quickActionsGrid.itemSelected
    if idx >= 0 and idx < m.actionTargets.count()
        m.top.navigate = m.actionTargets[idx]
    end if
end sub

sub OnIdleTimeout()
    m.top.navigate = "ScreensaverScene"
end sub

function onKeyEvent(key as String, press as Boolean) as Boolean
    handled = false
    if press
        m.idleTimer.control = "start"
        
        if key = "right" and m.sidebarNav.hasFocus()
            m.quickActionsGrid.setFocus(true)
            handled = true
        else if key = "left" and m.quickActionsGrid.hasFocus()
            m.sidebarNav.setFocus(true)
            handled = true
        else if key = "back"
            if m.quickActionsGrid.hasFocus()
                m.sidebarNav.setFocus(true)
                handled = true
            end if
        end if
    end if
    return handled
end function
