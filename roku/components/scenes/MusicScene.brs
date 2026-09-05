sub init()
    m.albumArtPoster = m.top.findNode("albumArtPoster")
    m.trackTitle = m.top.findNode("trackTitle")
    m.trackArtist = m.top.findNode("trackArtist")
    m.progressBar = m.top.findNode("progressBar")
    m.timeElapsed = m.top.findNode("timeElapsed")
    m.timeTotal = m.top.findNode("timeTotal")

    m.playLabel = m.top.findNode("playLabel")
    m.playBg = m.top.findNode("playBg")

    m.prevFocusBorder = m.top.findNode("prevFocusBorder")
    m.playFocusBorder = m.top.findNode("playFocusBorder")
    m.nextFocusBorder = m.top.findNode("nextFocusBorder")

    m.playlistGrid = m.top.findNode("playlistGrid")
    m.emptyState = m.top.findNode("emptyState")
    m.loadingOverlay = m.top.findNode("loadingOverlay")
    m.errorDialog = m.top.findNode("errorDialog")

    m.audioPlayer = m.top.findNode("audioPlayer")
    if m.audioPlayer <> invalid
        m.audioPlayer.observeField("position", "OnAudioPositionChange")
        m.audioPlayer.observeField("duration", "OnAudioDurationChange")
        m.audioPlayer.observeField("state", "OnAudioStateChange")
    end if

    m.musicTask = m.top.findNode("musicTask")
    m.musicTask.observeField("response", "OnMusicResponse")

    m.playlistGrid.observeField("itemSelected", "OnTrackSelected")

    ' 0 = Prev, 1 = Play/Pause, 2 = Next, 3 = Playlist Grid
    m.focusZone = 3
    m.isPlaying = false
    m.activeTrackIdx = 0
    m.tracksData = []

    FetchMusic()
end sub

sub FetchMusic()
    m.loadingOverlay.visible = true
    if m.emptyState <> invalid then m.emptyState.visible = false
    m.playlistGrid.visible = false

    m.musicTask.request = {
        endpoint: "/roku/music",
        method: "GET"
    }
    m.musicTask.control = "RUN"
end sub

sub OnMusicResponse(event as Object)
    m.loadingOverlay.visible = false
    response = event.getData()

    if response <> invalid and response.code = 200 and response.data <> invalid
        tracks = []
        if response.data.tracks <> invalid
            tracks = response.data.tracks
        else if type(response.data) = "roArray"
            tracks = response.data
        end if

        m.tracksData = tracks

        if tracks.count() = 0
            if m.emptyState <> invalid then m.emptyState.visible = true
            m.playlistGrid.visible = false
            SetFocusZone(1)
            return
        end if

        if m.emptyState <> invalid then m.emptyState.visible = false
        m.playlistGrid.visible = true

        content = CreateObject("roSGNode", "ContentNode")
        for each track in tracks
            item = CreateObject("roSGNode", "ContentNode")
            item.title = track.title
            
            subText = ""
            if track.artist <> invalid and track.artist <> ""
                subText = track.artist
            end if
            if track.duration <> invalid and track.duration <> ""
                if subText <> "" then subText = subText + " • "
                subText = subText + track.duration
            end if
            item.shortDescriptionLine1 = subText

            if track.artworkUrl <> invalid and track.artworkUrl <> ""
                item.HDPosterUrl = track.artworkUrl
            else
                item.HDPosterUrl = "pkg:/images/icon_music.png"
            end if
            content.appendChild(item)
        end for

        m.playlistGrid.content = content
        SelectTrack(0)
        SetFocusZone(3)
    else
        ' Never substitute fake tracks on API failure
        m.playlistGrid.visible = false
        if m.emptyState <> invalid then m.emptyState.visible = false
        if m.errorDialog <> invalid
            m.errorDialog.message = "Unable to load music library. Please check network connection."
            m.errorDialog.show = true
        end if
        SetFocusZone(1)
    end if
end sub

sub SelectTrack(index as Integer)
    if m.tracksData <> invalid and index >= 0 and index < m.tracksData.count()
        m.activeTrackIdx = index
        track = m.tracksData[index]

        m.trackTitle.text = track.title
        if track.artist <> invalid and track.artist <> ""
            m.trackArtist.text = track.artist
        else
            m.trackArtist.text = "FamilyCare Music"
        end if

        if track.artworkUrl <> invalid and track.artworkUrl <> ""
            m.albumArtPoster.uri = track.artworkUrl
        else
            m.albumArtPoster.uri = "pkg:/images/icon_music.png"
        end if

        m.timeTotal.text = "00:00"
        m.timeElapsed.text = "00:00"
        m.progressBar.width = 0

        ' Real audio playback using real audioUrl
        if track.audioUrl <> invalid and track.audioUrl <> "" and m.audioPlayer <> invalid
            song = CreateObject("roSGNode", "ContentNode")
            song.url = track.audioUrl
            m.audioPlayer.content = song
            m.audioPlayer.control = "play"
            m.isPlaying = true
            m.playLabel.text = "❚❚ Pause"
        else if m.audioPlayer <> invalid
            m.audioPlayer.control = "stop"
            m.isPlaying = false
            m.playLabel.text = "► Play"
        end if
    end if
end sub

sub OnAudioPositionChange()
    if m.audioPlayer <> invalid and m.audioPlayer.duration > 0
        pos = m.audioPlayer.position
        dur = m.audioPlayer.duration

        pct = pos / dur
        if pct > 1.0 then pct = 1.0
        m.progressBar.width = Int(pct * 520)

        posMin = Int(pos / 60)
        posSec = Int(pos MOD 60)
        posSecStr = StrI(posSec).Trim()
        if posSec < 10 then posSecStr = "0" + posSecStr
        m.timeElapsed.text = StrI(posMin).Trim() + ":" + posSecStr
    end if
end sub

sub OnAudioDurationChange()
    if m.audioPlayer <> invalid and m.audioPlayer.duration > 0
        dur = m.audioPlayer.duration
        durMin = Int(dur / 60)
        durSec = Int(dur MOD 60)
        durSecStr = StrI(durSec).Trim()
        if durSec < 10 then durSecStr = "0" + durSecStr
        m.timeTotal.text = StrI(durMin).Trim() + ":" + durSecStr
    end if
end sub

sub OnAudioStateChange()
    if m.audioPlayer <> invalid
        state = m.audioPlayer.state
        if state = "finished"
            if m.tracksData <> invalid and m.activeTrackIdx < m.tracksData.count() - 1
                SelectTrack(m.activeTrackIdx + 1)
            else
                m.isPlaying = false
                m.playLabel.text = "► Play"
            end if
        else if state = "playing"
            m.isPlaying = true
            m.playLabel.text = "❚❚ Pause"
        else if state = "paused" or state = "stopped"
            m.isPlaying = false
            m.playLabel.text = "► Play"
        end if
    end if
end sub

sub TogglePlayPause()
    if m.audioPlayer <> invalid and m.audioPlayer.content <> invalid
        if m.isPlaying
            m.audioPlayer.control = "pause"
            m.isPlaying = false
            m.playLabel.text = "► Play"
        else
            m.audioPlayer.control = "resume"
            m.isPlaying = true
            m.playLabel.text = "❚❚ Pause"
        end if
    end if
end sub

sub SetFocusZone(zone as Integer)
    m.focusZone = zone
    m.prevFocusBorder.visible = (zone = 0)
    m.playFocusBorder.visible = (zone = 1)
    m.nextFocusBorder.visible = (zone = 2)

    if zone = 3 and m.playlistGrid.visible
        m.playlistGrid.setFocus(true)
    else
        m.top.setFocus(true)
    end if
end sub

sub OnTrackSelected()
    selectedIndex = m.playlistGrid.itemSelected
    SelectTrack(selectedIndex)
end sub

function onKeyEvent(key as String, press as Boolean) as Boolean
    handled = false
    if press
        if m.focusZone = 3
            ' Playlist grid focused
            if key = "left"
                SetFocusZone(1) ' Focus Play/Pause button
                handled = true
            else if key = "back"
                if m.audioPlayer <> invalid then m.audioPlayer.control = "stop"
                m.top.navigate = "HomeScene"
                handled = true
            end if
        else
            ' Player controls focused
            if key = "right"
                if m.focusZone < 2
                    SetFocusZone(m.focusZone + 1)
                    handled = true
                else if m.playlistGrid.visible
                    SetFocusZone(3) ' Move to playlist grid
                    handled = true
                end if
            else if key = "left"
                if m.focusZone > 0
                    SetFocusZone(m.focusZone - 1)
                    handled = true
                end if
            else if key = "OK"
                if m.focusZone = 0
                    ' Prev track
                    if m.activeTrackIdx > 0
                        SelectTrack(m.activeTrackIdx - 1)
                    end if
                else if m.focusZone = 1
                    ' Play / Pause
                    TogglePlayPause()
                else if m.focusZone = 2
                    ' Next track
                    if m.tracksData <> invalid and m.activeTrackIdx < m.tracksData.count() - 1
                        SelectTrack(m.activeTrackIdx + 1)
                    end if
                end if
                handled = true
            else if key = "back"
                if m.audioPlayer <> invalid then m.audioPlayer.control = "stop"
                m.top.navigate = "HomeScene"
                handled = true
            end if
        end if
    end if
    return handled
end function

