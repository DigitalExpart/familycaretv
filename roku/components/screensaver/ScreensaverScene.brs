' ═══════════════════════════════════════════════════════════════════════════
' ScreensaverScene.brs — Premium 4-Panel Screensaver
' Panels: 0=Logo+Clock  1=Verse  2=Today Schedule  3=Featured Book
' ═══════════════════════════════════════════════════════════════════════════

sub init()
    ' ── Animations ──────────────────────────────────────────────────────────
    m.bgPulseAnim  = m.top.findNode("bgPulseAnim")
    m.driftAnim    = m.top.findNode("driftAnim")
    m.fadeOutAnim  = m.top.findNode("fadeOutAnim")
    m.fadeInAnim   = m.top.findNode("fadeInAnim")
    m.fadeOutInterp = m.top.findNode("fadeOutInterp")
    m.fadeInInterp  = m.top.findNode("fadeInInterp")

    ' ── Panel groups ────────────────────────────────────────────────────────
    m.panels = [
        m.top.findNode("panelLogo"),
        m.top.findNode("panelVerse"),
        m.top.findNode("panelSchedule"),
        m.top.findNode("panelBook")
    ]
    m.currentPanel = 0

    ' ── Dots ────────────────────────────────────────────────────────────────
    m.dots = [
        m.top.findNode("dot0"),
        m.top.findNode("dot1"),
        m.top.findNode("dot2"),
        m.top.findNode("dot3")
    ]

    ' ── Panel 0: Logo + Clock ───────────────────────────────────────────────
    m.ssDateLabel = m.top.findNode("ssDateLabel")
    m.ssTimeLabel = m.top.findNode("ssTimeLabel")
    m.cornerTimeLabel = m.top.findNode("cornerTimeLabel")

    ' ── Panel 1: Verse ──────────────────────────────────────────────────────
    m.ssVerseSectionLabel = m.top.findNode("ssVerseSectionLabel")
    m.ssVerseText = m.top.findNode("ssVerseText")
    m.ssVerseRef  = m.top.findNode("ssVerseRef")

    ' ── Panel 2: Schedule ───────────────────────────────────────────────────
    m.ssScheduleSectionLabel = m.top.findNode("ssScheduleSectionLabel")
    m.ssScheduleRows = [
        m.top.findNode("ssScheduleRow0"),
        m.top.findNode("ssScheduleRow1"),
        m.top.findNode("ssScheduleRow2"),
        m.top.findNode("ssScheduleRow3"),
        m.top.findNode("ssScheduleRow4")
    ]
    m.ssScheduleEmpty = m.top.findNode("ssScheduleEmpty")

    ' ── Panel 3: Book ───────────────────────────────────────────────────────
    m.ssBookSectionLabel = m.top.findNode("ssBookSectionLabel")
    m.ssBookCover  = m.top.findNode("ssBookCover")
    m.ssBookTitle  = m.top.findNode("ssBookTitle")
    m.ssBookAuthor = m.top.findNode("ssBookAuthor")
    m.ssBookDesc   = m.top.findNode("ssBookDesc")

    ' ── Timers ──────────────────────────────────────────────────────────────
    m.panelTimer   = m.top.findNode("panelTimer")
    m.ssClockTimer = m.top.findNode("ssClockTimer")
    m.startDelay   = m.top.findNode("startDelay")

    m.panelTimer.observeField("fire", "OnPanelTimer")
    m.ssClockTimer.observeField("fire", "OnClockTimer")
    m.startDelay.observeField("fire", "OnStartDelay")

    ' ── Data task ───────────────────────────────────────────────────────────
    m.ssDataTask = m.top.findNode("ssDataTask")
    if m.ssDataTask <> invalid
        m.ssDataTask.observeField("response", "OnDataResponse")
    end if

    ' ── Apply localized section labels ───────────────────────────────────────
    if m.ssVerseSectionLabel <> invalid
        m.ssVerseSectionLabel.text = GetStr("SS_VerseOfDay")
    end if
    if m.ssScheduleSectionLabel <> invalid
        m.ssScheduleSectionLabel.text = GetStr("SS_TodaySchedule")
    end if
    if m.ssBookSectionLabel <> invalid
        m.ssBookSectionLabel.text = GetStr("SS_FeaturedBook")
    end if
    if m.ssScheduleEmpty <> invalid
        m.ssScheduleEmpty.text = GetStr("SS_NoSchedule")
    end if

    ' ── Start background animations ─────────────────────────────────────────
    m.bgPulseAnim.control = "start"
    m.driftAnim.control   = "start"

    ' ── Show panel 0 immediately ────────────────────────────────────────────
    ShowPanel(0)
    UpdateScreensaverClock()
    m.ssClockTimer.control = "start"

    ' ── Fetch live data after short delay ───────────────────────────────────
    m.startDelay.control = "start"
end sub

' ─────────────────────────────────────────────────────────────────────────────
' Data fetch
' ─────────────────────────────────────────────────────────────────────────────
sub OnStartDelay()
    ' Start panel rotation
    m.panelTimer.control = "start"

    ' Fetch dashboard data for verse / schedule / book
    token = getToken()
    if token <> "" and token <> invalid and m.ssDataTask <> invalid
        m.ssDataTask.request = {
            endpoint: "/roku/dashboard",
            method: "GET"
        }
        m.ssDataTask.control = "RUN"
    end if
end sub

sub OnDataResponse(event as Object)
    response = event.getData()
    if response = invalid or response.code <> 200 or response.data = invalid then return

    data = response.data

    ' ── Verse of the Day ────────────────────────────────────────────────────
    if data.verseOfTheDay <> invalid
        v = data.verseOfTheDay
        verseStr = ""
        if v.verse <> invalid and v.verse <> ""
            verseStr = Chr(34) + v.verse + Chr(34)
        else if v.text <> invalid and v.text <> ""
            verseStr = Chr(34) + v.text + Chr(34)
        end if
        if m.ssVerseText <> invalid then m.ssVerseText.text = verseStr

        if v.reference <> invalid and v.reference <> ""
            if m.ssVerseRef <> invalid then m.ssVerseRef.text = "— " + v.reference
        end if
    end if

    ' ── Today's Schedule ────────────────────────────────────────────────────
    if data.todaySchedule <> invalid and type(data.todaySchedule) = "roArray"
        ' Clear all rows first
        for i = 0 to m.ssScheduleRows.count() - 1
            if m.ssScheduleRows[i] <> invalid then m.ssScheduleRows[i].text = ""
        end for

        scheduleCount = data.todaySchedule.count()
        if scheduleCount = 0
            if m.ssScheduleEmpty <> invalid then m.ssScheduleEmpty.visible = true
        else
            if m.ssScheduleEmpty <> invalid then m.ssScheduleEmpty.visible = false
            maxRows = m.ssScheduleRows.count()
            if scheduleCount < maxRows then maxRows = scheduleCount
            for i = 0 to maxRows - 1
                item = data.todaySchedule[i]
                if item <> invalid and m.ssScheduleRows[i] <> invalid
                    rowTitle = ""
                    rowTime  = ""
                    if item.type = "MEDICATION"
                        rowTitle = GetStr("Nav_Medications") + " Reminder"
                    else if item.title <> invalid
                        rowTitle = item.title
                    end if
                    if item.time <> invalid and item.time <> "" then rowTime = item.time
                    bullet = "· "
                    if rowTime <> ""
                        m.ssScheduleRows[i].text = bullet + rowTime + "  " + rowTitle
                    else
                        m.ssScheduleRows[i].text = bullet + rowTitle
                    end if
                end if
            end for
            if scheduleCount > maxRows and m.ssScheduleRows[maxRows - 1] <> invalid
                m.ssScheduleRows[maxRows - 1].text = "  + " + StrI(scheduleCount - maxRows + 1).Trim() + " more..."
            end if
        end if
    else
        if m.ssScheduleEmpty <> invalid then m.ssScheduleEmpty.visible = true
    end if

    ' ── Featured Book ────────────────────────────────────────────────────────
    if data.books <> invalid and type(data.books) = "roArray" and data.books.count() > 0
        book = data.books[0]
        if book <> invalid
            if book.title <> invalid and m.ssBookTitle <> invalid
                m.ssBookTitle.text = book.title
            end if
            if book.author <> invalid and m.ssBookAuthor <> invalid
                m.ssBookAuthor.text = book.author
            end if
            if book.description <> invalid and m.ssBookDesc <> invalid
                m.ssBookDesc.text = book.description
            else if book.desc <> invalid and m.ssBookDesc <> invalid
                m.ssBookDesc.text = book.desc
            end if
            ' Book cover URI
            coverUri = ""
            if book.coverImage <> invalid and book.coverImage <> "" then coverUri = book.coverImage
            if book.coverUrl <> invalid and book.coverUrl <> "" then coverUri = book.coverUrl
            if book.imageUrl <> invalid and book.imageUrl <> "" then coverUri = book.imageUrl
            if coverUri <> "" and m.ssBookCover <> invalid
                m.ssBookCover.uri = coverUri
            end if
        end if
    end if
end sub

' ─────────────────────────────────────────────────────────────────────────────
' Panel rotation
' ─────────────────────────────────────────────────────────────────────────────
sub OnPanelTimer()
    nextPanel = m.currentPanel + 1
    if nextPanel >= m.panels.count() then nextPanel = 0
    TransitionToPanel(nextPanel)
end sub

sub TransitionToPanel(nextIndex as Integer)
    currentGroup = m.panels[m.currentPanel]
    nextGroup = m.panels[nextIndex]

    if nextGroup = invalid then return

    ' Fade out current
    if currentGroup <> invalid and m.fadeOutInterp <> invalid
        m.fadeOutInterp.fieldToInterp = currentGroup.id + ".opacity"
        m.fadeOutAnim.control = "start"
    end if

    ' Make next visible at opacity 0, then fade in
    if nextGroup <> invalid
        nextGroup.visible = true
        nextGroup.opacity = 0.0
        if m.fadeInInterp <> invalid
            m.fadeInInterp.fieldToInterp = nextGroup.id + ".opacity"
            m.fadeInAnim.control = "start"
        end if
    end if

    ' Hide previous after fade duration
    HideAfterDelay(currentGroup)

    ' Update dots
    UpdateDots(nextIndex)

    m.currentPanel = nextIndex
end sub

sub HideAfterDelay(grp as Object)
    ' We don't have a built-in delay, so we observe the fadeOutAnim completion
    ' Store the group to hide on next fade-out completion
    m.groupToHide = grp
    m.fadeOutAnim.observeField("state", "OnFadeOutDone")
end sub

sub OnFadeOutDone(event as Object)
    state = event.getData()
    if state = "stopped"
        if m.groupToHide <> invalid
            m.groupToHide.visible = false
            m.groupToHide = invalid
        end if
        ' Remove observer until next transition
        m.fadeOutAnim.unobserveField("state")
    end if
end sub

sub ShowPanel(idx as Integer)
    ' Show a specific panel, hiding all others (no animation - used for initial show)
    for i = 0 to m.panels.count() - 1
        if m.panels[i] <> invalid
            if i = idx
                m.panels[i].visible = true
                m.panels[i].opacity = 1.0
            else
                m.panels[i].visible = false
                m.panels[i].opacity = 0.0
            end if
        end if
    end for
    UpdateDots(idx)
    m.currentPanel = idx
end sub

sub UpdateDots(activeIdx as Integer)
    dotColors = ["0x00C9A7FF", "0x8B5CF6FF", "0x8B5CF6FF", "0xF59E0BFF"]
    dotWidths  = [28, 8, 8, 8]
    for i = 0 to m.dots.count() - 1
        if m.dots[i] <> invalid
            if i = activeIdx
                m.dots[i].color = dotColors[i]
                m.dots[i].width = 28
            else
                m.dots[i].color = "0x1E3A5FFF"
                m.dots[i].width = 8
            end if
        end if
    end for
end sub

' ─────────────────────────────────────────────────────────────────────────────
' Clock
' ─────────────────────────────────────────────────────────────────────────────
sub OnClockTimer()
    UpdateScreensaverClock()
end sub

sub UpdateScreensaverClock()
    date = CreateObject("roDateTime")
    date.ToLocalTime()

    hour   = date.GetHours()
    minute = date.GetMinutes()
    ampm   = "AM"
    if hour >= 12
        ampm = "PM"
        if hour > 12 then hour = hour - 12
    end if
    if hour = 0 then hour = 12
    minStr = StrI(minute).Trim()
    if minute < 10 then minStr = "0" + minStr
    timeStr = StrI(hour).Trim() + ":" + minStr + " " + ampm

    months   = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    dayStr   = weekdays[date.GetDayOfWeek()]
    monthStr = months[date.GetMonth() - 1]
    dateStr  = dayStr + ", " + monthStr + " " + StrI(date.GetDayOfMonth()).Trim() + " " + StrI(date.GetYear()).Trim()

    ' Update Panel 0 clock labels
    if m.ssTimeLabel <> invalid then m.ssTimeLabel.text = timeStr
    if m.ssDateLabel <> invalid then m.ssDateLabel.text = dateStr

    ' Update corner clock
    if m.cornerTimeLabel <> invalid then m.cornerTimeLabel.text = timeStr
end sub

' ─────────────────────────────────────────────────────────────────────────────
' Key handling — any press exits screensaver back to Home
' ─────────────────────────────────────────────────────────────────────────────
function onKeyEvent(key as String, press as Boolean) as Boolean
    if press
        m.top.navigate = "HomeScene"
        return true
    end if
    return false
end function
