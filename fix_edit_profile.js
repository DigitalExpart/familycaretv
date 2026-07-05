const fs = require('fs');
const path = require('path');

// 1. Update edit-profile.tsx
const editProfilePath = path.join(__dirname, 'apps/mobile/src/app/(tabs)/edit-profile.tsx');
let editProfileContent = fs.readFileSync(editProfilePath, 'utf8');

// Add import
if (!editProfileContent.includes("import { useTranslation }")) {
  editProfileContent = editProfileContent.replace(
    "import { Camera, Save, ArrowLeft } from 'lucide-react-native';",
    "import { Camera, Save, ArrowLeft } from 'lucide-react-native';\nimport { useTranslation } from 'react-i18next';"
  );
}

// Add hook
if (!editProfileContent.includes("const { t } = useTranslation();")) {
  editProfileContent = editProfileContent.replace(
    "const { isDark } = useTheme();",
    "const { t } = useTranslation();\n  const { isDark } = useTheme();"
  );
}

// Replace strings
editProfileContent = editProfileContent.replace(
  /alert\('Sorry, we need camera roll permissions to make this work!'\);/g,
  `alert(t('profile.cameraPermission', 'Sorry, we need camera roll permissions to make this work!'));`
);

editProfileContent = editProfileContent.replace(
  /alert\('Profile updated successfully!'\);/g,
  `alert(t('profile.updateSuccess', 'Profile updated successfully!'));`
);

editProfileContent = editProfileContent.replace(
  /alert\(e\.response\?\.data\?\.message \|\| 'Error updating profile\. Check your connection\.'\);/g,
  `alert(e.response?.data?.message || t('profile.updateError', 'Error updating profile. Check your connection.'));`
);

editProfileContent = editProfileContent.replace(
  /title="Edit Profile"/g,
  `title={t('profile.editProfile', 'Edit Profile')}`
);

editProfileContent = editProfileContent.replace(
  />Tap to change photo</g,
  `>{t('profile.changePhoto', 'Tap to change photo')}<`
);

editProfileContent = editProfileContent.replace(
  />First Name</g,
  `>{t('profile.firstName', 'First Name')}<`
);
editProfileContent = editProfileContent.replace(
  /placeholder="First Name"/g,
  `placeholder={t('profile.firstName', 'First Name')}`
);

editProfileContent = editProfileContent.replace(
  />Last Name</g,
  `>{t('profile.lastName', 'Last Name')}<`
);
editProfileContent = editProfileContent.replace(
  /placeholder="Last Name"/g,
  `placeholder={t('profile.lastName', 'Last Name')}`
);

editProfileContent = editProfileContent.replace(
  />Phone Number</g,
  `>{t('profile.phone', 'Phone Number')}<`
);
editProfileContent = editProfileContent.replace(
  /placeholder="Phone Number"/g,
  `placeholder={t('profile.phone', 'Phone Number')}`
);

editProfileContent = editProfileContent.replace(
  />Gender</g,
  `>{t('profile.gender', 'Gender')}<`
);
editProfileContent = editProfileContent.replace(
  /placeholder="Male \/ Female \/ Other"/g,
  `placeholder={t('profile.genderPlaceholder', 'Male / Female / Other')}`
);

editProfileContent = editProfileContent.replace(
  />Timezone</g,
  `>{t('profile.timezone', 'Timezone')}<`
);
editProfileContent = editProfileContent.replace(
  /placeholder="e\.g\. America\/New_York"/g,
  `placeholder={t('profile.timezonePlaceholder', 'e.g. America/New_York')}`
);

editProfileContent = editProfileContent.replace(
  />Auto</g,
  `>{t('profile.auto', 'Auto')}<`
);

editProfileContent = editProfileContent.replace(
  />Save Changes</g,
  `>{t('common.saveChanges', 'Save Changes')}<`
);

fs.writeFileSync(editProfilePath, editProfileContent, 'utf8');

// 2. Update JSON files
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
  "profile.cameraPermission": "Sorry, we need camera roll permissions to make this work!",
  "profile.updateSuccess": "Profile updated successfully!",
  "profile.updateError": "Error updating profile. Check your connection.",
  "profile.changePhoto": "Tap to change photo",
  "profile.firstName": "First Name",
  "profile.lastName": "Last Name",
  "profile.phone": "Phone Number",
  "profile.gender": "Gender",
  "profile.genderPlaceholder": "Male / Female / Other",
  "profile.timezone": "Timezone",
  "profile.timezonePlaceholder": "e.g. America/New_York",
  "profile.auto": "Auto",
  "common.saveChanges": "Save Changes"
});

updateJson(esPath, {
  "profile.cameraPermission": "¡Lo sentimos, necesitamos permisos de la cámara para que esto funcione!",
  "profile.updateSuccess": "¡Perfil actualizado con éxito!",
  "profile.updateError": "Error al actualizar el perfil. Verifica tu conexión.",
  "profile.changePhoto": "Toca para cambiar la foto",
  "profile.firstName": "Nombre",
  "profile.lastName": "Apellido",
  "profile.phone": "Número de Teléfono",
  "profile.gender": "Género",
  "profile.genderPlaceholder": "Hombre / Mujer / Otro",
  "profile.timezone": "Zona Horaria",
  "profile.timezonePlaceholder": "ej. America/New_York",
  "profile.auto": "Automático",
  "common.saveChanges": "Guardar Cambios"
});

console.log('Edit profile patched.');
