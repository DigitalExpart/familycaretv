sub init()
    m.loadingOverlay = m.top.findNode("loadingOverlay")
    
    m.sidebarNav = m.top.findNode("sidebarNav")
    m.navBadge = m.top.findNode("navBadge")
    
    m.dateLabel = m.top.findNode("dateLabel")
    m.greetingLabel = m.top.findNode("greetingLabel")
    
    m.statPatients = m.top.findNode("statPatients")
    m.statMeds = m.top.findNode("statMeds")
    m.statAppts = m.top.findNode("statAppts")
    m.statTasks = m.top.findNode("statTasks")
    
    m.verseText = m.top.findNode("verseText")
    m.verseRef = m.top.findNode("verseRef")
    
    m.apptName = m.top.findNode("apptName")
    m.apptTime = m.top.findNode("apptTime")
    m.medName = m.top.findNode("medName")
    m.medTime = m.top.findNode("medTime")
    
    m.quickActionsGrid = m.top.findNode("quickActionsGrid")
    
    m.notificationBanner = m.top.findNode("notificationBanner")
    m.notificationText = m.top.findNode("notificationText")
    
    m.notificationOverlay = m.top.findNode("notificationOverlay")
    m.overlayTitle = m.top.findNode("overlayTitle")
    m.overlayMsg = m.top.findNode("overlayMsg")
    m.slideInAnim = m.top.findNode("slideInAnim")
    m.slideOutAnim = m.top.findNode("slideOutAnim")
    m.notificationTimer = m.top.findNode("notificationTimer")
    m.notificationTimer.observeField("fire", "OnNotificationTimeout")
    
    m.dashboardTask = m.top.findNode("dashboardTask")
    m.dashboardTask.observeField("response", "OnDashboardData")
    
    m.clockTimer = m.top.findNode("clockTimer")
    m.clockTimer.observeField("fire", "UpdateClock")
    
    m.idleTimer = m.top.findNode("idleTimer")
    m.idleTimer.observeField("fire", "OnIdleTimeout")
    
    m.notificationTask = m.top.findNode("notificationTask")
    m.notificationTask.observeField("notification", "OnNewNotification")
    m.notificationTask.control = "RUN"
    
    m.sidebarNav.observeField("itemSelected", "OnSidebarSelected")
    m.quickActionsGrid.observeField("itemSelected", "OnQuickActionSelected")
    
    SetupSidebar()
    SetupQuickActions()
    UpdateClock()
    
    FetchDashboard()
    
    ' Reset idle timer on any key press
    m.idleTimer.control = "start"
end sub

sub UpdateClock()
    date = CreateObject("roDateTime")
    date.ToLocalTime()
    days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    
    dayStr = days[date.GetWeekday()]
    monthStr = months[date.GetMonth() - 1]
    
    m.dateLabel.text = dayStr + ", " + monthStr + " " + date.GetDay().ToStr() + ", " + date.GetYear().ToStr()
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
        { title: "Calendar", desc: "Events & appts", icon: "pkg:/images/icon_calendar.png", color: "0x8B5CF6FF", target: "CalendarScene" },
        { title: "Medications", desc: "Reminders", icon: "pkg:/images/icon_medications.png", color: "0xF59E0BFF", target: "MedicationsScene" },
        { title: "Music", desc: "Relaxing vibes", icon: "pkg:/images/icon_music.png", color: "0xEF4444FF", target: "MusicScene" },
        { title: "Kids", desc: "Coloring fun", icon: "pkg:/images/icon_kids.png", color: "0x8B5CF6FF", target: "KidsScene" },
        { title: "Pets", desc: "Care tracker", icon: "pkg:/images/icon_pets.png", color: "0x00C9A7FF", target: "PetsScene" },
        { title: "Notes", desc: "Personal notes", icon: "pkg:/images/icon_notes.png", color: "0x00C9A7FF", target: "NotesScene" },
        { title: "Settings", desc: "Preferences", icon: "pkg:/images/icon_settings.png", color: "0x6B7280FF", target: "SettingsScreen" }
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

sub FetchDashboard()
    m.loadingOverlay.visible = true
    m.dashboardTask.request = {
        endpoint: "/roku/dashboard",
        method: "GET"
    }
    m.dashboardTask.control = "RUN"
end sub

sub OnDashboardData(event as Object)
    m.loadingOverlay.visible = false
    response = event.getData()
    
    ' Update stats
    m.statPatients.text = "4"
    m.statMeds.text = "2"
    m.statAppts.text = "1"
    m.statTasks.text = "0"
    
    ' Update Verse
    m.verseText.text = """For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life."""
    m.verseRef.text = "- John 3:16"
    
    ' Set initial focus to sidebar
    m.sidebarNav.setFocus(true)
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

sub OnNewNotification(event as Object)
    notif = event.getData()
    if notif <> invalid
        m.navBadge.visible = true
        m.overlayTitle.text = notif.title
        m.overlayMsg.text = notif.message
        m.notificationOverlay.visible = true
        m.slideInAnim.control = "start"
        m.notificationTimer.control = "start"
    end if
end sub

sub OnNotificationTimeout()
    m.slideOutAnim.control = "start"
end sub

function onKeyEvent(key as String, press as Boolean) as Boolean
    handled = false
    if press
        ' Reset idle timer on any key press
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
