sub init()
    m.accountInfo = m.top.findNode("accountInfo")
    m.fetchTask = m.top.findNode("fetchTask")
    m.fetchTask.observeField("response", "onDataReceived")
    m.top.observeField("visible", "onVisibleChange")
end sub
sub onVisibleChange()
    if m.top.visible = true
        m.fetchTask.request = { endpoint: "/roku/subscription-status", method: "GET" }
        m.fetchTask.control = "RUN"
    end if
end sub
sub onDataReceived()
    res = m.fetchTask.response
    if res <> invalid and res.statusCode = 200 and res.data <> invalid
        m.accountInfo.text = "Subscription: " + res.data.subscriptionStatus
    end if
end sub
