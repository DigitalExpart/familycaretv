sub init()
    m.validateTask = m.top.findNode("validateTask")
    if m.validateTask <> invalid
        m.validateTask.observeField("response", "onValidateResponse")
    end if

    m.timer = m.top.findNode("timer")
    m.timer.duration = 1.5
    m.timer.repeat = false
    m.timer.observeField("fire", "onSplashComplete")
    m.timer.control = "start"
end sub

sub onSplashComplete()
    token = getToken()
    if token = "" or token = invalid
        ' Check if there is a pending device code already linked on server
        pendingCode = getPendingCode()
        if pendingCode <> "" and pendingCode <> invalid
            print "=== [AUTH] Found pending code in registry: "; pendingCode; " -> Checking activation ==="
            m.pendingCheckTask = CreateObject("roSGNode", "ApiTask")
            m.pendingCheckTask.observeField("response", "onPendingCheckResponse")
            m.pendingCheckTask.request = {
                endpoint: "/roku/token",
                method: "POST",
                timeoutMs: 3000,
                body: {
                    code: pendingCode
                }
            }
            m.pendingCheckTask.control = "RUN"
            
            m.pendingTimeoutTimer = CreateObject("roSGNode", "Timer")
            m.pendingTimeoutTimer.duration = 3.5
            m.pendingTimeoutTimer.repeat = false
            m.pendingTimeoutTimer.observeField("fire", "onPendingCheckTimeout")
            m.top.appendChild(m.pendingTimeoutTimer)
            m.pendingTimeoutTimer.control = "start"
            return
        end if

        print "=== [AUTH] No token found in registry -> Navigate to DeviceLinkScene ==="
        m.top.navigate = "DeviceLinkScene"
    else
        print "=== [AUTH] Token found in registry -> Validating session with backend ==="
        if m.validateTask <> invalid
            m.validateTask.request = {
                endpoint: "/roku/validate-token",
                method: "POST",
                body: {
                    token: token
                }
            }
            m.validateTask.control = "RUN"
            
            ' Safety fallback timer: if network/validation hangs > 4s, proceed to DeviceLinkScene
            m.fallbackTimer = CreateObject("roSGNode", "Timer")
            m.fallbackTimer.duration = 4.0
            m.fallbackTimer.repeat = false
            m.fallbackTimer.observeField("fire", "onValidateTimeout")
            m.top.appendChild(m.fallbackTimer)
            m.fallbackTimer.control = "start"
        else
            m.top.navigate = "HomeScene"
        end if
    end if
end sub

sub onPendingCheckResponse(event as Object)
    if m.pendingTimeoutTimer <> invalid then m.pendingTimeoutTimer.control = "stop"
    response = event.getData()
    if response <> invalid and (response.code = 200 or response.code = 201) and response.data <> invalid
        d = response.data
        targetObj = d
        if d.DoesExist("data") and d.data <> invalid and type(d.data) = "roAssociativeArray"
            targetObj = d.data
        end if

        tokenVal = ""
        refreshTokenVal = ""
        if targetObj.DoesExist("token") and targetObj.token <> invalid
            tokenVal = targetObj.token.toStr().Trim()
        else if targetObj.DoesExist("accessToken") and targetObj.accessToken <> invalid
            tokenVal = targetObj.accessToken.toStr().Trim()
        end if

        if targetObj.DoesExist("refreshToken") and targetObj.refreshToken <> invalid
            refreshTokenVal = targetObj.refreshToken.toStr().Trim()
        end if

        hasToken = (tokenVal <> "" and tokenVal <> invalid)
        
        if hasToken
            print "=== [AUTH] Pending code was linked! Storing token and proceeding to Home ==="
            saveToken(tokenVal)
            clearPendingCode()
            if refreshTokenVal <> ""
                saveRefreshToken(refreshTokenVal)
            end if
            m.top.navigate = "HomeScene"
            return
        end if
    end if

    print "=== [AUTH] Pending code not linked yet -> Navigate to DeviceLinkScene ==="
    m.top.navigate = "DeviceLinkScene"
end sub

sub onPendingCheckTimeout()
    print "=== [AUTH] Pending check timed out -> Navigate to DeviceLinkScene ==="
    m.top.navigate = "DeviceLinkScene"
end sub

sub onValidateTimeout()
    print "=== [AUTH] Token validation timed out -> Fallback to DeviceLinkScene ==="
    clearAllTokens()
    m.top.navigate = "DeviceLinkScene"
end sub

sub onValidateResponse(event as Object)
    if m.fallbackTimer <> invalid
        m.fallbackTimer.control = "stop"
    end if

    response = event.getData()
    if response <> invalid and (response.code = 200 or response.code = 201) and response.data <> invalid and response.data.valid = true
        print "=== [AUTH] Token validated successfully -> Navigate to HomeScene ==="
        m.top.navigate = "HomeScene"
    else
        print "=== [AUTH] Token invalid or expired -> Clearing auth and navigating to DeviceLinkScene ==="
        clearAllTokens()
        m.top.navigate = "DeviceLinkScene"
    end if
end sub
