' Theme.brs - FamilyCare TV Design System
' Centralized color palette, spacing, and utility functions
' Used across all V2 premium components
' ═══════════════════════════════════════════════════════════

' ─── COLOR PALETTE ───
function ThemeColor(name as String) as String
    colors = {
        bgPage:         "0xF2F4F7FF"
        bgWhite:        "0xFFFFFFFF"
        bgCard:         "0xFFFFFFFF"
        bgHeader:       "0xFFFFFFFF"
        bgFooter:       "0xE8EBF0FF"
        bgOverlay:      "0x00000066"
        bgInput:        "0xF5F7FAFF"
        bgFocusTint:    "0xF0FDFBFF"

        textPrimary:    "0x1A1A2EFF"
        textSecondary:  "0x4A4A68FF"
        textMuted:      "0x8E8EA0FF"
        textWhite:      "0xFFFFFFFF"

        accentTeal:     "0x00A89DFF"
        accentTealLight:"0xE0F7F5FF"
        accentCoral:    "0xFF6B6BFF"
        accentOrange:   "0xFFA726FF"
        accentBlue:     "0x42A5F5FF"
        accentGreen:    "0x66BB6AFF"
        accentPurple:   "0x7E57C2FF"
        accentGray:     "0x607D8BFF"

        shadow:         "0x0000000D"
        shadowDark:     "0x00000020"
        border:         "0xE0E3E8FF"
        focusGlow:      "0x00A89D50"
        focusBorder:    "0x00A89DFF"
        divider:        "0xE0E3E8FF"

        statusOnline:   "0x66BB6AFF"
        statusOffline:  "0xFF5252FF"
        danger:         "0xFF5252FF"
    }

    if colors.DoesExist(name)
        return colors[name]
    end if
    return "0x000000FF"
end function

' ─── TIME-BASED GREETING ───
function GetGreeting() as String
    now = CreateObject("roDateTime")
    now.ToLocalTime()
    hour = now.GetHours()

    if hour < 12
        return "Good Morning"
    else if hour < 17
        return "Good Afternoon"
    else
        return "Good Evening"
    end if
end function

' ─── FORMATTED DATE ───
function GetFormattedDate() as String
    now = CreateObject("roDateTime")
    now.ToLocalTime()
    return now.AsDateString("long-date")
end function

' ─── FORMATTED TIME ───
function GetFormattedTime() as String
    now = CreateObject("roDateTime")
    now.ToLocalTime()
    return now.AsTimeString("short-hms")
end function

' ─── SHORT DATE ───
function GetShortDate() as String
    now = CreateObject("roDateTime")
    now.ToLocalTime()
    return now.AsDateString("short-month-short-weekday")
end function
