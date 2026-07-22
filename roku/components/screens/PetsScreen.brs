sub init()
    m.dataList = m.top.findNode("dataList")
    m.fetchTask = m.top.findNode("fetchTask")
    m.fetchTask.observeField("response", "onDataReceived")
    m.top.observeField("visible", "onVisibleChange")
end sub

sub onVisibleChange()
    if m.top.visible = true
        m.fetchTask.request = { endpoint: "/roku/pets", method: "GET" }
        m.fetchTask.control = "RUN"
    end if
end sub

sub onDataReceived()
    res = m.fetchTask.response
    if res <> invalid and res.statusCode = 200 and res.data <> invalid
        data = res.data
        content = CreateObject("roSGNode", "ContentNode")
        row1 = createRow("Medications", data[0].medications) : row2 = createRow("Vaccinations", data[0].vaccinations) : row3 = createRow("Notes", data[0].notes)
        if row1 <> invalid then content.appendChild(row1)
        if row2 <> invalid then content.appendChild(row2)
        if row3 <> invalid then content.appendChild(row3)
        m.dataList.content = content
    end if
end sub

function createRow(title as String, items as Object) as Object
    if items = invalid or items.count() = 0 then return invalid
    row = CreateObject("roSGNode", "ContentNode")
    row.title = title
    for each item in items
        itemNode = CreateObject("roSGNode", "ContentNode")
        itemNode.title = item.title
        if itemNode.title = invalid then itemNode.title = item.name
        if itemNode.title = invalid then itemNode.title = "Item"
        itemNode.description = "Details"
        if item.imageUrl <> invalid
            itemNode.HDPosterUrl = item.imageUrl
        else if item.audioUrl <> invalid
            itemNode.HDPosterUrl = "pkg:/images/audio_icon.jpg"
        else
            itemNode.HDPosterUrl = "pkg:/images/fallback_artwork.png"
        end if
        row.appendChild(itemNode)
    end for
    return row
end function
