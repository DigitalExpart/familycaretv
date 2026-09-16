sub init()
    m.instructionLabel = m.top.findNode("instructionLabel")
    m.codeLabel = m.top.findNode("codeLabel")
    m.expiresLabel = m.top.findNode("expiresLabel")
    m.step1Label = m.top.findNode("step1Label")
    m.step2Label = m.top.findNode("step2Label")
    m.step3Label = m.top.findNode("step3Label")
    m.waitingLabel = m.top.findNode("waitingLabel")
    m.diagStatusLabel = m.top.findNode("diagStatusLabel")
    m.pollTimer = m.top.findNode("pollTimer")
    
    ApplyLocalization()
    m.codeLabel.text = GetStr("loading")
    SetDiagnosticStatus("Checking connection...")
    
    m.deviceCode = ""
    m.pollCount = 0
    m.timerFireCount = 0
    m.retryCount = 0
    m.isPollingActive = false
    m.pollWatchdog = invalid
    m.deviceId = ""
    deviceInfo = CreateObject("roDeviceInfo")
    if deviceInfo <> invalid
        m.deviceId = deviceInfo.GetChannelClientId()
    end if

    m.deviceCodeTask = invalid
    m.tokenPollTask = invalid
    
    ' Fetch device code
    FetchDeviceCode()
    m.top.observeField("visible", "OnVisibleChange")
end sub

sub OnVisibleChange()
    if m.top.visible = true
        ApplyLocalization()
    end if
end sub

sub ApplyLocalization()
    if m.instructionLabel <> invalid then m.instructionLabel.text = GetStr("devicelink_instruction")
    if m.step1Label <> invalid then m.step1Label.text = GetStr("devicelink_step1")
    if m.step2Label <> invalid then m.step2Label.text = GetStr("devicelink_step2")
    if m.step3Label <> invalid then m.step3Label.text = GetStr("devicelink_step3")
    if m.waitingLabel <> invalid then m.waitingLabel.text = GetStr("devicelink_waiting")
end sub

sub SetDiagnosticStatus(statusText as String)
    if m.diagStatusLabel <> invalid
        m.diagStatusLabel.text = statusText
    end if
end sub

sub FetchDeviceCode()
    SetDiagnosticStatus("Checking connection...")
    if m.deviceCodeTask <> invalid
        m.deviceCodeTask.unobserveField("response")
        m.deviceCodeTask = invalid
    end if

    m.deviceCodeTask = CreateObject("roSGNode", "ApiTask")
    m.deviceCodeTask.observeField("response", "OnDeviceCodeResponse")
    m.deviceCodeTask.request = {
        endpoint: "/roku/device-code",
        method: "POST",
        body: {}
    }
    m.deviceCodeTask.control = "RUN"
end sub

sub OnDeviceCodeResponse(event as Object)
    if event = invalid then return
    response = event.getData()
    if response = invalid then return

    if response.data <> invalid and response.data.code <> invalid
        m.deviceCode = response.data.code
        m.codeLabel.text = m.deviceCode
        m.retryCount = 0
        
        ' Cache pending code so app restart can re-verify if already linked
        savePendingCode(m.deviceCode)

        print "[LINK] code-created"
        SetDiagnosticStatus("Waiting for device activation...")

        m.pollCount = 0
        m.timerFireCount = 0
        m.isPollingActive = false
        
        ' Start polling timer
        m.pollTimer.unobserveField("fire")
        m.pollTimer.observeField("fire", "OnPollTimer")
        m.pollTimer.repeat = true
        m.pollTimer.duration = 4.0
        m.pollTimer.control = "start"

        ' Also run an immediate check in case it's already linked
        PollForToken()
    else
        ' Retry up to 3 times before showing error
        m.retryCount = m.retryCount + 1
        if m.retryCount <= 3
            m.codeLabel.text = "CONNECTING..."
            m.expiresLabel.text = "Retrying... (attempt " + m.retryCount.toStr() + " of 3)"
            SetDiagnosticStatus("Checking connection...")
            
            retryTimer = CreateObject("roSGNode", "Timer")
            retryTimer.duration = 3
            retryTimer.repeat = false
            retryTimer.observeField("fire", "RetryFetchCode")
            m.top.appendChild(retryTimer)
            retryTimer.control = "start"
        else
            m.codeLabel.text = "CONNECTION ERROR"
            m.expiresLabel.text = "Press OK to retry or Back to exit"
            SetDiagnosticStatus("Connection detected, authentication error")
        end if
    end if
end sub

sub RetryFetchCode()
    FetchDeviceCode()
end sub

sub OnPollTimer(event as Object)
    m.timerFireCount = m.timerFireCount + 1
    print "[LINK] timer-fired poll=" + StrI(m.timerFireCount).Trim()
    PollForToken()
end sub

sub PollForToken()
    if m.deviceCode = "" or m.deviceCode = invalid then return

    ' Watchdog: if previous poll has been active for more than 10 seconds, force reset
    if m.isPollingActive
        if m.pollWatchdog <> invalid and m.pollWatchdog.TotalSeconds() > 10
            print "[LINK] poll-watchdog: resetting stuck polling state"
            m.isPollingActive = false
        else
            return
        end if
    end if

    m.isPollingActive = true
    if m.pollWatchdog = invalid
        m.pollWatchdog = CreateObject("roTimespan")
    end if
    m.pollWatchdog.Mark()

    SetDiagnosticStatus("Checking connection...")
    print "[LINK] request-start"

    ' Create fresh ApiTask for each poll cycle so Roku OS spawns a clean thread
    if m.tokenPollTask <> invalid
        m.tokenPollTask.unobserveField("response")
        m.tokenPollTask = invalid
    end if

    m.tokenPollTask = CreateObject("roSGNode", "ApiTask")
    m.tokenPollTask.observeField("response", "OnTokenResponse")
    m.tokenPollTask.request = {
        endpoint: "/roku/token",
        method: "POST",
        timeoutMs: 8000,
        body: {
            code: m.deviceCode
        }
    }
    m.tokenPollTask.control = "RUN"
end sub

sub OnTokenResponse(event as Object)
    m.isPollingActive = false
    if event = invalid then return
    response = event.getData()
    if response = invalid then return
    
    httpCode = -1
    if response.code <> invalid
        httpCode = response.code
    end if
    print "[LINK] response http=" + StrI(httpCode).Trim()

    ' Validate HTTP status code
    if httpCode < 200 or httpCode >= 300
        if httpCode = 404 or (httpCode = 401 and response.rawResponse <> invalid and (Instr(1, LCase(response.rawResponse), "expired") > 0 or Instr(1, LCase(response.rawResponse), "invalid") > 0))
            if m.pollTimer <> invalid then m.pollTimer.control = "stop"
            if m.codeLabel <> invalid then m.codeLabel.text = "EXPIRED"
            if m.expiresLabel <> invalid then m.expiresLabel.text = "Press OK to generate a new code"
            SetDiagnosticStatus("Code expired. Press OK to refresh.")
            clearPendingCode()
            m.deviceCode = ""
        else
            SetDiagnosticStatus("Checking connection...")
        end if
        return
    end if

    if response.data <> invalid and type(response.data) = "roAssociativeArray"
        d = response.data

        ' Safe object unwrapping: check top-level or nested data container
        targetObj = d
        if d.DoesExist("data") and d.data <> invalid and type(d.data) = "roAssociativeArray"
            targetObj = d.data
        end if

        ' Check pending status
        isPending = false
        if d.DoesExist("pending")
            if d.pending = true or d.pending = "true" or d.pending = 1
                isPending = true
            end if
        else if targetObj.DoesExist("pending")
            if targetObj.pending = true or targetObj.pending = "true" or targetObj.pending = 1
                isPending = true
            end if
        end if

        if isPending
            print "[LINK] pending=true"
        else
            print "[LINK] pending=false"
        end if

        ' Extract tokens safely without rigid type checks
        tokenVal = ""
        refreshTokenVal = ""
        if targetObj.DoesExist("token") and targetObj.token <> invalid
            tokenVal = targetObj.token.toStr().Trim()
        else if targetObj.DoesExist("accessToken") and targetObj.accessToken <> invalid
            tokenVal = targetObj.accessToken.toStr().Trim()
        else if d.DoesExist("token") and d.token <> invalid
            tokenVal = d.token.toStr().Trim()
        else if d.DoesExist("accessToken") and d.accessToken <> invalid
            tokenVal = d.accessToken.toStr().Trim()
        end if

        if targetObj.DoesExist("refreshToken") and targetObj.refreshToken <> invalid
            refreshTokenVal = targetObj.refreshToken.toStr().Trim()
        else if d.DoesExist("refreshToken") and d.refreshToken <> invalid
            refreshTokenVal = d.refreshToken.toStr().Trim()
        end if

        hasToken = (tokenVal <> "" and tokenVal <> invalid)
        if hasToken
            print "[LINK] token-present=true"
        else
            print "[LINK] token-present=false"
        end if

        ' If still pending and no token present, remain waiting
        if isPending and not hasToken
            SetDiagnosticStatus("Waiting for device activation...")
            return
        end if

        ' Pending is false or token is present: verify and persist
        if hasToken
            saved = saveToken(tokenVal)
            clearPendingCode()
            if refreshTokenVal <> ""
                saveRefreshToken(refreshTokenVal)
            end if

            savedToken = getToken()
            registryOk = (saved and savedToken <> "" and savedToken = tokenVal)

            if registryOk
                print "[LINK] registry-save=true"

                ' Stop polling timer only AFTER successful token persistence
                if m.pollTimer <> invalid then m.pollTimer.control = "stop"

                SetDiagnosticStatus("Account linked — opening Home...")
                if m.codeLabel <> invalid then m.codeLabel.text = "LINKED!"
                if m.expiresLabel <> invalid then m.expiresLabel.text = "Activation successful! Loading Home..."
                if m.waitingLabel <> invalid then m.waitingLabel.text = "Connected!"

                ' Navigate to Home Scene
                print "[LINK] navigate-home"
                if m.top <> invalid
                    m.top.navigate = "HomeScene"
                end if
            else
                print "[LINK] registry-save=false"
                SetDiagnosticStatus("Connection detected, authentication error")
                ' Keep timer running so next poll can retry
            end if
        else
            ' pending=false but token extraction failed
            print "[LINK] registry-save=false"
            SetDiagnosticStatus("Connection detected, authentication error")
            ' Keep timer running so screen remains recoverable
        end if
    else
        SetDiagnosticStatus("Checking connection...")
    end if
end sub

function onKeyEvent(key as String, press as Boolean) as Boolean
    if press and (key = "OK" or key = "Select" or key = "select")
        ' If showing error or expired, allow manual retry to fetch fresh code
        if m.deviceCode = "" or (m.codeLabel <> invalid and (m.codeLabel.text = "EXPIRED" or m.codeLabel.text = "CONNECTION ERROR"))
            m.retryCount = 0
            m.codeLabel.text = "LOADING..."
            m.expiresLabel.text = ""
            SetDiagnosticStatus("Checking connection...")
            FetchDeviceCode()
            return true
        else if m.deviceCode <> ""
            ' If active code is displayed, OK triggers an immediate poll verification
            print "[LINK] user-pressed-ok: triggering immediate verification"
            m.isPollingActive = false
            PollForToken()
            return true
        end if
    end if
    return false
end function
