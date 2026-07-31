const fs = require('fs');
const path = require('path');
const scenes = ['PatientsScene', 'MedicationsScene', 'NotesScene', 'PetsScene', 'DrawingScene', 'CalendarScene', 'BibleVerseScene', 'MusicScene'];
const dir = 'c:\\Users\\Shilley Pc\\FamilyCare TV Full Platform Build\\roku\\components\\scenes';
scenes.forEach(scene => {
    let xmlFile = path.join(dir, scene + '.xml');
    if (fs.existsSync(xmlFile)) {
        let xml = fs.readFileSync(xmlFile, 'utf8');
        if (!xml.includes('id="backBtn"')) {
            console.log(scene + ' is MISSING backBtn in XML');
        } else {
            console.log(scene + ' has backBtn in XML');
        }
    }
});
