async function run() {
  try {
    const res = await fetch("https://github.com/lvcabral/brs-desktop/releases/expanded_assets/v2.3.0", {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const html = await res.text();
    const matches = [...html.matchAll(/href="(\/lvcabral\/brs-desktop\/releases\/download\/[^"]+)"/g)];
    for (const m of matches) {
      console.log("DOWNLOAD LINK:", "https://github.com" + m[1]);
    }
  } catch (err) {
    console.error(err);
  }
}
run();
