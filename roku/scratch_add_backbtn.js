const fs = require('fs');
const path = require('path');
const scenes = ['PatientsScene', 'MedicationsScene', 'NotesScene', 'PetsScene', 'DrawingScene', 'CalendarScene', 'BibleVerseScene', 'MusicScene'];
const dir = 'c:\\Users\\Shilley Pc\\FamilyCare TV Full Platform Build\\roku\\components\\scenes';

const backBtnXml = `            <Group id="backBtn" translation="[60, 20]">
                <Rectangle id="backFocusBorder" width="224" height="54" color="0x607D8BFF" translation="[-2, -2]" visible="false" />
                <Rectangle id="backBg" width="220" height="50" color="0x444444FF" />
                <Label text="← Back" font="font:MediumBoldSystemFont" color="0xFFFFFFFF" horizAlign="center" width="220" translation="[0, 12]" />
            </Group>`;

scenes.forEach(scene => {
    let xmlFile = path.join(dir, scene + '.xml');
    let brsFile = path.join(dir, scene + '.brs');
    
    if (fs.existsSync(xmlFile)) {
        let xml = fs.readFileSync(xmlFile, 'utf8');
        if (!xml.includes('id="backBtn"')) {
            xml = xml.replace(/<Group id="headerGroup">\s*<Rectangle[^>]*>\s*<Rectangle[^>]*>/, `$&
${backBtnXml}`);
            xml = xml.replace(/<Label text="FamilyCare TV"[^>]*>/, '');
            fs.writeFileSync(xmlFile, xml);
            console.log('Added Back button to XML:', scene);
        }
    }
    
    if (fs.existsSync(brsFile)) {
        let brs = fs.readFileSync(brsFile, 'utf8');
        if (!brs.includes('m.backBtn =')) {
            brs = brs.replace(/sub init\(\)/, `sub init()
    m.backBtn = m.top.findNode("backBtn")
    m.backFocusBorder = m.top.findNode("backFocusBorder")`);
            
            // Add focus handling logic based on the main grid of the scene
            // Let's find what the main grid is named.
            let gridMatch = brs.match(/m\.(.+Grid|.+List) = m\.top\.findNode/);
            let gridName = gridMatch ? gridMatch[1] : null;
            if (!gridName) {
                // For BibleVerseScene, it might just be text
                // Let's just do a generic replacement for the onKeyEvent if possible
                console.log('Could not find grid for', scene);
            } else {
                if (brs.includes('function onKeyEvent')) {
                    // Try to inject focus logic for up/down
                    let lines = brs.split('\n');
                    let newLines = [];
                    let inKeyEvent = false;
                    for (let line of lines) {
                        if (line.includes('function onKeyEvent')) {
                            inKeyEvent = true;
                        }
                        if (inKeyEvent && line.includes('if key = "back"')) {
                            // Inject up/down handling before the back key
                            newLines.push(`            if key = "up" and m.${gridName} <> invalid and m.${gridName}.hasFocus()`);
                            newLines.push(`                if m.backBtn <> invalid`);
                            newLines.push(`                    m.backBtn.setFocus(true)`);
                            newLines.push(`                    m.backFocusBorder.visible = true`);
                            newLines.push(`                    handled = true`);
                            newLines.push(`                end if`);
                            newLines.push(`            else if key = "down" and m.backBtn <> invalid and m.backBtn.hasFocus()`);
                            newLines.push(`                m.backFocusBorder.visible = false`);
                            newLines.push(`                if m.${gridName} <> invalid then m.${gridName}.setFocus(true)`);
                            newLines.push(`                handled = true`);
                            newLines.push(`            else if key = "OK" and m.backBtn <> invalid and m.backBtn.hasFocus()`);
                            newLines.push(`                m.top.navigate = "HomeScene"`);
                            newLines.push(`                handled = true`);
                            newLines.push(`            else ` + line.trim());
                        } else {
                            newLines.push(line);
                        }
                    }
                    brs = newLines.join('\n');
                    fs.writeFileSync(brsFile, brs);
                    console.log('Updated BRS for', scene, 'using grid', gridName);
                }
            }
        }
    }
});
