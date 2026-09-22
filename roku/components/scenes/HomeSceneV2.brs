sub init()
    print "[HOME] initialized"
    m.loadingOverlay = m.top.findNode("loadingOverlay")
    m.loadingLabel = m.top.findNode("loadingLabel")

    m.sidebarNav = m.top.findNode("sidebarNav")
    m.homeActiveCard = m.top.findNode("homeActiveCard")
    m.navBadge = m.top.findNode("navBadge")

    m.dateLabel = m.top.findNode("dateLabel")
    m.timeLabel = m.top.findNode("timeLabel")
    m.greetingLabel = m.top.findNode("greetingLabel")
    m.greetingSub = m.top.findNode("greetingSub")

    m.statPatients = m.top.findNode("statPatients")
    m.statAppts = m.top.findNode("statAppts")
    m.statMeds = m.top.findNode("statMeds")
    m.statNotes = m.top.findNode("statNotes")

    m.alertIcon = m.top.findNode("alertIcon")
    m.alertText = m.top.findNode("alertText")
    m.alertCountdown = m.top.findNode("alertCountdown")
    m.verseText = m.top.findNode("verseText")
    m.verseRef = m.top.findNode("verseRef")

    m.featuredBookCard = m.top.findNode("featuredBookCard")
    m.quickActionsGrid = m.top.findNode("quickActionsGrid")

    ' Timers
    m.clockTimer = m.top.findNode("clockTimer")
    m.clockTimer.observeField("fire", "UpdateClock")

    m.idleTimer = m.top.findNode("idleTimer")
    m.idleTimer.observeField("fire", "OnIdleTimeout")

    m.scheduleRotatorTimer = m.top.findNode("scheduleRotatorTimer")
    m.scheduleRotatorTimer.observeField("fire", "RotateScheduleItem")

    ' Schedule rotator state
    m.todaySchedule = []
    m.scheduleIndex = 0
    m.lastDateStr = ""

    ' Navigation
    m.sidebarNav.observeField("itemSelected", "OnSidebarSelected")
    m.quickActionsGrid.observeField("itemSelected", "OnQuickActionSelected")

    if m.featuredBookCard <> invalid
        m.featuredBookCard.observeField("selected", "OnFeaturedBookSelected")
    end if

    m.dashboardTask = m.top.findNode("dashboardTask")
    if m.dashboardTask <> invalid
        m.dashboardTask.observeField("response", "OnDashboardResponse")
    end if

    m.calendarScheduleTask = m.top.findNode("calendarScheduleTask")
    if m.calendarScheduleTask <> invalid
        m.calendarScheduleTask.observeField("response", "OnCalendarScheduleResponse")
    end if

    ' Apply localized text to section labels and static UI
    ApplyLocalization()
    SetupSidebar()
    SetupQuickActions()
    UpdateClock()
    UpdateSidebarFocus("sidebar")

    m.idleTimer.control = "start"
    m.top.observeField("visible", "OnVisibleChange")

    FetchDashboard()
end sub

sub ApplyLocalization()
    ' Update any node we can address for language
    if m.greetingSub <> invalid
        m.greetingSub.text = GetStr("Home_Subtitle")
    end if
    if m.loadingLabel <> invalid
        m.loadingLabel.text = GetStr("Home_LoadingDash")
    end if
    if m.navBadge <> invalid
        m.navBadge.text = GetStr("Home_AccountConn")
    end if

    ' Section labels
    verseLbl = m.top.findNode("verseSectionLabel")
    if verseLbl <> invalid then verseLbl.text = GetStr("Home_VerseSection")
    bookLbl = m.top.findNode("bookSectionLabel")
    if bookLbl <> invalid then bookLbl.text = GetStr("Home_BookSection")
    actLbl = m.top.findNode("actionsSectionLabel")
    if actLbl <> invalid then actLbl.text = GetStr("Home_ActionsSection")

    ' Stat badges (PATIENTS / PACIENTES, etc.)
    pLbl = m.top.findNode("statPatientsLabel")
    if pLbl <> invalid then pLbl.text = GetStr("Stats_Patients")
    aLbl = m.top.findNode("statApptsLabel")
    if aLbl <> invalid then aLbl.text = GetStr("Stats_Appointments")
    mLbl = m.top.findNode("statMedsLabel")
    if mLbl <> invalid then mLbl.text = GetStr("Stats_Medications")
    nLbl = m.top.findNode("statNotesLabel")
    if nLbl <> invalid then nLbl.text = GetStr("Stats_Notes")

    ' Featured Book Card Button
    if m.featuredBookCard <> invalid
        fBtn = m.featuredBookCard.findNode("btnText")
        if fBtn <> invalid then fBtn.text = GetStr("Featured_Book_Btn")
    end if
end sub

sub OnVisibleChange()
    if m.top.visible = true
        ApplyLocalization()
        SetupSidebar()
        SetupQuickActions()
        UpdateClock()
        UpdateSidebarFocus("sidebar")
        FetchDashboard()
    end if
end sub

function FormatCount(val as Dynamic) as String
    if val = invalid then return "0"
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

    now = CreateObject("roDateTime")
    now.ToLocalTime()
    yearStr = StrI(now.GetYear()).Trim()
    monthStr = StrI(now.GetMonth()).Trim()
    if now.GetMonth() < 10 then monthStr = "0" + monthStr
    dayStr = StrI(now.GetDayOfMonth()).Trim()
    if now.GetDayOfMonth() < 10 then dayStr = "0" + dayStr
    m.currentDateStr = yearStr + "-" + monthStr + "-" + dayStr

    print "[HOME] starting dashboard fetch for date = "; m.currentDateStr
    m.loadingOverlay.visible = true
    m.alertText.text = GetStr("Home_Loading")
    m.alertCountdown.text = ""
    if m.dashboardTask <> invalid
        m.dashboardTask.request = {
            endpoint: "/roku/dashboard?date=" + m.currentDateStr,
            method: "GET"
        }
        m.dashboardTask.control = "RUN"
    end if
end sub

sub OnDashboardResponse(event as Object)
    print "[HOME] dashboard result observer fired = true"
    m.loadingOverlay.visible = false
    UpdateSidebarFocus(m.focusSection)

    response = event.getData()
    if response = invalid
        print "[HOME] result success = false (null response)"
        m.alertText.text = GetStr("Home_ErrorFetch")
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
            m.greetingLabel.text = GetStr("Home_WelcomeUser") + data.userName
        else if data.user <> invalid and data.user.firstName <> invalid
            m.greetingLabel.text = GetStr("Home_WelcomeUser") + data.user.firstName
        else
            m.greetingLabel.text = GetStr("Home_WelcomeHome")
        end if

        ' 2. Quick Stats: Patients, Appointments, Medications, Notes
        if data.stats <> invalid
            stats = data.stats
            print "[HOME] applying stats"
            if stats.patients <> invalid then m.statPatients.text = FormatCount(stats.patients)
            if stats.appointments <> invalid then m.statAppts.text = FormatCount(stats.appointments)
            if stats.medications <> invalid then m.statMeds.text = FormatCount(stats.medications)
            if stats.notes <> invalid then m.statNotes.text = FormatCount(stats.notes)
        else
            if data.patientCount <> invalid then m.statPatients.text = FormatCount(data.patientCount)
            if data.eventsCount <> invalid then m.statAppts.text = FormatCount(data.eventsCount)
            if data.medsCount <> invalid then m.statMeds.text = FormatCount(data.medsCount)
            if data.notesCount <> invalid then m.statNotes.text = FormatCount(data.notesCount)
        end if

        ' 3. Today's Schedule Rotator — load todaySchedule array
        m.todaySchedule = []
        m.scheduleIndex = 0
        hasTodaySchedule = (data.todaySchedule <> invalid and type(data.todaySchedule) = "roArray")
        todayCount = 0
        if hasTodaySchedule
            m.todaySchedule = data.todaySchedule
            todayCount = m.todaySchedule.count()
        end if

        print "[HOME] todaySchedule present="; hasTodaySchedule; " count="; todayCount

        if todayCount = 0 and m.calendarScheduleTask <> invalid
            ' Live fallback to Calendar aggregator for today if dashboard returned 0
            startDate = m.currentDateStr + "T00:00:00.000Z"
            endDate = m.currentDateStr + "T23:59:59.999Z"
            print "[HOME] querying calendar aggregator fallback for date = "; m.currentDateStr
            m.calendarScheduleTask.request = {
                endpoint: "/roku/calendar?startDate=" + startDate + "&endDate=" + endDate,
                method: "GET"
            }
            m.calendarScheduleTask.control = "RUN"
        else
            ' Show first item immediately (don't wait for first timer fire)
            RotateScheduleItem()

            ' Start the rotator timer only if there's more than one item to cycle through
            if m.todaySchedule.count() > 1
                m.scheduleRotatorTimer.control = "start"
            else
                m.scheduleRotatorTimer.control = "stop"
            end if
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
            m.navBadge.text = GetStr("Home_AccountConn")
        end if
    else
        print "[API ERROR] Failed to fetch /roku/dashboard (code: "; response.code; ")"
        m.alertText.text = GetStr("Home_ErrorFetch")
        m.alertCountdown.text = ""
        m.statPatients.text = "—"
        m.statAppts.text = "—"
        m.statMeds.text = "—"
        m.statNotes.text = "—"
    end if
end sub

sub OnCalendarScheduleResponse(event as Object)
    res = event.getData()
    if res <> invalid and res.code = 200 and res.data <> invalid
        eventsList = []
        if type(res.data) = "roArray"
            eventsList = res.data
        else if res.data.events <> invalid and type(res.data.events) = "roArray"
            eventsList = res.data.events
        end if

        todayItems = []
        tYear = Val(Left(m.currentDateStr, 4))
        tMonth = Val(Mid(m.currentDateStr, 6, 2))
        tDay = Val(Mid(m.currentDateStr, 9, 2))

        for each evt in eventsList
            itemDateStr = ""
            if evt.startDateTime <> invalid
                itemDateStr = evt.startDateTime
            else if evt.startAt <> invalid
                itemDateStr = evt.startAt
            else if evt.date <> invalid
                itemDateStr = evt.date
            end if

            isMatch = false
            if itemDateStr <> ""
                evtYear = Val(Left(itemDateStr, 4))
                evtMonth = Val(Mid(itemDateStr, 6, 2))
                evtDay = Val(Mid(itemDateStr, 9, 2))
                if evtYear = tYear and evtMonth = tMonth and evtDay = tDay
                    isMatch = true
                else if Left(itemDateStr, 10) = m.currentDateStr
                    isMatch = true
                end if
            else
                ' If no date property exists but backend returned it for this single day query, include it
                isMatch = true
            end if

            if isMatch
                timeFormatted = "All Day"
                if evt.time <> invalid and evt.time <> ""
                    timeFormatted = evt.time
                else if itemDateStr <> "" and Len(itemDateStr) >= 16
                    hours = Val(Mid(itemDateStr, 12, 2))
                    mins = Mid(itemDateStr, 15, 2)
                    ampm = "AM"
                    if hours >= 12
                        ampm = "PM"
                        if hours > 12 then hours = hours - 12
                    else if hours = 0
                        hours = 12
                    end if
                    timeFormatted = StrI(hours).Trim() + ":" + mins + " " + ampm
                end if

                todayItems.push({
                    title: evt.title,
                    time: timeFormatted,
                    type: evt.type,
                    category: evt.category
                })
            end if
        end for

        ' If date-filter was slightly off due to UTC conversion, use all returned events from the single-day query
        if todayItems.count() = 0 and eventsList.count() > 0
            for each evt in eventsList
                timeFormatted = "All Day"
                if evt.time <> invalid and evt.time <> ""
                    timeFormatted = evt.time
                else if evt.startDateTime <> invalid and Len(evt.startDateTime) >= 16
                    hours = Val(Mid(evt.startDateTime, 12, 2))
                    mins = Mid(evt.startDateTime, 15, 2)
                    ampm = "AM"
                    if hours >= 12
                        ampm = "PM"
                        if hours > 12 then hours = hours - 12
                    else if hours = 0
                        hours = 12
                    end if
                    timeFormatted = StrI(hours).Trim() + ":" + mins + " " + ampm
                end if
                todayItems.push({
                    title: evt.title,
                    time: timeFormatted,
                    type: evt.type,
                    category: evt.category
                })
            end for
        end if

        if todayItems.count() > 0
            m.todaySchedule = todayItems
            m.scheduleIndex = 0
            print "[HOME] calendar schedule fallback resolved items count = "; m.todaySchedule.count()
            RotateScheduleItem()
            if m.todaySchedule.count() > 1
                m.scheduleRotatorTimer.control = "start"
            else
                m.scheduleRotatorTimer.control = "stop"
            end if
        else
            RotateScheduleItem()
        end if
    else
        RotateScheduleItem()
    end if
end sub

' ─────────────────────────────────────────────────────────────────────────────
' Schedule Rotator — cycles through all of today's items in the alert bar
' ─────────────────────────────────────────────────────────────────────────────
sub RotateScheduleItem()
    if m.todaySchedule = invalid or m.todaySchedule.count() = 0
        m.alertText.text = GetStr("Home_NoSchedule")
        m.alertCountdown.text = ""
        if m.alertIcon <> invalid
            m.alertIcon.uri = "pkg:/images/icon_calendar.png"
            m.alertIcon.blendColor = "0xB45309FF"
        end if
        return
    end if

    ' Wrap index
    if m.scheduleIndex >= m.todaySchedule.count()
        m.scheduleIndex = 0
    end if

    item = m.todaySchedule[m.scheduleIndex]
    m.scheduleIndex = m.scheduleIndex + 1

    ' Build display text
    itemType = ""
    if item.type <> invalid then itemType = UCase(item.type)
    if item.category <> invalid and itemType = "" then itemType = UCase(item.category)

    displayTitle = ""
    if item.title <> invalid then displayTitle = item.title

    displayTime = ""
    if item.time <> invalid and item.time <> "" then displayTime = item.time

    if displayTime <> ""
        m.alertText.text = displayTitle + " · " + displayTime
    else
        m.alertText.text = displayTitle
    end if

    ' Progress indicator e.g. "2 / 5"
    totalCount = m.todaySchedule.count()
    m.alertCountdown.text = StrI(m.scheduleIndex).Trim() + " / " + StrI(totalCount).Trim()

    ' Swap icon + tint colour per item type
    if m.alertIcon <> invalid
        if itemType = "MEDICATION" or itemType = "PET_MEDICATION"
            m.alertIcon.uri = "pkg:/images/icon_medications.png"
            m.alertIcon.blendColor = "0xF59E0BFF"
        else if itemType = "TASK" or itemType = "KIDS_TASK" or itemType = "PET_TASK"
            m.alertIcon.uri = "pkg:/images/icon_notes.png"
            m.alertIcon.blendColor = "0x60A5FAFF"
        else if itemType = "PET_VACCINATION"
            m.alertIcon.uri = "pkg:/images/icon_pets.png"
            m.alertIcon.blendColor = "0x4ADE80FF"
        else if itemType = "KIDS_EVENT"
            m.alertIcon.uri = "pkg:/images/icon_kids.png"
            m.alertIcon.blendColor = "0xFB923CFF"
        else
            ' Default: calendar (APPOINTMENT / EVENT)
            m.alertIcon.uri = "pkg:/images/icon_calendar.png"
            m.alertIcon.blendColor = "0xB45309FF"
        end if
    end if
end sub

' ─────────────────────────────────────────────────────────────────────────────
' Clock — also detects date change and re-fetches when the calendar day rolls over
' ─────────────────────────────────────────────────────────────────────────────
sub UpdateClock()
    date = CreateObject("roDateTime")
    date.ToLocalTime()
    lang = ReadLanguagePref()
    if lang = "ES"
        months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
        weekdays = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
        formattedDate = weekdays[date.GetDayOfWeek()] + ", " + StrI(date.GetDayOfMonth()).Trim() + " de " + months[date.GetMonth() - 1] + " " + StrI(date.GetYear()).Trim()
    else
        months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        formattedDate = weekdays[date.GetDayOfWeek()] + ", " + StrI(date.GetDayOfMonth()).Trim() + " " + months[date.GetMonth() - 1] + " " + StrI(date.GetYear()).Trim()
    end if

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

    ' Detect calendar day change → re-fetch today's schedule
    currentDateStr = StrI(date.GetYear()).Trim() + "-" + StrI(date.GetMonth()).Trim() + "-" + StrI(date.GetDayOfMonth()).Trim()
    if m.lastDateStr <> "" and m.lastDateStr <> currentDateStr
        print "[HOME] Calendar day changed (" + m.lastDateStr + " -> " + currentDateStr + ") - re-fetching dashboard"
        FetchDashboard()
    end if
    m.lastDateStr = currentDateStr
end sub

sub SetupSidebar()
    navItems = [
        { title: GetStr("Nav_Home"),        icon: "pkg:/images/icon_settings.png",   target: "HomeScene" },
        { title: GetStr("Nav_Patients"),    icon: "pkg:/images/icon_patients.png",   target: "PatientsScene" },
        { title: GetStr("Nav_Calendar"),    icon: "pkg:/images/icon_calendar.png",   target: "CalendarScene" },
        { title: GetStr("Nav_Medications"), icon: "pkg:/images/icon_medications.png", target: "MedicationsScene" },
        { title: GetStr("Nav_Notes"),       icon: "pkg:/images/icon_notes.png",      target: "NotesScene" },
        { title: GetStr("Nav_Music"),       icon: "pkg:/images/icon_music.png",      target: "MusicScene" },
        { title: GetStr("Nav_Kids"),        icon: "pkg:/images/icon_kids.png",       target: "KidsScene" },
        { title: GetStr("Nav_Pets"),        icon: "pkg:/images/icon_pets.png",       target: "PetsScene" },
        { title: GetStr("Nav_Settings"),    icon: "pkg:/images/icon_settings.png",   target: "SettingsScreen" }
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
        { title: GetStr("Nav_Patients"),    desc: GetStr("QA_Patients_Desc"),    icon: "pkg:/images/icon_patients.png",    color: "0x00C9A7FF", target: "PatientsScene" },
        { title: GetStr("Nav_Calendar"),    desc: GetStr("QA_Calendar_Desc"),    icon: "pkg:/images/icon_calendar.png",    color: "0x8B5CF6FF", target: "CalendarScene" },
        { title: GetStr("Nav_Medications"), desc: GetStr("QA_Medications_Desc"), icon: "pkg:/images/icon_medications.png", color: "0xF59E0BFF", target: "MedicationsScene" },
        { title: GetStr("Nav_Music"),       desc: GetStr("QA_Music_Desc"),       icon: "pkg:/images/icon_music.png",       color: "0xF472B6FF", target: "MusicScene" },
        { title: GetStr("Nav_Kids"),        desc: GetStr("QA_Kids_Desc"),        icon: "pkg:/images/icon_kids.png",        color: "0xFB923CFF", target: "KidsScene" },
        { title: GetStr("Nav_Pets"),        desc: GetStr("QA_Pets_Desc"),        icon: "pkg:/images/icon_pets.png",        color: "0x4ADE80FF", target: "PetsScene" },
        { title: GetStr("Nav_Notes"),       desc: GetStr("QA_Notes_Desc"),       icon: "pkg:/images/icon_notes.png",       color: "0x60A5FAFF", target: "NotesScene" },
        { title: GetStr("Nav_Settings"),    desc: GetStr("QA_Settings_Desc"),    icon: "pkg:/images/icon_settings.png",    color: "0x9CA3AFFF", target: "SettingsScreen" }
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

sub UpdateSidebarFocus(section as String)
    m.focusSection = section
    if section = "sidebar"
        if m.homeActiveCard <> invalid then m.homeActiveCard.visible = false
        m.sidebarNav.setFocus(true)
    else if section = "quickActions"
        if m.homeActiveCard <> invalid then m.homeActiveCard.visible = true
        m.quickActionsGrid.setFocus(true)
    else if section = "featuredBook"
        if m.homeActiveCard <> invalid then m.homeActiveCard.visible = true
        if m.featuredBookCard <> invalid then m.featuredBookCard.setFocus(true)
    end if
end sub

function onKeyEvent(key as String, press as Boolean) as Boolean
    handled = false
    if press
        m.idleTimer.control = "start"

        if key = "options" ' * button pressed
            FetchDashboard()
            return true
        end if

        if m.focusSection = "quickActions"
            if key = "left"
                itemFocused = m.quickActionsGrid.itemFocused
                if itemFocused MOD 4 = 0 and itemFocused >= 4 and m.featuredBookCard <> invalid
                    UpdateSidebarFocus("featuredBook")
                else
                    UpdateSidebarFocus("sidebar")
                end if
                handled = true
            else if key = "back"
                UpdateSidebarFocus("sidebar")
                handled = true
            else if key = "OK" or key = "select"
                itemFocused = m.quickActionsGrid.itemFocused
                if itemFocused >= 0 and itemFocused < m.actionTargets.count()
                    m.top.navigate = m.actionTargets[itemFocused]
                    handled = true
                end if
            end if
        else if m.focusSection = "featuredBook"
            if key = "right"
                UpdateSidebarFocus("quickActions")
                handled = true
            else if key = "left" or key = "back" or key = "up"
                UpdateSidebarFocus("sidebar")
                handled = true
            else if key = "OK" or key = "select"
                m.top.navigate = "BooksScreen"
                handled = true
            end if
        else ' Default: sidebar focus
            if key = "right"
                UpdateSidebarFocus("quickActions")
                handled = true
            else if key = "down"
                curr = m.sidebarNav.itemFocused
                if curr < m.navTargets.count() - 1
                    m.sidebarNav.jumpToItem = curr + 1
                    print "[HOME NAV] down -> itemFocused="; m.sidebarNav.itemFocused; " target="; m.navTargets[m.sidebarNav.itemFocused]
                    handled = true
                end if
            else if key = "up"
                curr = m.sidebarNav.itemFocused
                if curr > 0
                    m.sidebarNav.jumpToItem = curr - 1
                    print "[HOME NAV] up -> itemFocused="; m.sidebarNav.itemFocused; " target="; m.navTargets[m.sidebarNav.itemFocused]
                    handled = true
                end if
            else if key = "OK" or key = "select"
                curr = m.sidebarNav.itemFocused
                print "[HOME NAV] SELECT -> itemFocused="; curr; " target="; m.navTargets[curr]
                if curr >= 0 and curr < m.navTargets.count()
                    target = m.navTargets[curr]
                    if target <> "HomeScene" and target <> "HomeSceneV2"
                        m.top.navigate = target
                        handled = true
                    end if
                end if
            end if
        end if
    end if
    return handled
end function
