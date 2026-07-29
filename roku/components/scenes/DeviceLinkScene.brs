sub init()
    m.instructionLabel = m.top.findNode("instructionLabel")
    m.codeLabel = m.top.findNode("codeLabel")
    m.expiresLabel = m.top.findNode("expiresLabel")
    m.deviceCodeTask = m.top.findNode("deviceCodeTask")
    m.tokenPollTask = m.top.findNode("tokenPollTask")
    m.pollTimer = m.top.findNode("pollTimer")
    
    m.instructionLabel.text = "Open Mobile App → Profile → Connect Roku TV"
    m.expiresLabel.text = "Code expires in 15 minutes"
    m.codeLabel.text = "LOADING..."
    
    m.deviceCode = ""
    m.pollCount = 0
    m.retryCount = 0
    m.deviceId = CreateObject("roDeviceInfo").GetChannelClientId()
    
    ' Fetch device code
    FetchDeviceCode()
end sub

sub FetchDeviceCode()
    m.deviceCodeTask.observeField("response", "OnDeviceCodeResponse")
    m.deviceCodeTask.request = {
        endpoint: "/roku/device-code",
        method: "POST"
    }
    m.deviceCodeTask.control = "RUN"
end sub

sub OnDeviceCodeResponse(event as Object)
    response = event.getData()
    print "=== [DEVICE CODE] Response received ==="
    if response <> invalid
        print "=== [DEVICE CODE] Status code: "; response.code; " ==="
        if response.rawResponse <> invalid
            print "=== [DEVICE CODE] Raw response: "; response.rawResponse; " ==="
        end if
    end if

    if response <> invalid and response.data <> invalid and response.data.code <> invalid
        m.deviceCode = response.data.code
        m.codeLabel.text = m.deviceCode
        m.retryCount = 0
        
        print "=== [ACTIVATION TRACE STEP 1] Code received: "; m.deviceCode; " ==="
        print "=== [ACTIVATION TRACE STEP 1] Polling started ==="
        print "=== [ACTIVATION TRACE STEP 1] Polling interval: 5 seconds ==="
        m.pollCount = 0
        
        ' Start 5s polling timer
        m.pollTimer.observeField("fire", "PollForToken")
        m.pollTimer.control = "start"
    else
        ' Retry up to 3 times before showing error
        m.retryCount++
        if m.retryCount <= 3
            print "=== [DEVICE CODE] Retry "; m.retryCount; " of 3 ==="
            m.codeLabel.text = "CONNECTING..."
            m.expiresLabel.text = "Retrying... (attempt " + m.retryCount.toStr() + " of 3)"
            ' Wait 3 seconds before retry
            retryTimer = CreateObject("roSGNode", "Timer")
            retryTimer.duration = 3
            retryTimer.repeat = false
            retryTimer.observeField("fire", "RetryFetchCode")
            m.top.appendChild(retryTimer)
            retryTimer.control = "start"
        else
            print "=== [DEVICE CODE] All retries exhausted ==="
            m.codeLabel.text = "CONNECTION ERROR"
            m.expiresLabel.text = "Press OK to retry or Back to exit"
        end if
    end if
end sub

sub RetryFetchCode()
    FetchDeviceCode()
end sub

sub PollForToken()
    if m.deviceCode = "" or m.deviceCode = invalid return

    m.pollCount++
    print "=== [ACTIVATION TRACE STEP 1] Polling count: "; m.pollCount; " ==="
    print "=== [ACTIVATION TRACE STEP 2] Polling URL: "; GetApiBaseUrl() + "/roku/token"; " ==="
    print "=== [ACTIVATION TRACE STEP 2] HTTP Method: POST ==="
    print "=== [ACTIVATION TRACE STEP 2] Device ID: "; m.deviceId; " ==="
    print "=== [ACTIVATION TRACE STEP 2] Activation Code: "; m.deviceCode; " ==="

    task = CreateObject("roSGNode", "ApiTask")
    task.observeField("response", "OnTokenResponse")
    task.request = {
        endpoint: "/roku/token",
        method: "POST",
        body: {
            code: m.deviceCode
        }
    }
    task.control = "RUN"
end sub

sub OnTokenResponse(event as Object)
    response = event.getData()
    if response = invalid return
    
    print "=== [ACTIVATION TRACE STEP 3] HTTP Status: "; response.code; " ==="
    if response.rawResponse <> invalid
        print "=== [ACTIVATION TRACE STEP 3] Raw JSON Response: "; response.rawResponse; " ==="
    end if
    if response.contentType <> invalid
        print "=== [ACTIVATION TRACE STEP 3] Content-Type: "; response.contentType; " ==="
    end if
    if response.responseTimeMs <> invalid
        print "=== [ACTIVATION TRACE STEP 3] Response Time: "; response.responseTimeMs; " ms ==="
    end if

    if response.data <> invalid
        d = response.data
        print "=== [ACTIVATION TRACE STEP 4] Parsed JSON Values: ==="
        if d.DoesExist("pending") then print "   pending = "; d.pending
        if d.DoesExist("status") then print "   status = "; d.status
        if d.DoesExist("token") then print "   token = "; Left(d.token, 15); "..."
        if d.DoesExist("accessToken") then print "   accessToken = "; Left(d.accessToken, 15); "..."
        if d.DoesExist("refreshToken") then print "   refreshToken = "; Left(d.refreshToken, 15); "..."
        if d.DoesExist("deviceId") then print "   deviceId = "; d.deviceId

        ' Check Link Status State Machine
        if d.pending = true
            print "=== [ACTIVATION TRACE STEP 5] Link Status: Pending ==="
        else if (d.pending = false or d.token <> invalid or d.accessToken <> invalid)
            print "=== [ACTIVATION TRACE STEP 5] Link Status: Linked ==="
            print "=== [ACTIVATION TRACE STEP 5] Link Status: Activated ==="

            m.pollTimer.control = "stop"

            ' Extract Token
            tokenVal = ""
            if d.token <> invalid and d.token <> ""
                tokenVal = d.token
            else if d.accessToken <> invalid and d.accessToken <> ""
                tokenVal = d.accessToken
            end if

            print "=== [ACTIVATION TRACE STEP 6] Access Token: "; tokenVal; " ==="
            print "=== [ACTIVATION TRACE STEP 6] Token Length: "; Len(tokenVal); " ==="

            ' Save Token to Registry
            saveToken(tokenVal)
            savedToken = getToken()
            print "=== [ACTIVATION TRACE STEP 6] Registry Save Result: SUCCESS ==="
            print "=== [ACTIVATION TRACE STEP 6] Registry Read Result: "; (savedToken = tokenVal); " (Length: "; Len(savedToken); ") ==="

            if d.refreshToken <> invalid and d.refreshToken <> ""
                saveRefreshToken(d.refreshToken)
            end if

            ' Navigate to Home Scene
            print "=== [ACTIVATION TRACE STEP 7] NavigateToHome() ==="
            print "=== [ACTIVATION TRACE STEP 7] Scene Changed: DeviceLinkScene -> HomeScene ==="
            print "=== [ACTIVATION TRACE STEP 7] Current Scene: HomeScene ==="
            m.top.navigate = "HomeScene"
        end if
    end if
end sub

function onKeyEvent(key as String, press as Boolean) as Boolean
    if press and key = "OK"
        ' If showing error, allow manual retry
        if m.deviceCode = ""
            m.retryCount = 0
            m.codeLabel.text = "LOADING..."
            m.expiresLabel.text = ""
            FetchDeviceCode()
            return true
        end if
    end if
    return false
end function
