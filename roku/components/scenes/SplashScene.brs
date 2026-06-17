sub init()
    m.subtitleLabel = m.top.findNode("subtitleLabel")
    m.subtitleLabel.text = tr("Splash_Subtitle") ' Localization
    
    m.initTimer = m.top.findNode("initTimer")
    m.initTimer.observeField("fire", "OnTimerComplete")
    m.initTimer.control = "start"
end sub

sub OnTimerComplete()
    token = getToken()
    if token <> ""
        m.top.navigate = "HomeScene"
    else
        m.top.navigate = "DeviceLinkScene"
    end if
end sub
