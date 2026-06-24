sub init()
    m.top.findNode("kenBurnsAnim").control = "start"
end sub
function setData(data as Object)
    if data.drawingUrl <> invalid
        m.top.findNode("bgArt").uri = data.drawingUrl
    end if
    if data.verse <> invalid
        m.top.findNode("verseText").text = chr(34) + data.verse.verse + chr(34)
    end if
end function
