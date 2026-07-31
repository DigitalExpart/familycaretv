sub init()
    m.progressBar = m.top.findNode("progressFill")
    startProgressAnimation()
end sub

sub startProgressAnimation()
    m.anim = createObject("roSGNode", "Animation")
    m.anim.duration = 2.0
    m.anim.repeat = false
    m.anim.easeFunction = "linear"

    interp = createObject("roSGNode", "FloatFieldInterpolator")
    interp.key = [0.0, 1.0]
    interp.keyValue = [10.0, 380.0]
    interp.fieldToInterp = "progressFill.width"

    m.anim.appendChild(interp)
    m.top.appendChild(m.anim)
    m.anim.control = "start"
end sub

sub setProgress(percent as float)
    if m.progressBar <> invalid
        m.progressBar.width = int(380 * percent)
    end if
end sub
