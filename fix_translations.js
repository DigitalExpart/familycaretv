const fs = require('fs');
const path = require('path');

const updateJson = (filePath, updates) => {
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  for (const [key, value] of Object.entries(updates)) {
    const parts = key.split('.');
    let curr = content;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!curr[parts[i]]) curr[parts[i]] = {};
      curr = curr[parts[i]];
    }
    curr[parts[parts.length - 1]] = value;
  }
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
};

const enPath = path.join(__dirname, 'apps/mobile/src/locales/en.json');
const esPath = path.join(__dirname, 'apps/mobile/src/locales/es.json');

updateJson(enPath, {
  "kids.addChore": "Add a chore...",
  "kids.chores": "CHORES",
  "kids.noChores": "No chores added.",
  "kids.homeworkTab": "HOMEWORK",
  "kids.noHomework": "No homework added.",
  "kids.chore": "Chore",
  "kids.homework": "Homework",
  "pets.tasks": "Pet Tasks",
  "pets.taskName": "Task Name",
  "pets.addTask": "Add Task",
  "pets.selectDate": "Select Date",
  "pets.addVaccine": "Add Vaccine",
  "pets.addMedication": "Add Medication",
  "pets.setTime": "Set Time",
  "pets.repeatEveryday": "Repeat Everyday?",
  "pets.form.phone": "PHONE",
  "pets.form.time": "TIME",
  "pets.form.drName": "Dr. Name",
  "pets.form.emergencyVet": "Emergency Vet"
});

updateJson(esPath, {
  "kids.addChore": "Añadir tarea...",
  "kids.chores": "TAREAS",
  "kids.noChores": "No se añadieron tareas.",
  "kids.homeworkTab": "DEBERES",
  "kids.noHomework": "No se añadieron deberes.",
  "kids.chore": "Tarea",
  "kids.homework": "Deberes",
  "pets.tasks": "Tareas de Mascota",
  "pets.taskName": "Nombre de Tarea",
  "pets.addTask": "Añadir Tarea",
  "pets.selectDate": "Seleccionar Fecha",
  "pets.addVaccine": "Añadir Vacuna",
  "pets.addMedication": "Añadir Medicamento",
  "pets.setTime": "Establecer Hora",
  "pets.repeatEveryday": "¿Repetir Todos los Días?",
  "pets.form.phone": "TELÉFONO",
  "pets.form.time": "HORA",
  "pets.form.drName": "Nombre del Dr.",
  "pets.form.emergencyVet": "Vet. de Emergencia"
});

console.log('Translations updated.');
