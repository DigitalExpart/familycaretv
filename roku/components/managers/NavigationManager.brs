sub init()
    m.screenStack = []
end sub

function pushScreen(args as Object)
    screenName = args.screen
    newScreen = CreateObject("roSGNode", screenName)
    
    if newScreen <> invalid
        ' Hide current screen
        if m.screenStack.count() > 0
            currentScreen = m.screenStack.peek()
            currentScreen.visible = false
        end if
        
        m.screenStack.push(newScreen)
        m.top.appendChild(newScreen)
        newScreen.visible = true
        newScreen.setFocus(true)
    end if
end function

function popScreen() as Boolean
    if m.screenStack.count() > 1
        currentScreen = m.screenStack.pop()
        m.top.removeChild(currentScreen)
        
        previousScreen = m.screenStack.peek()
        previousScreen.visible = true
        previousScreen.setFocus(true)
        return true
    end if
    return false
end function
