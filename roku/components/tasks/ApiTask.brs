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
        result.data = ParseJson(responseStr)
    else
        result.data = invalid
    end if
    
    m.top.response = result
end sub
