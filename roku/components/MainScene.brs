sub init()
    m.navigationManager = m.top.findNode("navigationManager")
    m.pollingTask = m.top.findNode("pollingTask")
    m.notificationBanner = m.top.findNode("notificationBanner")
    
    ' Start with the Splash or Auth screen
    ' If token exists, go to Home, otherwise Auth
    token = GetRegistryToken()
    if token <> invalid and token <> ""
        m.navigationManager.callFunc("pushScreen", { screen: "HomeScreen" })
        m.pollingTask.control = "RUN"
    else
        m.navigationManager.callFunc("pushScreen", { screen: "AuthScreen" })
    end if

    ' Observe polling task for new notifications
    m.pollingTask.observeField("newNotifications", "onNewNotifications")
    m.notificationBanner.observeField("visible", "onBannerVisibilityChanged")
    
    m.notificationQueue = []
end sub

sub onNextScreenChange()
    nextScreen = m.top.nextScreen
    if nextScreen <> ""
        m.navigationManager.callFunc("pushScreen", { screen: nextScreen })
    end if
end sub

sub onNewNotifications()
    notifications = m.pollingTask.newNotifications
    if notifications <> invalid and notifications.count() > 0
        for each notif in notifications
            m.notificationQueue.push(notif)
        end for
        
        if m.notificationBanner.visible = false and m.notificationQueue.count() > 0
            showNextNotification()
        end if
    end if
end sub

sub showNextNotification()
    if m.notificationQueue.count() > 0
        notif = m.notificationQueue.shift()
        m.notificationBanner.notification = notif
        m.notificationBanner.callFunc("showBanner", {})
    end if
end sub

sub onBannerVisibilityChanged()
    if m.notificationBanner.visible = false
        showNextNotification()
    end if
end sub

function onKeyEvent(key as String, press as Boolean) as Boolean
    handled = false
    if press then
        if key = "back"
            handled = m.navigationManager.callFunc("popScreen", {})
        end if
    end if
    return handled
end function

function GetRegistryToken() as String
    sec = CreateObject("roRegistrySection", "Authentication")
    if sec.Exists("AccessToken")
        return sec.Read("AccessToken")
    end if
    return ""
end function
