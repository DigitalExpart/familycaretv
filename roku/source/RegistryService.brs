function GetRegistry() as Object
    return CreateObject("roRegistrySection", "FamilyCareTV")
end function

function saveToken(token as Dynamic) as Boolean
    reg = GetRegistry()
    if token <> invalid
        tokenStr = token.toStr().Trim()
        if tokenStr <> ""
            reg.Write("auth_token", tokenStr)
            reg.Flush()
            return true
        end if
    end if
    return false
end function

function getToken() as String
    reg = GetRegistry()
    if reg.Exists("auth_token")
        val = reg.Read("auth_token")
        if val <> invalid then return val.Trim()
    end if
    return ""
end function

function clearToken()
    reg = GetRegistry()
    reg.Delete("auth_token")
    reg.Flush()
end function

function saveRefreshToken(token as Dynamic) as Boolean
    reg = GetRegistry()
    if token <> invalid
        tokenStr = token.toStr().Trim()
        if tokenStr <> ""
            reg.Write("refresh_token", tokenStr)
            reg.Flush()
            return true
        end if
    end if
    return false
end function

function getRefreshToken() as String
    reg = GetRegistry()
    if reg.Exists("refresh_token")
        val = reg.Read("refresh_token")
        if val <> invalid then return val.Trim()
    end if
    return ""
end function

function clearAllTokens()
    reg = GetRegistry()
    reg.Delete("auth_token")
    reg.Delete("refresh_token")
    reg.Flush()
end function

function savePendingCode(code as Dynamic) as Boolean
    reg = GetRegistry()
    if code <> invalid
        codeStr = code.toStr().Trim()
        if codeStr <> ""
            reg.Write("pending_device_code", codeStr)
            reg.Flush()
            return true
        end if
    end if
    return false
end function

function getPendingCode() as String
    reg = GetRegistry()
    if reg.Exists("pending_device_code")
        val = reg.Read("pending_device_code")
        if val <> invalid then return val.Trim()
    end if
    return ""
end function

function clearPendingCode()
    reg = GetRegistry()
    reg.Delete("pending_device_code")
    reg.Flush()
end function

