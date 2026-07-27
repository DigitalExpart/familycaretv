sub init()
    ' ─── NODE REFERENCES ───
    m.welcomeLabel = m.top.findNode("welcomeLabel")
    m.headerClock = m.top.findNode("headerClock")
    m.headerDate = m.top.findNode("headerDate")
    m.langLabel = m.top.findNode("langLabel")

    ' Stat card values
    m.stat1Value = m.top.findNode("stat1Value")
    m.stat2Value = m.top.findNode("stat2Value")
    m.stat3Value = m.top.findNode("stat3Value")
    m.stat4Value = m.top.findNode("stat4Value")

    ' Content areas
    m.verseText = m.top.findNode("verseText")
    m.verseRef = m.top.findNode("verseRef")
    m.drawingPoster = m.top.findNode("drawingPoster")
    m.drawingThought = m.top.findNode("drawingThought")
    m.qrPoster = m.top.findNode("qrPoster")

    ' Focus elements
    m.verseCardGroup = m.top.findNode("verseCardGroup")
    m.drawingCardGroup = m.top.findNode("drawingCardGroup")
    m.verseFocusBorder = m.top.findNode("verseFocusBorder")
    m.drawingFocusBorder = m.top.findNode("drawingFocusBorder")

    ' Grid and overlays
    m.quickActionsGrid = m.top.findNode("quickActionsGrid")
    m.loadingOverlay = m.top.findNode("loadingOverlay")
    m.errorDialog = m.top.findNode("errorDialog")

    ' ─── FOCUS ZONE TRACKING ───
    ' 0 = verse card, 1 = drawing card, 2 = quick actions grid
    m.focusZone = 2

    ' ─── CLOCK ───
    m.clockTimer = m.top.findNode("clockTimer")
    m.clockTimer.observeField("fire", "OnClockTick")
    m.clockTimer.control = "start"
    UpdateClock()

    ' ─── GREETING ───
    m.welcomeLabel.text = GetGreeting()

    ' ─── POPULATE QUICK ACTIONS GRID ───
    gridContent = CreateObject("roSGNode", "ContentNode")

    AddGridItem(gridContent, "Patients",    "View & manage",        "pkg:/images/icon_patients.png",    "PatientsScene")
    AddGridItem(gridContent, "Calendar",    "Events & appointments","pkg:/images/icon_calendar.png",    "CalendarScene")
    AddGridItem(gridContent, "Medications", "Reminders & dosages",  "pkg:/images/icon_medications.png", "MedicationsScene")
    AddGridItem(gridContent, "Music",       "Relaxing playlists",   "pkg:/images/icon_music.png",       "MusicScene")
    AddGridItem(gridContent, "Kids",        "Coloring & activities","pkg:/images/icon_kids.png",        "KidsScene")
    AddGridItem(gridContent, "Pets",        "Pet care tracker",     "pkg:/images/icon_pets.png",        "PetsScene")
    AddGridItem(gridContent, "Notes",       "Personal notes",       "pkg:/images/icon_notes.png",       "NotesScene")
    AddGridItem(gridContent, "Settings",    "App preferences",      "pkg:/images/icon_settings.png",    "SettingsScreen")

    m.quickActionsGrid.content = gridContent
    m.quickActionsGrid.observeField("itemSelected", "OnGridItemSelected")

    ' ─── FETCH DASHBOARD DATA ───
    m.dashboardTask = m.top.findNode("dashboardTask")
    m.dashboardTask.observeField("response", "OnDashboardResponse")
    m.dashboardTask.request = {
        endpoint: "/roku/dashboard",
        method: "GET"
    }
    m.dashboardTask.control = "RUN"

    ' ─── SET INITIAL FOCUS ───
    m.quickActionsGrid.setFocus(true)
end sub

' ═══════════════════════════════════════════
' HELPERS
' ═══════════════════════════════════════════

sub AddGridItem(parent as Object, title as String, subtitle as String, iconUri as String, targetScene as String)
    item = CreateObject("roSGNode", "ContentNode")
    item.title = title
    item.shortDescriptionLine1 = subtitle
    item.HDPosterUrl = iconUri
    item.description = targetScene
    parent.appendChild(item)
end sub

sub UpdateClock()
    now = CreateObject("roDateTime")
    now.ToLocalTime()
    m.headerClock.text = now.AsTimeString("short-hms")
    m.headerDate.text = now.AsDateString("short-month-short-weekday")
end sub

sub OnClockTick()
    UpdateClock()
end sub

' ═══════════════════════════════════════════
' DASHBOARD API RESPONSE
' ═══════════════════════════════════════════

sub OnDashboardResponse(event as Object)
    m.loadingOverlay.visible = false

    response = event.getData()
    if response <> invalid and response.code = 200 and response.data <> invalid
        data = response.data

        ' ── STAT CARDS ──
        ' Patients count
        pCount = 0
        if data.patientCount <> invalid
            pCount = data.patientCount
        else if data.patients <> invalid
            pCount = data.patients.count()
        end if
        m.stat1Value.text = pCount.toStr()

        ' Medications count
        mCount = 0
        if data.medsCount <> invalid
            mCount = data.medsCount
        end if
        m.stat2Value.text = mCount.toStr()

        ' Events/Appointments count
        eCount = 0
        if data.eventsCount <> invalid
            eCount = data.eventsCount
        else if data.reminders <> invalid
            eCount = data.reminders.count()
        end if
        m.stat3Value.text = eCount.toStr()

        ' Tasks count
        tCount = 0
        if data.tasksCount <> invalid
            tCount = data.tasksCount
        end if
        m.stat4Value.text = tCount.toStr()

        ' ── VERSE OF THE DAY ──
        if data.verse <> invalid
            m.verseText.text = Chr(34) + data.verse.text + Chr(34)
            m.verseRef.text = "- " + data.verse.reference
        else if data.verseOfTheDay <> invalid and data.verseOfTheDay.verse <> invalid
            m.verseText.text = Chr(34) + data.verseOfTheDay.verse + Chr(34)
            m.verseRef.text = "- " + data.verseOfTheDay.reference
        else
            m.verseText.text = Chr(34) + "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life." + Chr(34)
            m.verseRef.text = "- John 3:16"
        end if

        ' ── DRAWING OF THE DAY ──
        if data.drawingUrl <> invalid and data.drawingUrl <> ""
            m.drawingPoster.uri = data.drawingUrl
        else if data.drawing <> invalid and data.drawing.imageUrl <> invalid
            m.drawingPoster.uri = data.drawing.imageUrl
        end if

        if data.drawingThought <> invalid
            m.drawingThought.text = data.drawingThought
        else if data.drawing <> invalid and data.drawing.description <> invalid
            m.drawingThought.text = data.drawing.description
        else
            m.drawingThought.text = "Take a moment today to appreciate the beauty around you."
        end if

        ' ── QR CODE ──
        if data.qrCodeUrl <> invalid and data.qrCodeUrl <> ""
            m.qrPoster.uri = data.qrCodeUrl
        end if

        ' ── WELCOME WITH USER NAME ──
        greeting = GetGreeting()
        if data.userName <> invalid and data.userName <> ""
            m.welcomeLabel.text = greeting + ", " + data.userName + "!"
        else if data.user <> invalid and data.user.firstName <> invalid
            m.welcomeLabel.text = greeting + ", " + data.user.firstName + "!"
        end if
    else
        ' ── ERROR FALLBACK ──
        m.verseText.text = Chr(34) + "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life." + Chr(34)
        m.verseRef.text = "- John 3:16"
        m.drawingThought.text = "Unable to load. Please check your connection."

        if response <> invalid and response.error <> invalid
            m.errorDialog.message = response.error
        else
            m.errorDialog.message = "Could not load dashboard. Please check your connection."
        end if
        m.errorDialog.show = true
    end if
end sub

' ═══════════════════════════════════════════
' GRID SELECTION → NAVIGATION
' ═══════════════════════════════════════════

sub OnGridItemSelected()
    selectedItem = m.quickActionsGrid.content.getChild(m.quickActionsGrid.itemSelected)
    if selectedItem <> invalid
        m.top.navigate = selectedItem.description
    end if
end sub

' ═══════════════════════════════════════════
' FOCUS MANAGEMENT
' ═══════════════════════════════════════════

sub SetFocusZone(zone as Integer)
    ' Clear all focus indicators
    m.verseFocusBorder.visible = false
    m.drawingFocusBorder.visible = false

    m.focusZone = zone

    if zone = 0
        ' Verse card
        m.verseFocusBorder.visible = true
        m.verseCardGroup.setFocus(true)
    else if zone = 1
        ' Drawing card
        m.drawingFocusBorder.visible = true
        m.drawingCardGroup.setFocus(true)
    else
        ' Quick actions grid
        m.quickActionsGrid.setFocus(true)
    end if
end sub

function onKeyEvent(key as String, press as Boolean) as Boolean
    handled = false
    if press
        if m.focusZone = 2
            ' Grid is focused — handle UP to move to verse/drawing row
            if key = "up"
                focusedIndex = m.quickActionsGrid.itemFocused
                if focusedIndex < 4
                    ' First row of grid — move up to verse/drawing
                    if focusedIndex < 2
                        SetFocusZone(0) ' Verse card
                    else
                        SetFocusZone(1) ' Drawing card
                    end if
                    handled = true
                end if
            end if
        else if m.focusZone = 0
            ' Verse card focused
            if key = "down"
                SetFocusZone(2)
                handled = true
            else if key = "right"
                SetFocusZone(1)
                handled = true
            else if key = "OK"
                m.top.navigate = "BibleVerseScene"
                handled = true
            end if
        else if m.focusZone = 1
            ' Drawing card focused
            if key = "down"
                SetFocusZone(2)
                handled = true
            else if key = "left"
                SetFocusZone(0)
                handled = true
            else if key = "OK"
                m.top.navigate = "DrawingScene"
                handled = true
            end if
        end if
    end if
    return handled
end function
