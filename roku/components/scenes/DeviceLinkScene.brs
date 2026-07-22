sub init()
    m.instructionLabel = m.top.findNode("instructionLabel")
    m.codeLabel = m.top.findNode("codeLabel")
    m.expiresLabel = m.top.findNode("expiresLabel")
    m.deviceCodeTask = m.top.findNode("deviceCodeTask")
    m.tokenPollTask = m.top.findNode("tokenPollTask")
    m.pollTimer = m.top.findNode("pollTimer")
    
    m.instructionLabel.text = "Open Mobile App -> Profile -> Connect Roku TV and enter code:"
    m.expiresLabel.text = "Code expires in 15 minutes"
    m.codeLabel.text = "LOADING..."
    
    m.deviceCode = ""
    
    ' Fetch device code
    m.deviceCodeTask.observeField("response", "OnDeviceCodeResponse")
    m.deviceCodeTask.request = {
        endpoint: "/roku/device-code",
        method: "POST"
    }
    m.deviceCodeTask.control = "RUN"
end sub

sub OnDeviceCodeResponse(event as Object)
    response = event.getData()
    if response <> invalid and response.data <> invalid and response.data.code <> invalid
        m.deviceCode = response.data.code
        m.codeLabel.text = m.deviceCode
        
        ' Start polling
        m.pollTimer.observeField("fire", "PollForToken")
        m.pollTimer.control = "start"
    else
        m.codeLabel.text = "ERROR. PLEASE RESTART."
    end if
end sub

sub PollForToken()
    m.tokenPollTask.observeField("response", "OnTokenResponse")
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
    response = event.getData()
    if response <> invalid and response.code = 200 and response.data <> invalid and response.data.token <> invalid
        m.pollTimer.control = "stop"
        saveToken(response.data.token)
        if response.data.refreshToken <> invalid
            saveRefreshToken(response.data.refreshToken)
        end if
        m.top.navigate = "HomeScene"
    end if
end sub
