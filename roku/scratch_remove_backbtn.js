const fs = require('fs');
const path = require('path');

const scenesDir = path.join(__dirname, 'components', 'scenes');
const files = fs.readdirSync(scenesDir);

for (const file of files) {
    if (file.endsWith('Scene.xml')) {
        let content = fs.readFileSync(path.join(scenesDir, file), 'utf8');
        // Find the backBtn group and remove it. It looks like:
        // <Group id="backBtn" translation="[60, 20]">
        //     <Rectangle id="backFocusBorder" width="224" height="54" color="0x607D8BFF" translation="[-2, -2]" visible="false" />
        //     <Rectangle id="backBg" width="220" height="50" color="0x444444FF" />
        //     <Label text="← Back" font="font:MediumBoldSystemFont" color="0xFFFFFFFF" horizAlign="center" width="220" translation="[0, 12]" />
        // </Group>
        
        let newContent = content.replace(/\s*<Group id="backBtn"[\s\S]*?<\/Group>/, '');
        
        // Also fix the loading overlays in scenes that still use 0xF2F4F7EE or white overlays
        newContent = newContent.replace(/color="0xF2F4F7EE"/g, 'color="0x121212FF"'); // Dark mode loading
        newContent = newContent.replace(/color="0x000000CC"/g, 'color="0x121212F0"'); // slightly deeper overlay
        
        if (content !== newContent) {
            fs.writeFileSync(path.join(scenesDir, file), newContent);
            console.log('Fixed', file);
        }
    }
}
