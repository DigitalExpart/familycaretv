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
    
    ' Add Headers
    http.AddHeader("Content-Type", "application/json")
    http.AddHeader("Accept", "application/json")
    
    token = getToken()
    if token <> ""
        http.AddHeader("Authorization", "Bearer " + token)
    end if
    
    result = {}
    
    if req.method = "POST"
        http.SetRequest("POST")
        if req.body <> invalid
            bodyString = FormatJson(req.body)
            responseStr = http.PostFromString(bodyString)
        else
            responseStr = http.PostFromString("")
        end if
    else
        responseStr = http.GetToString()
    end if
    
    responseCode = http.GetResponseCode()
    
    result.code = responseCode
    if responseStr <> ""
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
