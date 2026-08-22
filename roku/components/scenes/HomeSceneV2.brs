sub init()
    print "[HOME] init"
    m.loadingOverlay = m.top.findNode("loadingOverlay")
    
    m.sidebarNav = m.top.findNode("sidebarNav")
    m.navBadge = m.top.findNode("navBadge")
    
    m.dateLabel = m.top.findNode("dateLabel")
    m.timeLabel = m.top.findNode("timeLabel")
    m.greetingLabel = m.top.findNode("greetingLabel")
    
    m.statPatients = m.top.findNode("statPatients")
    m.statAppts = m.top.findNode("statAppts")
    m.statMeds = m.top.findNode("statMeds")
    m.statNotes = m.top.findNode("statNotes")
    
    m.alertText = m.top.findNode("alertText")
    m.alertCountdown = m.top.findNode("alertCountdown")
    m.verseText = m.top.findNode("verseText")
    m.verseRef = m.top.findNode("verseRef")
    
    m.featuredBookCard = m.top.findNode("featuredBookCard")
    m.quickActionsGrid = m.top.findNode("quickActionsGrid")
    
    m.clockTimer = m.top.findNode("clockTimer")
    m.clockTimer.observeField("fire", "UpdateClock")
    
    m.idleTimer = m.top.findNode("idleTimer")
    m.idleTimer.observeField("fire", "OnIdleTimeout")
    
    m.sidebarNav.observeField("itemSelected", "OnSidebarSelected")
    m.quickActionsGrid.observeField("itemSelected", "OnQuickActionSelected")
    
    if m.featuredBookCard <> invalid
        m.featuredBookCard.observeField("selected", "OnFeaturedBookSelected")
    end if
    
    m.dashboardTask = m.top.findNode("dashboardTask")
    if m.dashboardTask <> invalid
        m.dashboardTask.observeField("response", "OnDashboardResponse")
    end if
    
    SetupSidebar()
    SetupQuickActions()
    UpdateClock()
    
    m.idleTimer.control = "start"
    
    FetchDashboard()
end sub

function FormatCount(val as Dynamic) as String
    if val = invalid return "0"
    if type(val) = "roInt" or type(val) = "Integer" or type(val) = "roInteger"
        return StrI(val).Trim()
    else if type(val) = "roFloat" or type(val) = "Float" or type(val) = "Double"
        return StrI(Int(val)).Trim()
    else if type(val) = "roString" or type(val) = "String"
        return val
    end if
    return "0"
end function

sub FetchDashboard()
    token = getToken()
    hasToken = (token <> "" and token <> invalid)
    print "[AUTH] Token present = "; hasToken
    if not hasToken
        print "[HOME] No token found -> Route to DeviceLinkScene"
        m.top.navigate = "DeviceLinkScene"
        return
    end if

    print "[HOME] starting dashboard fetch"
    m.loadingOverlay.visible = true
    if m.dashboardTask <> invalid
        m.dashboardTask.request = {
            endpoint: "/roku/dashboard",
            method: "GET"
        }
        m.dashboardTask.control = "RUN"
    end if
end sub

sub OnDashboardResponse(event as Object)
    print "[HOME] dashboard result observer fired = true"
    m.loadingOverlay.visible = false
    m.sidebarNav.setFocus(true)

    response = event.getData()
    if response = invalid
        print "[HOME] result success = false (null response)"
        m.alertText.text = "Unable to refresh FamilyCare data. Press * to retry."
        return
    end if

    print "[API] HTTP status = "; response.code
    resultSuccess = (response.code = 200 and response.data <> invalid)
    print "[HOME] result success = "; resultSuccess

    if response.code = 401 or response.code = 403
        print "[AUTH] Unauthorized response (401/403) -> Clear tokens and navigate to DeviceLinkScene"
        clearAllTokens()
        m.top.navigate = "DeviceLinkScene"
        return
    end if

    if resultSuccess
        data = response.data

        ' 1. User Greeting
        if data.userName <> invalid and data.userName <> ""
            m.greetingLabel.text = "Welcome, " + data.userName
        else if data.user <> invalid and data.user.firstName <> invalid
            m.greetingLabel.text = "Welcome, " + data.user.firstName
        else
            m.greetingLabel.text = "Welcome Home"
        end if

        ' 2. Quick Stats: Patients, Appointments, Medications, Notes
        if data.stats <> invalid
            stats = data.stats
            print "[HOME] applying stats"
            if stats.patients <> invalid then m.statPatients.text = FormatCount(stats.patients)
            if stats.appointments <> invalid then m.statAppts.text = FormatCount(stats.appointments)
            if stats.medications <> invalid then m.statMeds.text = FormatCount(stats.medications)
            if stats.notes <> invalid then m.statNotes.text = FormatCount(stats.notes)
            print "[API] stats.patients="; m.statPatients.text; " appointments="; m.statAppts.text; " medications="; m.statMeds.text; " notes="; m.statNotes.text
        else
            if data.patientCount <> invalid then m.statPatients.text = FormatCount(data.patientCount)
            if data.eventsCount <> invalid then m.statAppts.text = FormatCount(data.eventsCount)
            if data.medsCount <> invalid then m.statMeds.text = FormatCount(data.medsCount)
            if data.notesCount <> invalid then m.statNotes.text = FormatCount(data.notesCount)
            print "[HOME] applying fallback counts (patients="; m.statPatients.text; ")"
        end if

        ' 3. Upcoming Appointment Alert Bar
        if data.upcomingAppointment <> invalid and data.upcomingAppointment <> ""
            appt = data.upcomingAppointment
            if appt.displayTitle <> invalid and appt.displayTime <> invalid
                m.alertText.text = appt.displayTitle + " · " + appt.displayTime
            else if appt.title <> invalid
                m.alertText.text = "Upcoming — " + appt.title
            end if

            if appt.relativeTime <> invalid and appt.relativeTime <> ""
                m.alertCountdown.text = appt.relativeTime
            else
                m.alertCountdown.text = ""
            end if
        else
            m.alertText.text = "No upcoming appointments scheduled"
            m.alertCountdown.text = ""
        end if

        ' 4. Verse of the Day
        if data.verseOfTheDay <> invalid
            v = data.verseOfTheDay
            if v.verse <> invalid and v.verse <> ""
                m.verseText.text = Chr(34) + v.verse + Chr(34)
            else if v.text <> invalid and v.text <> ""
                m.verseText.text = Chr(34) + v.text + Chr(34)
            end if

            if v.reference <> invalid and v.reference <> ""
                m.verseRef.text = "— " + v.reference
            end if
        end if

        ' 5. Featured Book Auto-Populate
        if data.books <> invalid and type(data.books) = "roArray" and data.books.count() > 0
            if m.featuredBookCard <> invalid
                m.featuredBookCard.currentBook = data.books[0]
            end if
        end if

        ' 6. Device Status Badge
        if m.navBadge <> invalid
            m.navBadge.text = "Account Connected"
        end if
    else
        print "[API ERROR] Failed to fetch /roku/dashboard (code: "; response.code; ")"
        m.alertText.text = "Unable to refresh FamilyCare data. Press * to retry."
        m.alertCountdown.text = ""
        m.statPatients.text = "—"
        m.statAppts.text = "—"
        m.statMeds.text = "—"
        m.statNotes.text = "—"
    end if
end sub

sub UpdateClock()
    date = CreateObject("roDateTime")
    date.ToLocalTime()
    months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    
    dayStr = weekdays[date.GetDayOfWeek()]
    monthStr = months[date.GetMonth() - 1]
    
    formattedDate = dayStr + ", " + StrI(date.GetDayOfMonth()).Trim() + " " + monthStr + " " + StrI(date.GetYear()).Trim()
    
    hour = date.GetHours()
    minute = date.GetMinutes()
    ampm = "AM"
    if hour >= 12
        ampm = "PM"
        if hour > 12 then hour = hour - 12
    end if
    if hour = 0 then hour = 12
    
    minStr = StrI(minute).Trim()
    if minute < 10 then minStr = "0" + minStr
    
    timeStr = StrI(hour).Trim() + ":" + minStr + " " + ampm
    
    if m.dateLabel <> invalid
        m.dateLabel.text = formattedDate
    end if
    
    if m.timeLabel <> invalid
        m.timeLabel.text = timeStr
    end if
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
        node.addFields({ isActive: (item.title = "Home") })
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

sub OnFeaturedBookSelected()
    m.top.navigate = "BooksScreen"
end sub

sub OnIdleTimeout()
    m.top.navigate = "ScreensaverScene"
end sub

function onKeyEvent(key as String, press as Boolean) as Boolean
    handled = false
    if press
        m.idleTimer.control = "start"
        
        if key = "options" ' * button pressed
            FetchDashboard()
            return true
        end if

        if m.sidebarNav.hasFocus()
            if key = "right"
                m.quickActionsGrid.setFocus(true)
                handled = true
            end if
        else if m.featuredBookCard <> invalid and m.featuredBookCard.hasFocus()
            if key = "right"
                m.quickActionsGrid.setFocus(true)
                handled = true
            else if key = "left" or key = "back" or key = "up"
                m.sidebarNav.setFocus(true)
                handled = true
            end if
        else if m.quickActionsGrid.hasFocus()
            if key = "left"
                itemFocused = m.quickActionsGrid.itemFocused
                if itemFocused MOD 4 = 0 and itemFocused >= 4 and m.featuredBookCard <> invalid
                    m.featuredBookCard.setFocus(true)
                else
                    m.sidebarNav.setFocus(true)
                end if
                handled = true
            else if key = "back"
                m.sidebarNav.setFocus(true)
                handled = true
            end if
        end if
    end if
    return handled
end function
