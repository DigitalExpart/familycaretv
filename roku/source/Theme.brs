' Theme.brs - FamilyCare TV Design System
' Centralized light-theme color palette and utility functions
' ═══════════════════════════════════════════════════════════

function ThemeColor(name as String) as String
    colors = {
        ' Surfaces & Backgrounds
        bgPage:         "0xF0F2F5FF"
        bgWhite:        "0xFFFFFFFF"
        bgCard:         "0xFFFFFFFF"
        bgHeader:       "0xFFFFFFFF"
        bgFooter:       "0xE8EBF0FF"
        bgOverlay:      "0x00000066"
        bgInput:        "0xFFFFFFFF"
        bgFocusTint:    "0xF0FDFBFF"
        bgActiveNav:    "0xE6F7F4FF"

        ' Typography
        textPrimary:    "0x0F172AFF"
        textSecondary:  "0x64748BFF"
        textMuted:      "0x94A3B8FF"
        textWhite:      "0xFFFFFFFF"

        ' Primary Branding & Focus
        accentTeal:     "0x00C9A7FF"
        accentTealLight:"0xE6F7F4FF"
        focusGlow:      "0x00C9A750"
        focusBorder:    "0x00C9A7FF"
        border:         "0xE2E8F0FF"
        divider:        "0xE2E8F0FF"

        ' Semantic Colors
        accentAmber:    "0xF59E0BFF"
        accentOrange:   "0xFFA726FF"
        accentBlue:     "0x42A5F5FF"
        accentGreen:    "0x66BB6AFF"
        accentPurple:   "0x7E57C2FF"
        accentPink:     "0xFF6B6BFF"
        accentCoral:    "0xFF6B6BFF"
        accentGray:     "0x64748BFF"
        danger:         "0xEF4444FF"
        statusOnline:   "0x22C55EFF"
        statusOffline:  "0xEF4444FF"
    }

    if colors.DoesExist(name)
        return colors[name]
    end if
    return "0x0F172AFF"
end function

function GetGreeting() as String
    now = CreateObject("roDateTime")
    now.ToLocalTime()
    hour = now.GetHours()

    if hour < 12
        return "Good morning"
    else if hour < 17
        return "Good afternoon"
    else
        return "Good evening"
    end if
end function

function GetFormattedDate() as String
    now = CreateObject("roDateTime")
    now.ToLocalTime()
    return now.AsDateString("long-date")
end function

function GetFormattedTime() as String
    now = CreateObject("roDateTime")
    now.ToLocalTime()
    hours = now.GetHours()
    minutes = now.GetMinutes()
    seconds = now.GetSeconds()

    ampm = "AM"
    if hours >= 12
        ampm = "PM"
        if hours > 12 then hours = hours - 12
    else if hours = 0
        hours = 12
    end if

    minsStr = minutes.toStr()
    if minutes < 10 then minsStr = "0" + minsStr

    secsStr = seconds.toStr()
    if seconds < 10 then secsStr = "0" + secsStr

    return hours.toStr() + ":" + minsStr + ":" + secsStr + " " + ampm
end function

function GetShortDate() as String
    now = CreateObject("roDateTime")
    now.ToLocalTime()
    return now.AsDateString("short-month-short-weekday")
end function
