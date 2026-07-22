sub init()
    print "=== [ROKU STARTUP] MainScene.init() Started ==="
    m.screenContainer = m.top.findNode("screenContainer")
    m.screenStack = []
    
    ' Start with the Splash Screen
    NavigateTo("SplashScene")
    print "=== [ROKU STARTUP] MainScene.init() Finished ==="
end sub

sub NavigateTo(screenName as String)
    print "=== [ROKU STARTUP] NavigateTo('"; screenName; "') ==="
    if m.currentScreen <> invalid
        m.currentScreen.visible = false
        ' Don't push SplashScene or DeviceLinkScene to the back stack
        if m.currentScreen.subtype() <> "SplashScene" and m.currentScreen.subtype() <> "DeviceLinkScene"
            m.screenStack.push(m.currentScreen)
        end if
    end if
    
    ' Clear stack if navigating to HomeScene (it's the root)
    if screenName = "HomeScene" or screenName = "DeviceLinkScene"
        m.screenStack.clear()
    end if
    
    newScreen = CreateObject("roSGNode", screenName)
    if newScreen <> invalid
        m.screenContainer.appendChild(newScreen)
        m.currentScreen = newScreen
        m.currentScreen.visible = true
        m.currentScreen.setFocus(true)
        m.currentScreen.observeField("navigate", "OnNavigateRequest")
        print "=== [ROKU STARTUP] Successfully rendered screen: "; screenName; " ==="
    else
        print "=== [ROKU STARTUP ERROR] Failed to CreateObject for screen: "; screenName; " ==="
    end if
end sub

sub OnNavigateRequest(event as Object)
    targetScreen = event.getData()
    if targetScreen <> ""
        NavigateTo(targetScreen)
    end if
end sub

function onKeyEvent(key as String, press as Boolean) as Boolean
    handled = false
    if press
        if key = "back"
            if m.screenStack.count() > 0
                m.screenContainer.removeChild(m.currentScreen)
                m.currentScreen = invalid
                m.currentScreen = m.screenStack.pop()
                m.currentScreen.visible = true
                m.currentScreen.setFocus(true)
                handled = true
            end if
            ' If screenStack is empty, handled remains false, allowing Roku OS to exit app
        end if
    end if
    return handled
end function
