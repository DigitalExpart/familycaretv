const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Create a valid, spec-compliant PNG file buffer given width and height
function createPngBuffer(width = 100, height = 100) {
  // Signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type 2 = Truecolor (RGB)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image data: height rows, each row starts with filter byte 0, followed by width * 3 bytes (RGB)
  const rowSize = 1 + width * 3;
  const rawData = Buffer.alloc(rowSize * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * rowSize;
    rawData[rowStart] = 0; // None filter
    for (let x = 0; x < width; x++) {
      const pixelStart = rowStart + 1 + x * 3;
      rawData[pixelStart] = 32;     // R
      rawData[pixelStart + 1] = 138; // G
      rawData[pixelStart + 2] = 239; // B (#208AEF)
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);

  const crcBuf = buf.subarray(4, 8 + len);
  const crc = crc32(crcBuf);
  buf.writeUInt32BE(crc, 8 + len);

  return buf;
}

// CRC32 implementation for PNG chunks
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    const byte = buf[i];
    crc ^= byte;
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xedb88320;
      } else {
        crc = crc >>> 1;
      }
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Generate all app assets
const baseDir = path.join(__dirname, 'assets', 'images');
const tabIconsDir = path.join(baseDir, 'tabIcons');

if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });
if (!fs.existsSync(tabIconsDir)) fs.mkdirSync(tabIconsDir, { recursive: true });

const png100 = createPngBuffer(100, 100);
const png512 = createPngBuffer(512, 512);

const requiredAssets = [
  { path: 'icon.png', buf: png512 },
  { path: 'android-icon-foreground.png', buf: png512 },
  { path: 'android-icon-background.png', buf: png512 },
  { path: 'android-icon-monochrome.png', buf: png512 },
  { path: 'favicon.png', buf: png100 },
  { path: 'splash-icon.png', buf: png512 },
  { path: 'tutorial-web.png', buf: png100 },
  { path: 'react-logo.png', buf: png100 },
  { path: 'logo-glow.png', buf: png100 },
  { path: 'expo-logo.png', buf: png100 },
  { path: 'expo-badge.png', buf: png100 },
  { path: 'expo-badge-white.png', buf: png100 },
  { path: 'tabIcons/home.png', buf: png100 },
  { path: 'tabIcons/explore.png', buf: png100 }
];

for (const item of requiredAssets) {
  const fullPath = path.join(baseDir, item.path);
  fs.writeFileSync(fullPath, item.buf);
  console.log("Generated valid PNG:", fullPath);
}

// Also test with image-size package to be 100% sure!
try {
  const sizeOf = require('image-size');
  const size = sizeOf(path.join(baseDir, 'icon.png'));
  console.log("Verification success! Parsed dimensions:", size.width, "x", size.height);
} catch (e) {
  console.error("Verification failed:", e.message);
}
