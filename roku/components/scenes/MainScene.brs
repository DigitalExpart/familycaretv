sub init()
    m.screenContainer = m.top.findNode("screenContainer")
    m.screenStack = []
    
    ' Start with the Splash Screen
    NavigateTo("SplashScene")
end sub

sub NavigateTo(screenName as String)
    if m.currentScreen <> invalid
        m.currentScreen.visible = false
        m.screenStack.push(m.currentScreen)
    end if
    
    newScreen = CreateObject("roSGNode", screenName)
    m.screenContainer.appendChild(newScreen)
    m.currentScreen = newScreen
    m.currentScreen.visible = true
    m.currentScreen.setFocus(true)
    
    m.currentScreen.observeField("navigate", "OnNavigateRequest")
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
        end if
    end if
    return handled
end function
