sub init()
    m.top.functionName = "pollLoop"
end sub

sub pollLoop()
    port = CreateObject("roMessagePort")
    m.top.observeField("control", port)
    
    timer = CreateObject("roTimespan")
    timer.Mark()
    
    lastSync = CreateObject("roDateTime")
    lastSync.ToLocalTime()
    
    while true
        ' Sleep for 30 seconds
        msg = wait(30000, port)
        
        if type(msg) = "roSGNodeEvent"
            if msg.getField() = "control" and m.top.control = "STOP"
                return
            end if
        end if
        
        ' Only poll if we have a token
        token = GetRegistryToken()
        if token <> ""
            sinceIso = lastSync.AsDateString("NoDayOfWeek") + "T" + lastSync.AsTimeString() + "Z" ' Approximation, standard ISO 8601 required
            
            ' Perform GET /roku/updates
            reqInfo = {
                endpoint: "/roku/updates",
                method: "GET",
                queryParams: { since: sinceIso }
            }
            
            res = ExecuteApiRequest(reqInfo, token)
            
            if res <> invalid and res.statusCode = 200 and res.data <> invalid
                if res.data.notifications <> invalid and res.data.notifications.count() > 0
                    m.top.newNotifications = res.data.notifications
                end if
                
                if res.data.updatedTasks <> invalid and res.data.updatedTasks.count() > 0
                    m.top.updatedTasks = res.data.updatedTasks
                end if
                
                ' Update lastSync after successful pull
                lastSync.Mark()
            end if
        end if
    end while
end sub

function ExecuteApiRequest(reqInfo as Object, token as String) as Object
    urlTransfer = CreateObject("roUrlTransfer")
    urlTransfer.SetCertificatesFile("common:/certs/ca-bundle.crt")
    urlTransfer.InitClientCertificates()
    
    baseUrl = "https://api.familycaretv.com"
    url = baseUrl + reqInfo.endpoint
    
    if reqInfo.queryParams <> invalid
        queryStr = "?"
        for each key in reqInfo.queryParams
            queryStr += key + "=" + urlTransfer.Escape(reqInfo.queryParams[key]) + "&"
        end for
        url += Left(queryStr, Len(queryStr) - 1)
    end if
    
    urlTransfer.SetUrl(url)
    urlTransfer.AddHeader("Content-Type", "application/json")
    urlTransfer.AddHeader("Accept", "application/json")
    urlTransfer.AddHeader("Authorization", "Bearer " + token)
    
    urlTransfer.SetRequest("GET")
    responseStr = urlTransfer.GetToString()
    code = urlTransfer.GetResponseCode()
    
    if code >= 200 and code < 300
        return { statusCode: code, data: ParseJson(responseStr) }
    else
        return { statusCode: code, data: invalid }
    end if
end function

function GetRegistryToken() as String
    sec = CreateObject("roRegistrySection", "Authentication")
    if sec.Exists("AccessToken")
        return sec.Read("AccessToken")
    end if
    return ""
end function
