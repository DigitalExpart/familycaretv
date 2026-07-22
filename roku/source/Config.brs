function GetEnvironment() as String
    return "production"
end function

function GetApiBaseUrl() as String
    env = GetEnvironment()

    if env = "production"
        return "https://carefree-endurance-production-7621.up.railway.app"
    else
        return "https://carefree-endurance-production-7621.up.railway.app"
    end if
end function

function GetRequestTimeout() as Integer
    return 30000 ' 30 seconds
end function
