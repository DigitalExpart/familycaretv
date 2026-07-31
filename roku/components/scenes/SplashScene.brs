sub init()
    m.timer = createObject("roSGNode", "Timer")
    m.timer.duration = 2.5
    m.timer.repeat = false
    m.timer.observeField("fire", "onSplashComplete")
    m.timer.control = "start"
end sub

sub onSplashComplete()
    m.top.signalBeacon("AppLaunchComplete")
    ' navigate to main scene
    m.top.getScene().navigateToMain()
end sub
