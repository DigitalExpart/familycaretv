sub Main()
    print "=== [ROKU STARTUP] Main() ==="
    showChannelSGScreen()
end sub

sub showChannelSGScreen()
    print "=== [ROKU STARTUP] Creating roSGScreen ==="
    screen = CreateObject("roSGScreen")
    m.port = CreateObject("roMessagePort")
    screen.setMessagePort(m.port)
    print "=== [ROKU STARTUP] Screen Created ==="
    
    scene = screen.CreateScene("MainScene")
    if scene <> invalid
        print "=== [ROKU STARTUP] Scene Created ==="
        print "=== [ROKU STARTUP] Scene Loaded ==="
    else
        print "=== [ROKU STARTUP ERROR] CreateScene('MainScene') returned INVALID! ==="
    end if

    print "=== [ROKU STARTUP] Screen Shown ==="
    screen.show()
    print "=== [ROKU STARTUP] First Render ==="
    
    while(true)
        msg = wait(0, m.port)
        msgType = type(msg)
        if msgType = "roSGScreenEvent"
            if msg.isScreenClosed() then 
                print "=== [ROKU STARTUP] Screen Closed -> Exiting App ==="
                return
            end if
        end if
    end while
end sub
