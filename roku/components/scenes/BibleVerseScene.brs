sub init()
    m.verseText = m.top.findNode("verseText")
    m.verseRef = m.top.findNode("verseRef")
    m.reflectionText = m.top.findNode("reflectionText")
    m.langToggleText = m.top.findNode("langToggleText")
    m.langFocusBorder = m.top.findNode("langFocusBorder")
    m.loadingOverlay = m.top.findNode("loadingOverlay")

    m.verseTask = m.top.findNode("verseTask")
    m.verseTask.observeField("response", "OnVerseResponse")

    m.currentLang = "EN"
    m.top.setFocus(true)

    FetchVerse()
end sub

sub FetchVerse()
    m.loadingOverlay.visible = true
    m.verseTask.request = {
        endpoint: "/roku/dashboard",
        method: "GET"
    }
    m.verseTask.control = "RUN"
end sub

sub OnVerseResponse(event as Object)
    m.loadingOverlay.visible = false
    response = event.getData()

    if response <> invalid and response.code = 200 and response.data <> invalid
        data = response.data
        if data.verse <> invalid
            m.verseText.text = Chr(34) + data.verse.text + Chr(34)
            m.verseRef.text = "- " + data.verse.reference
        else if data.verseOfTheDay <> invalid and data.verseOfTheDay.verse <> invalid
            m.verseText.text = Chr(34) + data.verseOfTheDay.verse + Chr(34)
            m.verseRef.text = "- " + data.verseOfTheDay.reference
        end if

        if data.verseReflection <> invalid and data.verseReflection <> ""
            m.reflectionText.text = data.verseReflection
        end if
    end if
end sub

sub ToggleLanguage()
    if m.currentLang = "EN"
        m.currentLang = "ES"
        m.langToggleText.text = "Español (ES)"
        ' Spanish fallback
        m.verseText.text = Chr(34) + "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna." + Chr(34)
        m.verseRef.text = "- Juan 3:16"
        m.reflectionText.text = "Que este versículo traiga paz, consuelo y fortaleza a su familia hoy. Tómese un momento para reflexionar sobre el amor, la gracia y la esperanza."
    else
        m.currentLang = "EN"
        m.langToggleText.text = "English (EN)"
        m.verseText.text = Chr(34) + "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life." + Chr(34)
        m.verseRef.text = "- John 3:16"
        m.reflectionText.text = "May this verse bring peace, comfort, and strength to your family today. Take a moment to reflect on love, grace, and hope."
    end if
end sub

function onKeyEvent(key as String, press as Boolean) as Boolean
    handled = false
    if press
        if key = "OK"
            ToggleLanguage()
            handled = true
        else if key = "back"
            m.top.navigate = "HomeScene"
            handled = true
        end if
    end if
    return handled
end function
