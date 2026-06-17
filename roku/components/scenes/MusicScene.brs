sub init()
    m.navBar = m.top.findNode("navBar")
    m.navBar.title = tr("Nav_Music")
    
    m.loadingLabel = m.top.findNode("loadingLabel")
    m.trackGrid = m.top.findNode("trackGrid")
    m.errorDialog = m.top.findNode("errorDialog")
    
    m.playerOverlay = m.top.findNode("playerOverlay")
    m.nowPlayingLabel = m.top.findNode("nowPlayingLabel")
    m.progressLabel = m.top.findNode("progressLabel")
    
    m.audioPlayer = m.top.findNode("audioPlayer")
    m.audioPlayer.observeField("state", "OnAudioStateChange")
    m.audioPlayer.observeField("position", "OnAudioPositionChange")
    
    m.musicTask = m.top.findNode("musicTask")
    m.musicTask.observeField("response", "OnMusicResponse")
    
    m.musicTask.request = {
        endpoint: "/audio",
        method: "GET"
    }
    m.musicTask.control = "RUN"
    
    m.trackGrid.observeField("itemSelected", "OnTrackSelected")
end sub

sub OnMusicResponse(event as Object)
    response = event.getData()
    m.loadingLabel.visible = false
    
    if response <> invalid and response.code = 200 and response.data <> invalid
        m.tracksData = response.data
        content = CreateObject("roSGNode", "ContentNode")
        
        for each track in response.data
            item = CreateObject("roSGNode", "ContentNode")
            item.title = track.title
            item.HDPosterUrl = "pkg:/images/icon_music.png"
            content.appendChild(item)
        end for
        
        if response.data.count() = 0
            m.loadingLabel.text = "No music found."
            m.loadingLabel.visible = true
        else
            m.trackGrid.content = content
            m.trackGrid.visible = true
            m.trackGrid.setFocus(true)
        end if
    else
        m.errorDialog.message = tr("Error_Network")
        m.errorDialog.show = true
    end if
end sub

sub OnTrackSelected()
    selectedIndex = m.trackGrid.itemSelected
    track = m.tracksData[selectedIndex]
    
    m.nowPlayingLabel.text = track.title
    m.playerOverlay.visible = true
    
    audioContent = CreateObject("roSGNode", "ContentNode")
    audioContent.url = track.url
    audioContent.streamFormat = "mp3"
    
    m.audioPlayer.content = audioContent
    m.audioPlayer.control = "play"
end sub

sub OnAudioStateChange()
    state = m.audioPlayer.state
    if state = "playing"
        m.progressLabel.text = "Playing..."
    else if state = "paused"
        m.progressLabel.text = "Paused"
    else if state = "stopped"
        m.progressLabel.text = "Stopped"
    end if
end sub

sub OnAudioPositionChange()
    pos = m.audioPlayer.position
    m.progressLabel.text = "Time: " + pos.toStr() + "s"
end sub

function onKeyEvent(key as String, press as Boolean) as Boolean
    handled = false
    if press
        if key = "play" or (key = "OK" and m.playerOverlay.visible)
            if m.audioPlayer.state = "playing"
                m.audioPlayer.control = "pause"
            else
                m.audioPlayer.control = "resume"
            end if
            handled = true
        else if key = "back"
            if m.playerOverlay.visible
                m.audioPlayer.control = "stop"
                m.playerOverlay.visible = false
                m.trackGrid.setFocus(true)
                handled = true
            end if
        end if
    end if
    return handled
end function
