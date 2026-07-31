sub init()
    m.drawingImage = m.top.findNode("drawingImage")
    m.thoughtText = m.top.findNode("thoughtText")
    m.qrPoster = m.top.findNode("qrPoster")
    m.loadingOverlay = m.top.findNode("loadingOverlay")

    m.drawingTask = m.top.findNode("drawingTask")
    m.drawingTask.observeField("response", "OnDrawingResponse")

    m.top.setFocus(true)
    FetchDrawing()
end sub

sub FetchDrawing()
    m.loadingOverlay.visible = true
    m.drawingTask.request = {
        endpoint: "/roku/dashboard",
        method: "GET"
    }
    m.drawingTask.control = "RUN"
end sub

sub OnDrawingResponse(event as Object)
    m.loadingOverlay.visible = false
    response = event.getData()

    if response <> invalid and response.code = 200 and response.data <> invalid
        data = response.data

        if data.drawingUrl <> invalid and data.drawingUrl <> ""
            m.drawingImage.uri = data.drawingUrl
        else if data.drawing <> invalid and data.drawing.imageUrl <> invalid
            m.drawingImage.uri = data.drawing.imageUrl
        end if

        if data.drawingThought <> invalid and data.drawingThought <> ""
            m.thoughtText.text = Chr(34) + data.drawingThought + Chr(34)
        else if data.drawing <> invalid and data.drawing.description <> invalid
            m.thoughtText.text = Chr(34) + data.drawing.description + Chr(34)
        end if

        if data.qrCodeUrl <> invalid and data.qrCodeUrl <> ""
            m.qrPoster.uri = data.qrCodeUrl
        end if
    end if
end sub

function onKeyEvent(key as String, press as Boolean) as Boolean
    handled = false
    if press
        if key = "back"
            m.top.navigate = "HomeScene"
            handled = true
        end if
    end if
    return handled
end function
