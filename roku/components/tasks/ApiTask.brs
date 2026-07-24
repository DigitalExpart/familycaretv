sub init()
    m.top.functionName = "executeRequest"
end sub

sub executeRequest()
    req = m.top.request

    url = GetApiBaseUrl() + req.endpoint

    http = CreateObject("roUrlTransfer")
    http.SetUrl(url)
    http.SetCertificatesFile("common:/certs/ca-bundle.crt")
    http.InitClientCertificates()
    http.RetainBodyOnError(true)
    http.SetMessagePort(CreateObject("roMessagePort"))

    ' Set 30-second timeout to avoid hanging forever
    http.EnableEncodings(true)
    http.AddHeader("Content-Type", "application/json")
    http.AddHeader("Accept", "application/json")

    token = getToken()
    if token <> "" and token <> invalid
        http.AddHeader("Authorization", "Bearer " + token)
    end if

    result = {}
    responseStr = ""

    timer = CreateObject("roTimespan")
    timer.Mark()

    if req.method = "POST"
        http.SetRequest("POST")
        if req.body <> invalid
            bodyString = FormatJson(req.body)
            http.AsyncPostFromString(bodyString)
        else
            http.AsyncPostFromString("")
        end if
    else
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

    ' Safely handle network failure (-1, -2, etc.)
    if responseCode = invalid
        responseCode = -1
    end if

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
            result.error = "Network error. Please check your internet connection. (Code: " + responseCode.toStr() + ")"
        end if
    else if responseStr <> ""
        parsed = ParseJson(responseStr)
        if parsed <> invalid and type(parsed) = "roAssociativeArray" and parsed.DoesExist("data")
            ' Handle wrapped { success: true, data: [...] } responses
            result.data = parsed.data
        else
            ' Handle raw array/object responses
            result.data = parsed
        end if
    else
        result.data = invalid
    end if

    m.top.response = result
end sub
