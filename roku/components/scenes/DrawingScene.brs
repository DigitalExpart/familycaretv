sub init()
    m.drawingImage = m.top.findNode("drawingImage")
    m.thoughtText = m.top.findNode("thoughtText")
    m.qrPoster = m.top.findNode("qrPoster")
    m.loadingOverlay = m.top.findNode("loadingOverlay")
    m.pageTitle = m.top.findNode("pageTitle")
    m.scanBuyLabel = m.top.findNode("scanBuyLabel")
    m.thoughtTitle = m.top.findNode("thoughtTitle")
    m.footerLabel = m.top.findNode("footerLabel")

    m.drawingTask = m.top.findNode("drawingTask")
    m.drawingTask.observeField("response", "OnDrawingResponse")

    m.top.setFocus(true)
    ApplyLocalization()
    FetchDrawing()

    m.top.observeField("visible", "OnVisibleChange")
end sub

sub OnVisibleChange()
    if m.top.visible = true
        ApplyLocalization()
    end if
end sub

sub ApplyLocalization()
    if m.pageTitle <> invalid then m.pageTitle.text = GetStr("drawing_title")
    if m.scanBuyLabel <> invalid then m.scanBuyLabel.text = GetStr("drawing_scan_buy")
    if m.thoughtTitle <> invalid then m.thoughtTitle.text = GetStr("drawing_thought_title")
    if m.footerLabel <> invalid then m.footerLabel.text = GetStr("drawing_footer")
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
