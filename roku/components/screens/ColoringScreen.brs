sub init()
    m.dataList = m.top.findNode("dataList")
    m.fetchTask = m.top.findNode("fetchTask")
    m.fetchTask.observeField("response", "onDataReceived")
    m.top.observeField("visible", "onVisibleChange")
end sub

sub onVisibleChange()
    if m.top.visible = true
        m.fetchTask.request = { endpoint: "/drawings", method: "GET" }
        m.fetchTask.control = "RUN"
    end if
end sub

sub onDataReceived()
    res = m.fetchTask.response
    if res <> invalid and res.statusCode = 200 and res.data <> invalid
        data = res.data
        content = CreateObject("roSGNode", "ContentNode")
        row1 = createRow("Gallery", data)
        if row1 <> invalid then content.appendChild(row1)
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
            itemNode.HDPosterUrl = "pkg:/images/placeholder.jpg"
        end if
        row.appendChild(itemNode)
    end for
    return row
end function
