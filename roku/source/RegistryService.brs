function GetRegistry() as Object
    return CreateObject("roRegistrySection", "FamilyCareTV")
end function

function saveToken(token as String)
    reg = GetRegistry()
    reg.Write("auth_token", token)
    reg.Flush()
end function

function getToken() as String
    reg = GetRegistry()
    if reg.Exists("auth_token")
        return reg.Read("auth_token")
    end if
    return ""
end function

function clearToken()
    reg = GetRegistry()
    reg.Delete("auth_token")
    reg.Flush()
end function

function saveRefreshToken(token as String)
    reg = GetRegistry()
    reg.Write("refresh_token", token)
    reg.Flush()
end function

function getRefreshToken() as String
    reg = GetRegistry()
    if reg.Exists("refresh_token")
        return reg.Read("refresh_token")
    end if
    return ""
end function

function clearAllTokens()
    reg = GetRegistry()
    reg.Delete("auth_token")
    reg.Delete("refresh_token")
    reg.Flush()
end function
