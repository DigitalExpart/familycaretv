import glob

files = glob.glob('components/scenes/*FormScene.brs')
for f in files:
    with open(f, 'r') as file:
        content = file.read()
    
    content = content.replace('    m.keyboardDialog.buttons = ["OK", "Cancel"]\n', '')
    content = content.replace('observeField("buttonSelected", "OnKeyboardButtonSelected")', 'observeField("wasClosed", "OnKeyboardClosed")')
    content = content.replace('sub OnKeyboardButtonSelected(event as Object)', 'sub OnKeyboardClosed(event as Object)')
    content = content.replace('    buttonIdx = event.getData()\n', '')
    content = content.replace('if buttonIdx = 0 or buttonIdx = invalid', 'if true')
    content = content.replace("' 0 is typically OK / Done in KeyboardDialog\n    ", '')
    
    with open(f, 'w') as file:
        file.write(content)
