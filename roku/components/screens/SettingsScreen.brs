sub init()
    m.langStatusText = m.top.findNode("langStatusText")
    m.accountInfoLabel = m.top.findNode("accountInfoLabel")

    m.langFocusBorder = m.top.findNode("langFocusBorder")
    m.deviceFocusBorder = m.top.findNode("deviceFocusBorder")
    m.saverFocusBorder = m.top.findNode("saverFocusBorder")
    m.unlinkFocusBorder = m.top.findNode("unlinkFocusBorder")

    m.confirmUnlinkDialog = m.top.findNode("confirmUnlinkDialog")
    m.confirmUnlinkDialog.observeField("confirmed", "OnConfirmUnlink")

    m.settingsTask = m.top.findNode("settingsTask")
    m.settingsTask.observeField("response", "OnSettingsResponse")

    ' 0 = Language, 1 = Device, 2 = Screensaver, 3 = Unlink
    m.focusedOption = 0
    m.currentLang = "EN"

    UpdateFocus()
    FetchDeviceStatus()
end sub

sub FetchDeviceStatus()
    m.settingsTask.request = {
        endpoint: "/roku/dashboard",
        method: "GET"
    }
    m.settingsTask.control = "RUN"
end sub

sub OnSettingsResponse(event as Object)
    response = event.getData()
    if response <> invalid and response.code = 200 and response.data <> invalid
        data = response.data
        infoStr = "Paired Device • Status: Connected & Active • App Version: 2.1.0"
        if data.userName <> invalid and data.userName <> ""
            infoStr = infoStr + " • Account: " + data.userName
        end if
        m.accountInfoLabel.text = infoStr
    end if
end sub

sub UpdateFocus()
    m.langFocusBorder.visible = (m.focusedOption = 0)
    m.deviceFocusBorder.visible = (m.focusedOption = 1)
    m.saverFocusBorder.visible = (m.focusedOption = 2)
    m.unlinkFocusBorder.visible = (m.focusedOption = 3)
end sub

sub ToggleLanguage()
    if m.currentLang = "EN"
        m.currentLang = "ES"
        m.langStatusText.text = "Current Language: Español (ES) • Press OK to switch to English"
    else
        m.currentLang = "EN"
        m.langStatusText.text = "Current Language: English (EN) • Press OK to switch to Spanish"
    end if
end sub

sub OnConfirmUnlink()
    if m.confirmUnlinkDialog.confirmed
        clearAllTokens()
        m.top.navigate = "DeviceLinkScene"
    end if
end sub

function onKeyEvent(key as String, press as Boolean) as Boolean
    handled = false
    if press
        if key = "right"
            if m.focusedOption = 0 or m.focusedOption = 2
                m.focusedOption = m.focusedOption + 1
                UpdateFocus()
                handled = true
            end if
        else if key = "left"
            if m.focusedOption = 1 or m.focusedOption = 3
                m.focusedOption = m.focusedOption - 1
                UpdateFocus()
                handled = true
            end if
        else if key = "down"
            if m.focusedOption < 2
                m.focusedOption = m.focusedOption + 2
                UpdateFocus()
                handled = true
            end if
        else if key = "up"
            if m.focusedOption >= 2
                m.focusedOption = m.focusedOption - 2
                UpdateFocus()
                handled = true
            end if
        else if key = "OK"
            if m.focusedOption = 0
                ToggleLanguage()
                handled = true
            else if m.focusedOption = 3
                m.confirmUnlinkDialog.show = true
                handled = true
            end if
        else if key = "back"
            m.top.navigate = "HomeScene"
            handled = true
        end if
    end if
    return handled
end function
