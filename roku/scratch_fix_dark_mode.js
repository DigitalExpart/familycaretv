const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\Shilley Pc\\FamilyCare TV Full Platform Build\\roku\\components';

function fixFile(file) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Fix Colors
    // For backgrounds (Rectangle elements only)
    content = content.replace(/(<Rectangle[^>]*?)color="0xF2F4F7FF"([^>]*>)/g, '$1color="0x121212FF"$2');
    content = content.replace(/(<Rectangle[^>]*?)color="0xFFFFFFFF"([^>]*>)/g, '$1color="0x1E1E1EFF"$2');
    content = content.replace(/(<Rectangle[^>]*?)color="0xF5F7FAFF"([^>]*>)/g, '$1color="0x2A2A2AFF"$2');
    content = content.replace(/(<Rectangle[^>]*?)color="0xE0E3E8FF"([^>]*>)/g, '$1color="0x444444FF"$2');

    // For texts (Label elements mostly, or anything having these colors)
    content = content.replace(/0x1A1A2EFF/g, '0xFFFFFFFF'); // dark text -> light text
    content = content.replace(/0x4A4A68FF/g, '0xAAAAAAFF'); // sub text -> light gray
    
    // Move Back/Cancel Button
    const backBtnRegex = /([\s\S]*?)(\s*<!--\s*(?:Back|Cancel)\s*Button\s*-->\s*<Group id="(?:backBtn|cancelBtnGroup)"[^>]*>[\s\S]*?<\/Group>\s*)([\s\S]*)/;
    let match = content.match(backBtnRegex);
    if (match) {
        let before = match[1];
        let btnCode = match[2];
        let after = match[3];

        // Modify btnCode translation to be top left
        btnCode = btnCode.replace(/translation="\[\d+,\s*\d+\]"/, 'translation="[60, 20]"');

        // Insert into header
        const headerRegex = /(<Label text="FamilyCare TV"[^>]*>)/;
        if (before.match(headerRegex) || after.match(headerRegex)) {
            let target = before.match(headerRegex) ? before : after;
            let other = before.match(headerRegex) ? after : before;
            
            target = target.replace(headerRegex, '$1' + btnCode);
            // Move FamilyCare TV and Title
            target = target.replace(/(<Label text="FamilyCare TV".*?translation=")\[60,\s*20\]"/, '$1[320, 20]"');
            target = target.replace(/(<Label.*?id="formTitle".*?translation=")\[340,\s*30\]"/, '$1[600, 30]"');
            // Check other titles without ID
            target = target.replace(/(<Label text="Patient Detail".*?translation=")\[340,\s*30\]"/, '$1[600, 30]"');
            
            if (before.match(headerRegex)) {
                content = target + other;
            } else {
                content = other + target;
            }
        } else {
            // Just place it after the first Rectangle (background)
            content = before.replace(/(<Rectangle[^>]*>)/, '$1\n' + btnCode) + after;
        }
    }

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Modified: ' + file);
    }
}

function walk(d) {
    const list = fs.readdirSync(d);
    list.forEach(function(file) {
        file = path.join(d, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            walk(file);
        } else if (file.endsWith('.xml')) {
            fixFile(file);
        }
    });
}

walk(dir);
