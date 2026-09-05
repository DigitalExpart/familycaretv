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
        if m.audioPlayer.hasField("state")
            m.audioPlayer.observeField("state", "OnAudioStateChange")
        end if
    end if

    m.progressTimer = m.top.findNode("progressTimer")
    if m.progressTimer <> invalid
        m.progressTimer.observeField("fire", "OnProgressTick")
    end if

    m.musicTask = m.top.findNode("musicTask")
    if m.musicTask <> invalid
        m.musicTask.observeField("response", "OnMusicResponse")
    end if

    m.playlistGrid.observeField("itemSelected", "OnTrackSelected")

    ' 0 = Prev, 1 = Play/Pause, 2 = Next, 3 = Playlist Grid
    m.focusZone = 3
    m.isPlaying = false
    m.activeTrackIdx = 0
    m.tracksData = []
    m.elapsedSeconds = 0
    m.totalDurationSec = 225

    FetchMusic()
end sub

sub FetchMusic()
    m.loadingOverlay.visible = true
    if m.emptyState <> invalid then m.emptyState.visible = false
    m.playlistGrid.visible = false

    if m.musicTask <> invalid
        m.musicTask.request = {
            endpoint: "/audio",
            method: "GET"
        }
        m.musicTask.control = "RUN"
    end if
end sub

sub OnMusicResponse(event as Object)
    m.loadingOverlay.visible = false
    response = event.getData()

    rawTracks = []
    if response <> invalid and response.code = 200 and response.data <> invalid
        if type(response.data) = "roArray"
            rawTracks = response.data
        else if response.data.tracks <> invalid and type(response.data.tracks) = "roArray"
            rawTracks = response.data.tracks
        end if
    end if

    tracks = []
    for each t in rawTracks
        titleStr = t.title
        if titleStr = invalid or titleStr = "" then titleStr = "Untitled Track"
        
        artistStr = "Admin Audio Library"
        if t.artist <> invalid and t.artist <> ""
            artistStr = t.artist
        else if t.category <> invalid and t.category <> ""
            artistStr = t.category
        end if

        audioUrlStr = ""
        if t.audioUrl <> invalid and t.audioUrl <> ""
            audioUrlStr = t.audioUrl
        end if

        durStr = "03:45"
        if t.duration <> invalid and t.duration <> ""
            durStr = t.duration
        end if

        tracks.push({
            title: titleStr,
            artist: artistStr,
            duration: durStr,
            audioUrl: audioUrlStr,
            artworkUrl: "pkg:/images/icon_music.png"
        })
    end for

    ' If no tracks returned, load curated fallback
    if tracks.count() = 0
        tracks = [
            { title: "Peaceful Piano & Nature", artist: "FamilyCare Relax", duration: "04:20", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", artworkUrl: "pkg:/images/icon_music.png" },
            { title: "Morning Sunrise Symphony", artist: "Classical Haven", duration: "05:12", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", artworkUrl: "pkg:/images/icon_music.png" },
            { title: "Calming Ocean Waves", artist: "Ambient Meditation", duration: "08:45", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", artworkUrl: "pkg:/images/icon_music.png" }
        ]
    end if

    m.tracksData = tracks
    if m.emptyState <> invalid then m.emptyState.visible = false
    m.playlistGrid.visible = true

    content = CreateObject("roSGNode", "ContentNode")
    for each track in tracks
        item = CreateObject("roSGNode", "ContentNode")
        item.title = track.title
        item.shortDescriptionLine1 = track.artist + " • " + track.duration
        item.HDPosterUrl = track.artworkUrl
        content.appendChild(item)
    end for

    m.playlistGrid.content = content
    SelectTrack(0)
    SetFocusZone(3)
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

        m.timeTotal.text = track.duration
        m.timeElapsed.text = "00:00"
        m.progressBar.width = 0
        m.elapsedSeconds = 0
        m.totalDurationSec = 225

        ' Parse audio URL
        urlToPlay = track.audioUrl
        if urlToPlay = invalid or urlToPlay = ""
            urlToPlay = "https://qmwwvvgntkluaxbcyokv.supabase.co/storage/v1/object/public/audio/1783173807462-302335718.mp3"
        end if

        ' Fallback to direct mp3 for non-streamable webpage URLs
        if InStr(1, urlToPlay, "youtube.com") > 0 or InStr(1, urlToPlay, "ceenaija.com") > 0
            urlToPlay = "https://qmwwvvgntkluaxbcyokv.supabase.co/storage/v1/object/public/audio/1783173807462-302335718.mp3"
        end if

        if m.audioPlayer <> invalid
            song = CreateObject("roSGNode", "ContentNode")
            song.url = urlToPlay
            m.audioPlayer.content = song
            m.audioPlayer.control = "play"
            m.isPlaying = true
            m.playLabel.text = "❚❚ Pause"
            if m.progressTimer <> invalid then m.progressTimer.control = "start"
        end if
    end if
end sub

sub OnProgressTick()
    if m.isPlaying
        m.elapsedSeconds = m.elapsedSeconds + 1
        posMin = Int(m.elapsedSeconds / 60)
        posSec = Int(m.elapsedSeconds MOD 60)
        posSecStr = StrI(posSec).Trim()
        if posSec < 10 then posSecStr = "0" + posSecStr
        m.timeElapsed.text = StrI(posMin).Trim() + ":" + posSecStr
        
        totalSec = 225
        if m.totalDurationSec > 0 then totalSec = m.totalDurationSec
        pct = m.elapsedSeconds / totalSec
        if pct > 1.0 then pct = 1.0
        m.progressBar.width = Int(pct * 520)
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
                if m.progressTimer <> invalid then m.progressTimer.control = "stop"
            end if
        else if state = "playing"
            m.isPlaying = true
            m.playLabel.text = "❚❚ Pause"
            if m.progressTimer <> invalid then m.progressTimer.control = "start"
        else if state = "paused" or state = "stopped"
            m.isPlaying = false
            m.playLabel.text = "► Play"
            if m.progressTimer <> invalid then m.progressTimer.control = "stop"
        end if
    end if
end sub

sub TogglePlayPause()
    if m.audioPlayer <> invalid and m.audioPlayer.content <> invalid
        if m.isPlaying
            m.audioPlayer.control = "pause"
            m.isPlaying = false
            m.playLabel.text = "► Play"
            if m.progressTimer <> invalid then m.progressTimer.control = "stop"
        else
            m.audioPlayer.control = "resume"
            m.isPlaying = true
            m.playLabel.text = "❚❚ Pause"
            if m.progressTimer <> invalid then m.progressTimer.control = "start"
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
                if m.progressTimer <> invalid then m.progressTimer.control = "stop"
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
                if m.progressTimer <> invalid then m.progressTimer.control = "stop"
                m.top.navigate = "HomeScene"
                handled = true
            end if
        end if
    end if
    return handled
end function
