const fs = require('fs');
const path = require('path');

async function download() {
  const url = "https://github.com/lvcabral/brs-desktop/releases/download/v2.3.0/brs-desktop-2.3.0-windows.exe";
  const dest = path.join(__dirname, "brs-desktop-2.3.0-windows.exe");
  console.log("Downloading from", url);
  console.log("Saving to", dest);

  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  const buffer = await res.arrayBuffer();
  fs.writeFileSync(dest, Buffer.from(buffer));
  console.log("Downloaded successfully! Size:", fs.statSync(dest).size, "bytes");
}

download().catch(console.error);
