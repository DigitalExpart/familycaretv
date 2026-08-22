sub init()
    m.scaleContainer = m.top.findNode("scaleContainer")
    m.bgPoster = m.top.findNode("bgPoster")
    m.contentGroup = m.top.findNode("contentGroup")
    
    m.titleLabel = m.top.findNode("titleLabel")
    m.authorLabel = m.top.findNode("authorLabel")
    m.descLabel = m.top.findNode("descLabel")
    m.coverPoster = m.top.findNode("coverPoster")
    m.btnPoster = m.top.findNode("btnPoster")
    m.btnText = m.top.findNode("btnText")
    
    m.focusInAnim = m.top.findNode("focusInAnim")
    m.focusOutAnim = m.top.findNode("focusOutAnim")
    m.fadeOutAnim = m.top.findNode("fadeOutAnim")
    m.fadeInAnim = m.top.findNode("fadeInAnim")
    m.rotationTimer = m.top.findNode("rotationTimer")
    
    m.currentIndex = 0
    m.books = [
        {
            title: "Mindfulness & Memory",
            author: "Dr. Robert Vance",
            description: "Daily brain exercises, memory boosters, and restorative meditation.",
            coverUrl: "pkg:/images/book_cover_mindfulness.png",
            target: "BooksScreen"
        },
        {
            title: "Healthy Living After 50",
            author: "Dr. Sarah Jenkins",
            description: "Practical wellness & nutrition guidance tailored for active senior living.",
            coverUrl: "pkg:/images/fallback_artwork.png",
            target: "BooksScreen"
        },
        {
            title: "Senior Fitness Guide",
            author: "Maria Gonzalez, PT",
            description: "Low-impact exercises designed for joint mobility and balance.",
            coverUrl: "pkg:/images/fallback_artwork.png",
            target: "BooksScreen"
        },
        {
            title: "Heart Care Companion",
            author: "Dr. James Aris",
            description: "Essential guide to cardiovascular health and daily stress management.",
            coverUrl: "pkg:/images/fallback_artwork.png",
            target: "BooksScreen"
        }
    ]
    
    m.rotationTimer.observeField("fire", "OnRotationTimerFired")
    m.fadeOutAnim.observeField("state", "OnFadeOutStateChanged")
    
    DisplayCurrentBook()
    m.rotationTimer.control = "start"
end sub

sub DisplayCurrentBook()
    if m.books <> invalid and m.books.count() > 0
        book = m.books[m.currentIndex]
        m.titleLabel.text = book.title
        m.authorLabel.text = "By " + book.author
        m.descLabel.text = book.description
        if book.coverUrl <> invalid and book.coverUrl <> ""
            m.coverPoster.uri = book.coverUrl
        end if
        m.top.currentBook = book
    end if
end sub

sub OnRotationTimerFired()
    if m.fadeOutAnim <> invalid and m.fadeInAnim <> invalid
        if m.fadeOutAnim.state = "stopped" and m.fadeInAnim.state = "stopped"
            m.fadeOutAnim.control = "start"
        end if
    end if
end sub

sub OnFadeOutStateChanged()
    if m.fadeOutAnim.state = "stopped"
        m.currentIndex = (m.currentIndex + 1) MOD m.books.count()
        DisplayCurrentBook()
        m.fadeInAnim.control = "start"
    end if
end sub

sub OnFocusChange()
    if m.top.itemHasFocus
        m.focusInAnim.control = "start"
    else
        m.focusOutAnim.control = "start"
    end if
end sub

function onKeyEvent(key as String, press as Boolean) as Boolean
    handled = false
    if press
        if key = "OK" or key = "select"
            m.top.selected = true
            handled = true
        end if
    end if
    return handled
end function
