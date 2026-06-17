sub init()
    m.titleLabel = m.top.findNode("titleLabel")
    m.top.observeField("title", "OnTitleChange")
end sub

sub OnTitleChange()
    m.titleLabel.text = m.top.title
end sub
