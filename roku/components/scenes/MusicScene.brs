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
    m.loadingOverlay = m.top.findNode("loadingOverlay")

    m.musicTask = m.top.findNode("musicTask")
    m.musicTask.observeField("response", "OnMusicResponse")

    m.playlistGrid.observeField("itemSelected", "OnTrackSelected")

    ' 0 = Prev, 1 = Play/Pause, 2 = Next, 3 = Playlist Grid
    m.focusZone = 3
    m.isPlaying = true
    m.activeTrackIdx = 0

    FetchMusic()
end sub

sub FetchMusic()
    m.loadingOverlay.visible = true
    m.musicTask.request = {
        endpoint: "/roku/dashboard",
        method: "GET"
    }
    m.musicTask.control = "RUN"
end sub

sub OnMusicResponse(event as Object)
    m.loadingOverlay.visible = false
    response = event.getData()

    tracks = [
        { title: "Peaceful Piano & Nature", artist: "FamilyCare Relax", duration: "04:20", cover: "pkg:/images/icon_music.png" },
        { title: "Morning Sunrise Symphony", artist: "Classical Haven", duration: "05:12", cover: "pkg:/images/icon_music.png" },
        { title: "Calming Ocean Waves", artist: "Ambient Meditation", duration: "08:45", cover: "pkg:/images/icon_music.png" },
        { title: "Gentle Guitar Lullaby", artist: "Acoustic Healing", duration: "03:50", cover: "pkg:/images/icon_music.png" },
        { title: "Forest Birdsong & Stream", artist: "Nature Sounds", duration: "06:30", cover: "pkg:/images/icon_music.png" },
        { title: "Deep Sleep Rain Sounds", artist: "Relaxation Series", duration: "10:00", cover: "pkg:/images/icon_music.png" }
    ]

    m.tracksData = tracks
    content = CreateObject("roSGNode", "ContentNode")

    for each track in tracks
        item = CreateObject("roSGNode", "ContentNode")
        item.title = track.title
        item.shortDescriptionLine1 = track.artist + " • " + track.duration
        item.HDPosterUrl = track.cover
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
        m.trackArtist.text = track.artist
        m.timeTotal.text = track.duration
        m.timeElapsed.text = "00:00"
        m.progressBar.width = 0

        m.isPlaying = true
        m.playLabel.text = "❚❚ Pause"
    end if
end sub

sub TogglePlayPause()
    if m.isPlaying
        m.isPlaying = false
        m.playLabel.text = "► Play"
    else
        m.isPlaying = true
        m.playLabel.text = "❚❚ Pause"
    end if
end sub

sub SetFocusZone(zone as Integer)
    m.focusZone = zone
    m.prevFocusBorder.visible = (zone = 0)
    m.playFocusBorder.visible = (zone = 1)
    m.nextFocusBorder.visible = (zone = 2)

    if zone = 3
        m.playlistGrid.setFocus(true)
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
                m.top.navigate = "HomeScene"
                handled = true
            end if
        else
            ' Player controls focused
            if key = "right"
                if m.focusZone < 2
                    SetFocusZone(m.focusZone + 1)
                    handled = true
                else
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
                    if m.activeTrackIdx < m.tracksData.count() - 1
                        SelectTrack(m.activeTrackIdx + 1)
                    end if
                end if
                handled = true
            else if key = "back"
                m.top.navigate = "HomeScene"
                handled = true
            end if
        end if
    end if
    return handled
end function
