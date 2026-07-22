sub init()
    m.menuList = m.top.findNode("menuList")
    
    content = CreateObject("roSGNode", "ContentNode")
    
    items = [
        { title: "Home", screen: "HomeScreen" },
        { title: "Patients", screen: "PatientsScreen" },
        { title: "Calendar", screen: "CalendarScreen" },
        { title: "Music", screen: "MusicScreen" },
        { title: "Kids", screen: "KidsScreen" },
        { title: "Pets", screen: "PetsScreen" },
        { title: "Settings", screen: "SettingsScreen" }
    ]
    
    for each item in items
        itemNode = CreateObject("roSGNode", "ContentNode")
        itemNode.title = item.title
        itemNode.description = item.screen
        content.appendChild(itemNode)
    end for
    
    m.menuList.content = content
    m.menuList.observeField("itemSelected", "onItemSelected")
end sub

sub onItemSelected()
    selectedItem = m.menuList.content.getChild(m.menuList.itemSelected)
    if selectedItem <> invalid
        m.top.navigate = selectedItem.description
    end if
end sub

function onKeyEvent(key as String, press as Boolean) as Boolean
    handled = false
    if press then
        if key = "right"
            ' Give focus back to the parent screen's main content
            ' Workaround: set focus to the next element up the chain
            ' In Brightscript, we usually just return false and let the parent handle it, or explicitly pass focus
            m.top.getParent().getChild(2).setFocus(true) ' Assuming contentArea is child 2
            handled = true
        end if
    end if
    return handled
end function
