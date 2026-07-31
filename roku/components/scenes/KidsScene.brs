sub init()
    m.backBtn = m.top.findNode("backBtn")
    m.backFocusBorder = m.top.findNode("backFocusBorder")
    m.kidsGrid = m.top.findNode("kidsGrid")
    m.previewOverlay = m.top.findNode("previewOverlay")
    m.previewImage = m.top.findNode("previewImage")
    m.previewTitle = m.top.findNode("previewTitle")
    m.previewDesc = m.top.findNode("previewDesc")
    m.loadingOverlay = m.top.findNode("loadingOverlay")

    m.kidsTask = m.top.findNode("kidsTask")
    m.kidsTask.observeField("response", "OnKidsResponse")

    m.kidsGrid.observeField("itemSelected", "OnActivitySelected")

    FetchKidsActivities()
end sub

sub FetchKidsActivities()
    m.loadingOverlay.visible = true
    m.kidsTask.request = {
        endpoint: "/roku/kids",
        method: "GET"
    }
    m.kidsTask.control = "RUN"
end sub

sub OnKidsResponse(event as Object)
    m.loadingOverlay.visible = false
    response = event.getData()

    activities = [
        { title: "Animal Kingdom Coloring", desc: "Fun animal coloring pages for kids & grandkids.", image: "pkg:/images/icon_kids.png" },
        { title: "Family Tree Drawing", desc: "Draw and map out your family roots together.", image: "pkg:/images/icon_kids.png" },
        { title: "Bible Story Coloring", desc: "Classic Bible stories with illustrated outlines.", image: "pkg:/images/icon_kids.png" },
        { title: "Grandparents Memory Book", desc: "Prompted pages to share favorite family memories.", image: "pkg:/images/icon_kids.png" },
        { title: "Under The Sea Adventure", desc: "Ocean life coloring sheet featuring dolphins & turtles.", image: "pkg:/images/icon_kids.png" },
        { title: "Sunshine & Garden Flowers", desc: "Spring garden flower shapes for easy coloring.", image: "pkg:/images/icon_kids.png" }
    ]

    m.rawKidsData = activities
    content = CreateObject("roSGNode", "ContentNode")

    for each act in activities
        item = CreateObject("roSGNode", "ContentNode")
        item.title = act.title
        item.shortDescriptionLine1 = act.desc
        item.HDPosterUrl = act.image
        content.appendChild(item)
    end for

    m.kidsGrid.content = content
    m.kidsGrid.setFocus(true)
end sub

sub OnActivitySelected()
    selectedIndex = m.kidsGrid.itemSelected
    if selectedIndex >= 0 and selectedIndex < m.rawKidsData.count()
        selectedAct = m.rawKidsData[selectedIndex]
        m.previewTitle.text = selectedAct.title
        m.previewDesc.text = selectedAct.desc
        m.previewImage.uri = selectedAct.image
        m.previewOverlay.visible = true
    end if
end sub

function onKeyEvent(key as String, press as Boolean) as Boolean
    handled = false
    if press
        if m.previewOverlay.visible
            if key = "back" or key = "OK"
                m.previewOverlay.visible = false
                m.kidsGrid.setFocus(true)
                handled = true
            end if
        else
            if key = "up" and m.kidsGrid.hasFocus()
                m.backBtn.setFocus(true)
                m.backFocusBorder.visible = true
                handled = true
            else if key = "down" and m.backBtn.hasFocus()
                m.backFocusBorder.visible = false
                m.kidsGrid.setFocus(true)
                handled = true
            else if key = "OK" and m.backBtn.hasFocus()
                m.top.navigate = "HomeScene"
                handled = true
            else if key = "back"
                m.top.navigate = "HomeScene"
                handled = true
            end if
        end if
    end if
    return handled
end function
