const fs = require('fs');
const { execSync } = require('child_process');

try {
    execSync('npm i fast-xml-parser', { stdio: 'inherit' });
    const { XMLValidator } = require('fast-xml-parser');
    
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    const files = status.split('\n')
        .filter(line => line.trim().length > 0 && line.includes('.xml'))
        .map(line => line.substring(3).trim());

    let errorCount = 0;
    for (let f of files) {
        if (!fs.existsSync(f)) continue;
        let xml = fs.readFileSync(f, 'utf8');
        const result = XMLValidator.validate(xml);
        if (result !== true) {
            console.log('XML Error in', f, result);
            errorCount++;
        }
    }
    
    if (errorCount === 0) {
        console.log('All modified XML files are syntactically valid!');
    }
} catch (e) {
    console.error(e.message);
}
