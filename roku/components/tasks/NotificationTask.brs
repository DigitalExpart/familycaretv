sub init()
    m.port = CreateObject("roMessagePort")
    m.top.observeField("control", m.port)
end sub

sub executeTask()
    timer = CreateObject("roTimespan")
    timer.Mark()

    lastProcessedId = ""

    while true
        ' Poll every 60 seconds
        msg = wait(60000, m.port)
        if type(msg) = "roSGNodeEvent"
            if msg.getField() = "control" and msg.getData() = "STOP"
                exit while
            end if
        end if

        token = getToken()
        if token <> invalid and token <> ""
            urlTransfer = CreateObject("roUrlTransfer")
            urlTransfer.SetUrl(GetApiBaseUrl() + "/notifications")
            urlTransfer.SetCertificatesFile("common:/certs/ca-bundle.crt")
            urlTransfer.InitClientCertificates()
            urlTransfer.RetainBodyOnError(true)
            urlTransfer.AddHeader("Authorization", "Bearer " + token)
            urlTransfer.AddHeader("Accept", "application/json")

            response = urlTransfer.GetToString()
            if response <> invalid and response <> ""
                json = ParseJson(response)
                if json <> invalid and json.data <> invalid and type(json.data) = "roArray" and json.data.count() > 0
                    firstNotif = json.data[0]
                    if firstNotif <> invalid and firstNotif.isRead = false and firstNotif.id <> lastProcessedId
                        lastProcessedId = firstNotif.id
                        m.top.notification = {
                            id: firstNotif.id,
                            title: firstNotif.title,
                            message: firstNotif.message
                        }
                    end if
                end if
            end if
        end if
    end while
end sub
