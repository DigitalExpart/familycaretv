sub init()
    m.pulseAnim = m.top.findNode("pulseAnim")
    m.logoFadeAnim = m.top.findNode("logoFadeAnim")
    
    m.tipLabel = m.top.findNode("tipLabel")
    m.tipTimer = m.top.findNode("tipTimer")
    m.tipFadeAnim = m.top.findNode("tipFadeAnim")
    m.tipFader = m.top.findNode("tipFader")
    
    m.tipTimer.observeField("fire", "OnTipTimer")
    
    m.tips = [
        "Drink at least 8 glasses of water a day.",
        "Take a 5-minute walk every hour to stay active.",
        "Psalm 46:1 - God is our refuge and strength.",
        "Don't forget to take your evening medications.",
        "A good laugh and a long sleep are the best cures."
    ]
    m.currentTipIndex = 0
    
    ' Start animations
    m.pulseAnim.control = "start"
    m.logoFadeAnim.control = "start"
    
    ' Show first tip
    ShowNextTip()
    m.tipTimer.control = "start"
end sub

sub ShowNextTip()
    m.tipLabel.text = m.tips[m.currentTipIndex]
    m.currentTipIndex = m.currentTipIndex + 1
    if m.currentTipIndex >= m.tips.count()
        m.currentTipIndex = 0
    end if
    
    m.tipFader.keyValue = [0.0, 1.0]
    m.tipFadeAnim.control = "start"
end sub

sub OnTipTimer()
    ' Fade out then fade in next
    ShowNextTip()
end sub

function onKeyEvent(key as String, press as Boolean) as Boolean
    if press
        ' Any key press exits screensaver
        m.top.getScene().dialog = invalid ' Close dialogs if any
        ' We assume MainScene or equivalent will handle returning to HomeScene
        ' For screensavers, Roku typically handles closing the screensaver automatically 
        ' if launched natively, but if it's a custom scene we must navigate back.
        ' However, since this is invoked via navigate field on HomeSceneV2,
        ' we should tell Main.brs to pop the scene, but wait! We can just close it.
        ' Better yet, we can tell the app to go back to HomeSceneV2.
        
        ' Just let the system handle "back" if we were pushed to the screen stack
        return false
    end if
    return false
end function
