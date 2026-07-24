function createApiRequest(endpoint as String, method as String, body as Object) as Object
    return {
        endpoint: endpoint,
        method: method,
        body: body
    }
end function

function GetBaseUrl() as String
    return GetApiBaseUrl()
end function
