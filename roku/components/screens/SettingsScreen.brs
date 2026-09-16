sub init()
    m.langStatusText = m.top.findNode("langStatusText")
    m.accountInfoLabel = m.top.findNode("accountInfoLabel")
    m.pageTitle = m.top.findNode("pageTitle")
    m.card2Title = m.top.findNode("card2Title")
    m.card3Title = m.top.findNode("card3Title")
    m.card3Desc = m.top.findNode("card3Desc")
    m.card4Title = m.top.findNode("card4Title")
    m.card4Desc = m.top.findNode("card4Desc")
    m.footerLabel = m.top.findNode("footerLabel")

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

    ' Read persisted language preference from Registry
    m.currentLang = ReadLanguagePref()

    ApplyLocalization()
    UpdateFocus()
    FetchDeviceStatus()

    m.top.setFocus(true)
    m.top.observeField("visible", "OnVisibleChange")
end sub

sub OnVisibleChange()
    if m.top.visible = true
        ApplyLocalization()
        m.top.setFocus(true)
    end if
end sub

sub ApplyLocalization()
    m.currentLang = ReadLanguagePref()
    if m.pageTitle <> invalid then m.pageTitle.text = GetStr("Settings_Title")
    if m.card2Title <> invalid then m.card2Title.text = GetStr("Settings_DeviceTitle")
    if m.card3Title <> invalid then m.card3Title.text = GetStr("Settings_ScreensaverTitle")
    if m.card3Desc <> invalid then m.card3Desc.text = GetStr("Settings_ScreensaverDesc")
    if m.card4Title <> invalid then m.card4Title.text = GetStr("Settings_UnlinkTitle")
    if m.card4Desc <> invalid then m.card4Desc.text = GetStr("Settings_UnlinkDesc")
    if m.footerLabel <> invalid then m.footerLabel.text = GetStr("Settings_Footer")

    if m.confirmUnlinkDialog <> invalid
        m.confirmUnlinkDialog.title = GetStr("Settings_UnlinkDialogTitle")
        m.confirmUnlinkDialog.message = GetStr("Settings_UnlinkDialogMsg")
        m.confirmUnlinkDialog.confirmText = GetStr("Settings_UnlinkYes")
        m.confirmUnlinkDialog.cancelText = GetStr("cancel")
    end if

    if m.langStatusText <> invalid
        if m.currentLang = "ES"
            m.langStatusText.text = GetStr("Settings_LangES")
        else
            m.langStatusText.text = GetStr("Settings_LangEN")
        end if
    end if
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
    else
        m.currentLang = "EN"
    end if

    ' Persist the new preference to the Roku Registry
    SaveLanguagePref(m.currentLang)

    ' Apply changes to all settings text immediately
    ApplyLocalization()
end sub

sub OnConfirmUnlink()
    if m.confirmUnlinkDialog.confirmed
        clearAllTokens()
        m.top.navigate = "DeviceLinkScene"
    end if
end sub

function onKeyEvent(key as String, press as Boolean) as Boolean
    print "[SETTINGS] onKeyEvent key="; key; " press="; press; " focusedOption="; m.focusedOption
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
        else if key = "OK" or key = "select" or key = "Select"
            if m.focusedOption = 0
                ToggleLanguage()
                handled = true
            else if m.focusedOption = 3
                m.confirmUnlinkDialog.show = true
                handled = true
            end if
        else if key = "back" or key = "Back"
            m.top.navigate = "HomeSceneV2"
            handled = true
        end if
    end if
    return handled
end function
