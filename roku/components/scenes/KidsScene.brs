sub init()
    m.navBar = m.top.findNode("navBar")
    m.navBar.title = tr("Nav_Kids")
    
    m.loadingLabel = m.top.findNode("loadingLabel")
    m.drawingsGrid = m.top.findNode("drawingsGrid")
    m.errorDialog = m.top.findNode("errorDialog")
    
    m.imageViewer = m.top.findNode("imageViewer")
    m.fullScreenPoster = m.top.findNode("fullScreenPoster")
    
    m.drawingsTask = m.top.findNode("drawingsTask")
    m.drawingsTask.observeField("response", "OnDrawingsResponse")
    
    m.drawingsTask.request = {
        endpoint: "/drawings",
        method: "GET"
    }
    m.drawingsTask.control = "RUN"
    
    m.drawingsGrid.observeField("itemSelected", "OnDrawingSelected")
end sub

sub OnDrawingsResponse(event as Object)
    response = event.getData()
    m.loadingLabel.visible = false
    
    if response <> invalid and response.code = 200 and response.data <> invalid
        m.drawingsData = response.data
        content = CreateObject("roSGNode", "ContentNode")
        
        for each drawing in response.data
            item = CreateObject("roSGNode", "ContentNode")
            item.title = drawing.title
            item.HDPosterUrl = drawing.imageUrl
            content.appendChild(item)
        end for
        
        if response.data.count() = 0
            m.loadingLabel.text = tr("Kids_Empty")
            m.loadingLabel.visible = true
            m.top.setFocus(true)
        else
            m.drawingsGrid.content = content
            m.drawingsGrid.visible = true
            m.drawingsGrid.setFocus(true)
        end if
    else
        m.errorDialog.message = tr("Error_Network")
        m.errorDialog.show = true
        m.top.setFocus(true)
    end if
end sub

sub OnDrawingSelected()
    selectedIndex = m.drawingsGrid.itemSelected
    drawing = m.drawingsData[selectedIndex]
    
    m.fullScreenPoster.uri = drawing.imageUrl
    m.imageViewer.visible = true
end sub

function onKeyEvent(key as String, press as Boolean) as Boolean
    handled = false
    if press
        if key = "back"
            if m.imageViewer.visible
                m.imageViewer.visible = false
                m.drawingsGrid.setFocus(true)
                handled = true
            end if
        end if
    end if
    return handled
end function
