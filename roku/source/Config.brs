function GetEnvironment() as String
    return "development"
end function

function GetApiBaseUrl() as String
    env = GetEnvironment()

    if env = "production"
        return "https://api.familycaretv.com"
    else
        return "https://your-dev-api-url.com"
    end if
end function
