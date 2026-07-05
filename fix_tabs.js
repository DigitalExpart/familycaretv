const fs = require('fs');
const path = require('path');

const kidsPath = path.join(__dirname, 'apps/mobile/src/app/(tabs)/kids.tsx');
const petsPath = path.join(__dirname, 'apps/mobile/src/app/(tabs)/pets.tsx');

let kidsContent = fs.readFileSync(kidsPath, 'utf8');

// kids.tsx
kidsContent = kidsContent.replace(
  `{activeTab === '+ Add' ? t('kids.schoolInfo') : \`\${name}'s \${t('kids.schoolInfo')}\`}`,
  `{activeTab === '+ Add' ? t('kids.schoolInfo') : \`\${name} - \${t('kids.schoolInfo')}\`}`
);
kidsContent = kidsContent.replace(/"Add a chore\.\.\."/g, `t('kids.addChore', 'Add a chore...')`);
kidsContent = kidsContent.replace(/>CHORES</g, `>{t('kids.chores', 'CHORES')}<`);
kidsContent = kidsContent.replace(/>No chores added\.</g, `>{t('kids.noChores', 'No chores added.')}<`);
kidsContent = kidsContent.replace(/>HOMEWORK</g, `>{t('kids.homeworkTab', 'HOMEWORK')}<`);
kidsContent = kidsContent.replace(/>No homework added\.</g, `>{t('kids.noHomework', 'No homework added.')}<`);
kidsContent = kidsContent.replace(/>Chore</g, `>{t('kids.chore', 'Chore')}<`);
kidsContent = kidsContent.replace(/>Homework</g, `>{t('kids.homework', 'Homework')}<`);
kidsContent = kidsContent.replace(/>\+ Add</g, `>{t('common.add', '+ Add')}<`);

fs.writeFileSync(kidsPath, kidsContent, 'utf8');


let petsContent = fs.readFileSync(petsPath, 'utf8');

// pets.tsx
petsContent = petsContent.replace(/>\+ Add</g, `>{t('common.add', '+ Add')}<`);
petsContent = petsContent.replace(/>Pet Tasks</g, `>{t('pets.tasks', 'Pet Tasks')}<`);
petsContent = petsContent.replace(/"Task Name"/g, `t('pets.taskName', 'Task Name')`);
petsContent = petsContent.replace(/>Add Task</g, `>{t('pets.addTask', 'Add Task')}<`);
petsContent = petsContent.replace(/>PHONE</g, `>{t('pets.form.phone', 'PHONE')}<`);
petsContent = petsContent.replace(/'Select Date'/g, `t('pets.selectDate', 'Select Date')`);
petsContent = petsContent.replace(/>Add Vaccine</g, `>{t('pets.addVaccine', 'Add Vaccine')}<`);
petsContent = petsContent.replace(/>Add Medication</g, `>{t('pets.addMedication', 'Add Medication')}<`);
petsContent = petsContent.replace(/>TIME</g, `>{t('pets.form.time', 'TIME')}<`);
petsContent = petsContent.replace(/'Set Time'/g, `t('pets.setTime', 'Set Time')`);
petsContent = petsContent.replace(/>Repeat Everyday\?</g, `>{t('pets.repeatEveryday', 'Repeat Everyday?')}<`);
petsContent = petsContent.replace(/"Dr. Name"/g, `t('pets.form.drName', 'Dr. Name')`);
petsContent = petsContent.replace(/"Emergency Vet"/g, `t('pets.form.emergencyVet', 'Emergency Vet')`);

fs.writeFileSync(petsPath, petsContent, 'utf8');

console.log('Tabs patched successfully.');
