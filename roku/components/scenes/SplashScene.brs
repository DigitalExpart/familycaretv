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
    m.top.signalBeacon("AppLaunchComplete")
    
    token = getToken()
    if token = "" or token = invalid
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
        else
            m.top.navigate = "HomeScene"
        end if
    end if
end sub

sub onValidateResponse(event as Object)
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
