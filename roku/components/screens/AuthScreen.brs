sub init()
    m.codeLabel = m.top.findNode("codeLabel")
    m.authTask = m.top.findNode("authTask")
    
    m.authTask.observeField("response", "onAuthResponse")
    
    m.deviceId = CreateObject("roDeviceInfo").GetChannelClientId()
    
    m.authTask.request = {
        endpoint: "/roku/device-code",
        method: "POST"
    }
    m.authTask.control = "RUN"
end sub

sub onAuthResponse()
    res = m.authTask.response
    if res <> invalid and res.statusCode = 201 and res.data <> invalid
        m.codeLabel.text = res.data.code
        ' In a real scenario, we would start a timer to poll for token using this deviceId
    end if
end sub
