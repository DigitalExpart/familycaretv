sub init()
    m.top.functionName = "executeRequest"
end sub

sub executeRequest()
    req = m.top.request
    if req = invalid return

    url = GetApiBaseUrl() + req.endpoint
    print "[CONFIG] API base URL = " + GetApiBaseUrl()
    print "[API] endpoint = " + req.endpoint

    http = CreateObject("roUrlTransfer")
    http.SetUrl(url)
    http.SetCertificatesFile("common:/certs/ca-bundle.crt")
    http.InitClientCertificates()
    http.RetainBodyOnError(true)
    http.SetMessagePort(CreateObject("roMessagePort"))

    http.EnableEncodings(true)
    http.AddHeader("Content-Type", "application/json")
    http.AddHeader("Accept", "application/json")

    token = ""
    if req.DoesExist("token") and req.token <> invalid and req.token <> ""
        token = req.token
    else
        token = getToken()
    end if

    hasToken = (token <> "" and token <> invalid)
    print "[AUTH] Token present = "; hasToken

    if hasToken
        http.AddHeader("Authorization", "Bearer " + token)
        print "[API] Authorization header attached = true"
    else
        print "[API] Authorization header attached = false"
    end if

    result = {}
    responseStr = ""

    timer = CreateObject("roTimespan")
    timer.Mark()

    method = "GET"
    if req.method <> invalid and req.method <> ""
        method = UCase(req.method)
    end if

    print "[API] " + method + " " + url

    if method = "POST" or method = "PUT" or method = "PATCH" or method = "DELETE"
        http.SetRequest(method)
        if req.body <> invalid
            bodyString = FormatJson(req.body)
            http.AsyncPostFromString(bodyString)
        else
            http.AsyncPostFromString("")
        end if
    else
        http.SetRequest("GET")
        http.AsyncGetToString()
    end if

    ' Wait up to 30 seconds for a response
    event = wait(30000, http.GetMessagePort())
    elapsedMs = timer.TotalMilliseconds()
    
    contentType = "application/json"
    if type(event) = "roUrlEvent"
        responseCode = event.GetResponseCode()
        responseStr = event.GetString()
        headers = event.GetResponseHeaders()
        if headers <> invalid and headers["content-type"] <> invalid
            contentType = headers["content-type"]
        end if
    else if event = invalid
        ' Timeout occurred
        http.AsyncCancel()
        responseCode = -2 ' Custom code for timeout
        responseStr = ""
    else
        responseCode = -1
        responseStr = ""
    end if

    if responseCode = invalid
        responseCode = -1
    end if

    print "[API] HTTP status = "; responseCode

    result.code = responseCode
    result.success = (responseCode >= 200 and responseCode < 300)
    result.rawResponse = responseStr
    result.responseTimeMs = elapsedMs
    result.contentType = contentType

    if responseCode < 0
        result.data = invalid
        if responseCode = -2
            result.error = "Connection timed out. Please try again."
        else
            result.error = "Network error. (Code: " + responseCode.toStr() + ")"
        end if
    else if responseStr <> ""
        parsed = ParseJson(responseStr)
        if parsed <> invalid and type(parsed) = "roAssociativeArray"
            print "[API] JSON parsed = true"
            if parsed.DoesExist("stats") and parsed.stats <> invalid
                print "[API] has stats = true"
            else
                print "[API] has stats = false"
            end if

            if parsed.DoesExist("upcomingAppointment") and parsed.upcomingAppointment <> invalid
                print "[API] has upcomingAppointment = true"
            else
                print "[API] has upcomingAppointment = false"
            end if

            if parsed.DoesExist("verseOfTheDay") and parsed.verseOfTheDay <> invalid
                print "[API] has verseOfTheDay = true"
            else
                print "[API] has verseOfTheDay = false"
            end if

            if parsed.DoesExist("data") and parsed.data <> invalid
                result.data = parsed.data
            else
                result.data = parsed
            end if
        else
            print "[API] JSON parsed = false"
            result.data = parsed
        end if
    else
        result.data = invalid
    end if

    m.top.response = result
end sub

