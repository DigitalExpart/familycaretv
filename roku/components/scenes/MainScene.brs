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
    oldScreen = m.currentScreen
    
    if m.currentScreen <> invalid
        m.currentScreen.visible = false
        ' Don't push SplashScene or DeviceLinkScene to the back stack
        if m.currentScreen.subtype() <> "SplashScene" and m.currentScreen.subtype() <> "DeviceLinkScene"
            m.screenStack.push(m.currentScreen)
        end if
    end if
    
    ' Clear stack and clean container if navigating to HomeScene / HomeSceneV2 / DeviceLinkScene
    if screenName = "HomeScene" or screenName = "HomeSceneV2" or screenName = "DeviceLinkScene"
        m.screenStack.clear()
        while m.screenContainer.getChildCount() > 0
            m.screenContainer.removeChildIndex(0)
        end while
        m.currentScreen = invalid
    end if
    
    ' Map legacy HomeScene to HomeSceneV2
    if screenName = "HomeScene"
        screenName = "HomeSceneV2"
    end if
    
    newScreen = CreateObject("roSGNode", screenName)
    if newScreen <> invalid
        m.screenContainer.appendChild(newScreen)
        m.currentScreen = newScreen
        m.currentScreen.visible = true
        m.currentScreen.setFocus(true)
        m.currentScreen.observeField("navigate", "OnNavigateRequest")
        
        ' Clean up transient scene nodes from screen container (they are never back-navigated to)
        if oldScreen <> invalid and (oldScreen.subtype() = "SplashScene" or oldScreen.subtype() = "DeviceLinkScene" or oldScreen.subtype() = "ScreensaverScene")
            m.screenContainer.removeChild(oldScreen)
        end if
        
        print "=== [ROKU STARTUP] Successfully rendered screen: "; screenName; " ==="
    else
        print "=== [ROKU STARTUP ERROR] Failed to CreateObject for screen: "; screenName; " ==="
    end if
end sub

sub OnNavigateRequest(event as Object)
    targetScreen = event.getData()
    print "[MAIN] navigation-received=" + targetScreen
    if targetScreen <> ""
        NavigateTo(targetScreen)
    end if
end sub

function onKeyEvent(key as String, press as Boolean) as Boolean
    handled = false
    if press
        if key = "back" or key = "Back"
            print "[MAIN] Back pressed, stack count = "; m.screenStack.count()
            if m.screenStack.count() > 0
                m.screenContainer.removeChild(m.currentScreen)
                m.currentScreen = invalid
                m.currentScreen = m.screenStack.pop()
                m.currentScreen.visible = true
                m.currentScreen.setFocus(true)
                handled = true
            else if m.currentScreen <> invalid and m.currentScreen.subtype() <> "HomeSceneV2"
                ' Fallback: return to HomeSceneV2 rather than exiting app
                NavigateTo("HomeSceneV2")
                handled = true
            end if
            ' If on HomeSceneV2 and stack is empty, handled remains false, allowing Roku OS to exit app
        end if
    end if
    return handled
end function
