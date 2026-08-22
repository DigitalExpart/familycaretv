const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'assets', 'images');
const tabIconsDir = path.join(baseDir, 'tabIcons');

if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}
if (!fs.existsSync(tabIconsDir)) {
  fs.mkdirSync(tabIconsDir, { recursive: true });
}

// 1x1 transparent PNG base64
const pngBase64 = "iVBORw0KGgoAAAANSU5EUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
const pngBuffer = Buffer.from(pngBase64, "base64");

const files = [
  "tutorial-web.png",
  "react-logo.png",
  "logo-glow.png",
  "expo-logo.png",
  "expo-badge.png",
  "expo-badge-white.png",
  "tabIcons/home.png",
  "tabIcons/explore.png"
];

for (const file of files) {
  const filePath = path.join(baseDir, file);
  fs.writeFileSync(filePath, pngBuffer);
  console.log("Created asset:", filePath);
}

console.log("All missing assets created successfully!");
