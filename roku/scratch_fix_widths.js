const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\Shilley Pc\\FamilyCare TV Full Platform Build\\roku\\components';

function fixFile(file) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    content = content.replace(/id="cancelFocusBorder" width="344"/g, 'id="cancelFocusBorder" width="224"');
    content = content.replace(/id="cancelBg" width="340"/g, 'id="cancelBg" width="220"');
    content = content.replace(/(<Label id="cancelLabel"[^>]*?)width="340"([^>]*>)/g, '$1width="220"$2');
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Modified widths: ' + file);
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
