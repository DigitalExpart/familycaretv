sub init()
    m.subtitleLabel = m.top.findNode("subtitleLabel")
    m.subtitleLabel.text = "Health. Wellness. Family."
    
    m.validateTask = m.top.findNode("validateTask")
    m.refreshTask = m.top.findNode("refreshTask")
    
    m.initTimer = m.top.findNode("initTimer")
    m.initTimer.observeField("fire", "OnTimerComplete")
    m.initTimer.control = "start"
end sub

sub OnTimerComplete()
    token = getToken()
    if token <> ""
        ' We have a stored token — validate it with the backend
        m.validateTask.observeField("response", "OnValidateResponse")
        m.validateTask.request = {
            endpoint: "/roku/validate-token",
            method: "POST",
            body: { token: token }
        }
        m.validateTask.control = "RUN"
    else
        ' No token at all — go to pairing
        m.top.navigate = "DeviceLinkScene"
    end if
end sub

sub OnValidateResponse(event as Object)
    response = event.getData()
    if response <> invalid and response.data <> invalid and response.data.valid = true
        ' Token is still valid — go straight to Home
        m.top.navigate = "HomeScene"
    else if response <> invalid and response.data <> invalid and response.data.reason = "expired"
        ' Access token expired — try refreshing
        refreshToken = getRefreshToken()
        if refreshToken <> ""
            m.refreshTask.observeField("response", "OnRefreshResponse")
            m.refreshTask.request = {
                endpoint: "/roku/refresh",
                method: "POST",
                body: { refreshToken: refreshToken }
            }
            m.refreshTask.control = "RUN"
        else
            ' No refresh token — must re-pair
            clearAllTokens()
            m.top.navigate = "DeviceLinkScene"
        end if
    else
        ' Invalid token — clear and re-pair
        clearAllTokens()
        m.top.navigate = "DeviceLinkScene"
    end if
end sub

sub OnRefreshResponse(event as Object)
    response = event.getData()
    if response <> invalid and response.code >= 200 and response.code < 300 and response.data <> invalid and response.data.accessToken <> invalid
        ' Refresh succeeded — save new tokens and go to Home
        saveToken(response.data.accessToken)
        if response.data.refreshToken <> invalid
            saveRefreshToken(response.data.refreshToken)
        end if
        m.top.navigate = "HomeScene"
    else
        ' Refresh failed — must re-pair
        clearAllTokens()
        m.top.navigate = "DeviceLinkScene"
    end if
end sub

