const fs = require('fs');
const path = require('path');
const dir = 'c:\\Users\\Shilley Pc\\FamilyCare TV Full Platform Build\\roku\\components';
function walk(d) {
    let results = [];
    const list = fs.readdirSync(d);
    list.forEach(function(file) {
        file = path.join(d, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.xml')) {
            const content = fs.readFileSync(file, 'utf8');
            if (content.includes('0xF2F4F7FF') || content.includes('color="0xFFFFFFFF"')) {
                results.push(file);
            }
        }
    });
    return results;
}
console.log(walk(dir).join('\n'));
