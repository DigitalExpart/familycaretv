const fs = require('fs');
const path = require('path');
const scenes = ['PatientsScene', 'MedicationsScene', 'NotesScene', 'PetsScene', 'CalendarScene', 'KidsScene', 'MusicScene'];
const dir = 'c:\\Users\\Shilley Pc\\FamilyCare TV Full Platform Build\\roku\\components\\scenes';

scenes.forEach(scene => {
    let brsFile = path.join(dir, scene + '.brs');
    
    if (fs.existsSync(brsFile)) {
        let brs = fs.readFileSync(brsFile, 'utf8');
        let lines = brs.split('\n');
        
        let newLines = [];
        let inInit = false;
        let initInjected = false;
        
        let inKeyEvent = false;
        
        let gridName = null;
        let gridMatch = brs.match(/m\.(.+Grid) = m\.top\.findNode/);
        if (gridMatch) {
            gridName = gridMatch[1];
        }

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            
            if (line.includes('sub init()')) {
                inInit = true;
                newLines.push(line);
                continue;
            }
            
            if (inInit && !initInjected) {
                newLines.push('    m.backBtn = m.top.findNode("backBtn")');
                newLines.push('    m.backFocusBorder = m.top.findNode("backFocusBorder")');
                initInjected = true;
            }
            
            if (line.includes('function onKeyEvent')) {
                inKeyEvent = true;
            }
            
            if (line.includes('end function') && inKeyEvent) {
                inKeyEvent = false;
            }
            
            if (inKeyEvent && line.includes('if key = "back"') && !line.includes('else if key = "back"')) {
                // If there's an 'else if', don't do this here, wait. Oh, 'if key = "back"' vs 'else if key = "back"'.
                // To be safe, just replace the exact "back" condition.
                // Let's just find the `if key = "back"` block and replace it.
                // But `KidsScene.brs` has `if key = "back"` inside an `else` block.
                let indent = line.match(/^\s*/)[0];
                let isElseIf = line.trim().startsWith('else if');
                let prefix = isElseIf ? 'else if' : 'if';
                
                if (gridName) {
                    newLines.push(indent + `if key = "up" and m.${gridName} <> invalid and m.${gridName}.hasFocus()`);
                    newLines.push(indent + `    if m.backBtn <> invalid`);
                    newLines.push(indent + `        m.backBtn.setFocus(true)`);
                    newLines.push(indent + `        m.backFocusBorder.visible = true`);
                    newLines.push(indent + `        handled = true`);
                    newLines.push(indent + `    end if`);
                    newLines.push(indent + `else if key = "down" and m.backBtn <> invalid and m.backBtn.hasFocus()`);
                    newLines.push(indent + `    m.backFocusBorder.visible = false`);
                    newLines.push(indent + `    if m.${gridName} <> invalid then m.${gridName}.setFocus(true)`);
                    newLines.push(indent + `    handled = true`);
                    newLines.push(indent + `else if key = "OK" and m.backBtn <> invalid and m.backBtn.hasFocus()`);
                    newLines.push(indent + `    m.top.navigate = "HomeScene"`);
                    newLines.push(indent + `    handled = true`);
                    newLines.push(indent + `else ` + line.trim());
                } else {
                    newLines.push(line);
                }
            } else {
                newLines.push(line);
            }
        }
        
        fs.writeFileSync(brsFile, newLines.join('\n'));
        console.log('Fixed BRS for', scene);
    }
});
