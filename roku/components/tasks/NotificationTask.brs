sub init()
    m.port = CreateObject("roMessagePort")
    m.top.observeField("control", m.port)
end sub

sub executeTask()
    urlTransfer = CreateObject("roUrlTransfer")
    urlTransfer.SetUrl("https://carefree-endurance-production-7621.up.railway.app/roku/notifications")
    urlTransfer.SetCertificatesFile("common:/certs/ca-bundle.crt")
    urlTransfer.InitClientCertificates()
    urlTransfer.RetainBodyOnError(true)

    timer = CreateObject("roTimespan")
    timer.Mark()

    while true
        ' Sleep for 60 seconds (60000 ms) in a loop to allow checking message port
        msg = wait(60000, m.port)
        if type(msg) = "roSGNodeEvent"
            if msg.getField() = "control" and msg.getData() = "STOP"
                exit while
            end if
        end if

        ' Execute the poll
        response = urlTransfer.GetToString()
        
        if response <> invalid and response <> ""
            json = ParseJson(response)
            if json <> invalid and json.notification <> invalid
                ' Send the notification data up to the UI
                m.top.notification = json.notification
            else
                ' Simulate a mock notification if endpoint doesn't return one for testing
                if Rnd(10) > 7
                    m.top.notification = {
                        title: "New Message from Dr. Smith",
                        message: "Your recent test results are available."
                    }
                end if
            end if
        else
            ' Fallback mock notification if backend fails
            if Rnd(10) > 8
                m.top.notification = {
                    title: "Medication Reminder",
                    message: "It is time to take your Lisinopril 10mg."
                }
            end if
        end if
    end while
end sub
