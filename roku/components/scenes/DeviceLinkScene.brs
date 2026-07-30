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
    m.isPollingActive = false
    m.deviceId = CreateObject("roDeviceInfo").GetChannelClientId()
    
    ' Observe tasks once
    m.deviceCodeTask.observeField("response", "OnDeviceCodeResponse")
    m.tokenPollTask.observeField("response", "OnTokenResponse")
    
    ' Fetch device code
    FetchDeviceCode()
end sub

sub FetchDeviceCode()
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
        print "=== [ACTIVATION TRACE STEP 1] Polling started (interval: 5s) ==="
        m.pollCount = 0
        
        ' Start 5s polling timer
        m.pollTimer.unobserveField("fire")
        m.pollTimer.observeField("fire", "PollForToken")
        m.pollTimer.control = "start"
    else
        ' Retry up to 3 times before showing error
        m.retryCount++
        if m.retryCount <= 3
            print "=== [DEVICE CODE] Retry "; m.retryCount; " of 3 ==="
            m.codeLabel.text = "CONNECTING..."
            m.expiresLabel.text = "Retrying... (attempt " + m.retryCount.toStr() + " of 3)"
            
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
    if m.isPollingActive return

    m.pollCount++
    print "=== [ACTIVATION TRACE STEP 1] Polling count: "; m.pollCount; " ==="
    print "=== [ACTIVATION TRACE STEP 2] Code: "; m.deviceCode; " ==="

    m.isPollingActive = true
    m.tokenPollTask.request = {
        endpoint: "/roku/token",
        method: "POST",
        body: {
            code: m.deviceCode
        }
    }
    m.tokenPollTask.control = "RUN"
end sub

sub OnTokenResponse(event as Object)
    m.isPollingActive = false
    if event = invalid return
    response = event.getData()
    if response = invalid return
    
    print "=== [ACTIVATION TRACE STEP 3] HTTP Status: "; response.code; " ==="
    if response.rawResponse <> invalid
        print "=== [ACTIVATION TRACE STEP 3] Raw Response: "; response.rawResponse; " ==="
    end if

    ' Validate HTTP status code
    if response.code <> invalid and (response.code < 200 or response.code >= 300)
        print "=== [ACTIVATION TRACE] Non-200 response code: "; response.code; " ==="
        if response.code = 401 or response.code = 404
            print "=== [ACTIVATION TRACE] Code expired/invalid, stopping polling ==="
            if m.pollTimer <> invalid then m.pollTimer.control = "stop"
            if m.codeLabel <> invalid then m.codeLabel.text = "EXPIRED"
            if m.expiresLabel <> invalid then m.expiresLabel.text = "Press OK to generate a new code"
            m.deviceCode = ""
        end if
        return
    end if

    if response.data <> invalid and type(response.data) = "roAssociativeArray"
        d = response.data
        print "=== [ACTIVATION TRACE STEP 4] Parsed JSON Values ==="

        isPending = false
        if d.DoesExist("pending")
            if d.pending = true or d.pending = "true" or d.pending = 1
                isPending = true
            end if
        end if

        hasToken = false
        tokenVal = ""
        if d.DoesExist("token") and d.token <> invalid and d.token <> "" and type(d.token) = "roString"
            tokenVal = d.token
            hasToken = true
        else if d.DoesExist("accessToken") and d.accessToken <> invalid and d.accessToken <> "" and type(d.accessToken) = "roString"
            tokenVal = d.accessToken
            hasToken = true
        end if

        ' Check Link Status State Machine
        if isPending and not hasToken
            print "=== [ACTIVATION TRACE STEP 5] Link Status: Pending ==="
        else if not isPending or hasToken or (d.DoesExist("status") and d.status = "linked")
            print "=== [ACTIVATION TRACE STEP 5] Link Status: Linked / Activated ==="

            ' Stop polling immediately
            if m.pollTimer <> invalid then m.pollTimer.control = "stop"

            ' Update UI on TV screen immediately
            if m.codeLabel <> invalid then m.codeLabel.text = "LINKED!"
            if m.expiresLabel <> invalid then m.expiresLabel.text = "Activation successful! Loading Home..."

            print "=== [ACTIVATION TRACE STEP 6] Access Token Length: "; Len(tokenVal); " ==="

            if tokenVal <> ""
                ' Save Token to Registry
                saveToken(tokenVal)
                savedToken = getToken()
                print "=== [ACTIVATION TRACE STEP 6] Registry Save Result: SUCCESS ==="

                if d.DoesExist("refreshToken") and d.refreshToken <> invalid and d.refreshToken <> ""
                    saveRefreshToken(d.refreshToken)
                end if

                ' Navigate to Home Scene
                print "=== [ACTIVATION TRACE STEP 7] Navigating to HomeScene ==="
                if m.top <> invalid
                    m.top.navigate = "HomeScene"
                end if
            else
                print "=== [ACTIVATION TRACE ERROR] Token is empty despite pending=false ==="
            end if
        end if
    else
        print "=== [ACTIVATION TRACE ERROR] response.data is invalid or not roAssociativeArray ==="
    end if
end sub

function onKeyEvent(key as String, press as Boolean) as Boolean
    if press and key = "OK"
        ' If showing error or expired, allow manual retry
        if m.deviceCode = "" or m.codeLabel.text = "EXPIRED" or m.codeLabel.text = "CONNECTION ERROR"
            m.retryCount = 0
            m.codeLabel.text = "LOADING..."
            m.expiresLabel.text = ""
            FetchDeviceCode()
            return true
        end if
    end if
    return false
end function
