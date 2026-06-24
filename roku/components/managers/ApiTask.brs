sub init()
    m.top.functionName = "executeRequest"
end sub

sub executeRequest()
    reqInfo = m.top.request
    urlTransfer = CreateObject("roUrlTransfer")
    urlTransfer.SetCertificatesFile("common:/certs/ca-bundle.crt")
    urlTransfer.InitClientCertificates()
    
    ' Construct URL
    baseUrl = GetApiBaseUrl() ' Defined in Config.brs or Utils
    url = baseUrl + reqInfo.endpoint
    
    if reqInfo.method = "GET" and reqInfo.queryParams <> invalid
        queryStr = "?"
        for each key in reqInfo.queryParams
            queryStr += key + "=" + urlTransfer.Escape(reqInfo.queryParams[key]) + "&"
        end for
        url += Left(queryStr, Len(queryStr) - 1)
    end if
    
    urlTransfer.SetUrl(url)
    
    ' Set Headers
    urlTransfer.AddHeader("Content-Type", "application/json")
    urlTransfer.AddHeader("Accept", "application/json")
    
    token = GetRegistryToken()
    if token <> ""
        urlTransfer.AddHeader("Authorization", "Bearer " + token)
    end if

    if reqInfo.method = "POST"
        urlTransfer.SetRequest("POST")
        body = ""
        if reqInfo.body <> invalid
            body = FormatJson(reqInfo.body)
        end if
        responseStr = urlTransfer.AsyncPostFromString(body)
    else
        urlTransfer.SetRequest("GET")
        responseStr = urlTransfer.AsyncGetToString()
    end if
    
    port = CreateObject("roMessagePort")
    urlTransfer.SetMessagePort(port)
    
    msg = wait(10000, port)
    if type(msg) = "roUrlEvent"
        code = msg.GetResponseCode()
        bodyStr = msg.GetString()
        
        res = {
            statusCode: code,
            data: invalid,
            error: ""
        }
        
        if code >= 200 and code < 300
            res.data = ParseJson(bodyStr)
        else
            res.error = "HTTP Error " + code.toStr()
        end if
        
        m.top.response = res
    else
        m.top.response = {
            statusCode: 500,
            data: invalid,
            error: "Timeout or Network Error"
        }
    end if
end sub

function GetApiBaseUrl() as String
    return "https://api.familycaretv.com" ' For testing/dev use local IP
end function

function GetRegistryToken() as String
    sec = CreateObject("roRegistrySection", "Authentication")
    if sec.Exists("AccessToken")
        return sec.Read("AccessToken")
    end if
    return ""
end function
