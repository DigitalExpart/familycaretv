const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    const files = status.split('\n')
        .filter(line => line.trim().length > 0 && line.includes('.xml'))
        .map(line => line.substring(3).trim());

    // Very simple regex check to see if we have unbalanced tags or missing quotes
    // But it's better to just try parsing them with a real XML parser if available,
    // or just look for obvious issues.
    // For now, let's just see if there are any <Group> without </Group> etc.
    let hasError = false;
    
    // Instead of regex, let's just print the files that changed and we can inspect them or use xmllint
    // Actually, maybe we can just run xmllint if it's available, but this is windows.
    // Let's use a simple regex check for missing " in color="
    for (let f of files) {
        if (!fs.existsSync(f)) continue;
        const xml = fs.readFileSync(f, 'utf8');
        
        // Check for color="0xF" missing ending quote or something
        if (xml.match(/color="[^"]*$/m)) {
            console.log("Syntax error (unclosed quote) in", f);
            hasError = true;
        }
        // Check for empty tags that are unclosed like <Rectangle ... > without /
        if (xml.match(/<(Rectangle|Label|Group)[^>]*[^/]>[\s\S]*?<\/\1>/)) {
           // this is fine
        }
        // Check if there are multiple root elements
        if ((xml.match(/<component/g) || []).length > 1) {
            console.log("Multiple component tags in", f);
        }
    }
    
    if (!hasError) {
        console.log("No obvious syntax errors found in modified XML files.");
    }
} catch (e) {
    console.error(e);
}
