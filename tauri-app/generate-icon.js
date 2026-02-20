// generate-icon.js
// Generates a simple 1024x1024 PNG icon for Tauri using Node.js built-in modules
// Creates a purple square with "CMS" text represented as a simple design

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const iconsDir = path.join(__dirname, 'src-tauri', 'icons')

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true })
}

// Create a minimal valid PNG (32x32 purple square)
// PNG structure: signature + IHDR + IDAT + IEND
function createPNG(width, height, r, g, b) {
    // PNG Signature
    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

    // IHDR chunk
    const ihdrData = Buffer.alloc(13)
    ihdrData.writeUInt32BE(width, 0)   // Width
    ihdrData.writeUInt32BE(height, 4)  // Height
    ihdrData.writeUInt8(8, 8)          // Bit depth
    ihdrData.writeUInt8(2, 9)          // Color type: RGB
    ihdrData.writeUInt8(0, 10)         // Compression
    ihdrData.writeUInt8(0, 11)         // Filter
    ihdrData.writeUInt8(0, 12)         // Interlace
    const ihdr = makeChunk('IHDR', ihdrData)

    // IDAT chunk - raw image data with zlib compression
    // Each row: filter byte (0) + RGB pixels
    const rawData = []
    for (let y = 0; y < height; y++) {
        rawData.push(0) // Filter: None
        for (let x = 0; x < width; x++) {
            // Create a simple gradient/pattern
            const cx = width / 2, cy = height / 2
            const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
            const maxDist = Math.sqrt(cx ** 2 + cy ** 2)
            const factor = Math.max(0, 1 - dist / maxDist * 0.5)

            rawData.push(Math.round(r * factor))
            rawData.push(Math.round(g * factor))
            rawData.push(Math.round(b * factor))
        }
    }

    // Simple zlib compression (deflate with no compression)
    const rawBuf = Buffer.from(rawData)
    const idatData = zlibNoCompress(rawBuf)
    const idat = makeChunk('IDAT', idatData)

    // IEND chunk
    const iend = makeChunk('IEND', Buffer.alloc(0))

    return Buffer.concat([signature, ihdr, idat, iend])
}

function makeChunk(type, data) {
    const length = Buffer.alloc(4)
    length.writeUInt32BE(data.length)
    const typeBuffer = Buffer.from(type, 'ascii')
    const crcData = Buffer.concat([typeBuffer, data])
    const crc = Buffer.alloc(4)
    crc.writeUInt32BE(crc32(crcData) >>> 0)
    return Buffer.concat([length, typeBuffer, data, crc])
}

// CRC32 implementation
function crc32(buf) {
    let crc = 0xFFFFFFFF
    for (let i = 0; i < buf.length; i++) {
        crc ^= buf[i]
        for (let j = 0; j < 8; j++) {
            crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0)
        }
    }
    return ~crc
}

// Minimal zlib wrapper with no compression (stored blocks)
function zlibNoCompress(data) {
    const chunks = []
    // Zlib header: CMF=0x78, FLG=0x01
    chunks.push(Buffer.from([0x78, 0x01]))

    let offset = 0
    while (offset < data.length) {
        const remaining = data.length - offset
        const blockSize = Math.min(remaining, 65535)
        const isLast = offset + blockSize >= data.length

        // Deflate stored block header
        const header = Buffer.alloc(5)
        header.writeUInt8(isLast ? 0x01 : 0x00, 0)
        header.writeUInt16LE(blockSize, 1)
        header.writeUInt16LE(~blockSize & 0xFFFF, 3)
        chunks.push(header)

        chunks.push(data.subarray(offset, offset + blockSize))
        offset += blockSize
    }

    // Adler32 checksum
    let a = 1, b = 0
    for (let i = 0; i < data.length; i++) {
        a = (a + data[i]) % 65521
        b = (b + a) % 65521
    }
    const adler = Buffer.alloc(4)
    adler.writeUInt32BE(((b << 16) | a) >>> 0)
    chunks.push(adler)

    return Buffer.concat(chunks)
}

// Generate icons at different sizes
const sizes = [
    { name: '32x32.png', size: 32 },
    { name: '128x128.png', size: 128 },
    { name: '128x128@2x.png', size: 256 },
]

// Purple accent color: #7C5CFC
for (const { name, size } of sizes) {
    const png = createPNG(size, size, 124, 92, 252)
    const filePath = path.join(iconsDir, name)
    fs.writeFileSync(filePath, png)
    console.log(`Created ${name} (${size}x${size})`)
}

// For .ico and .icns, create simple copies (the build tools will handle conversion)
// .ico: Just use the 32x32 PNG data in a minimal ICO wrapper
function createICO(pngData, width, height) {
    // ICO header: reserved(2) + type(2) + count(2)
    const header = Buffer.alloc(6)
    header.writeUInt16LE(0, 0)       // Reserved
    header.writeUInt16LE(1, 2)       // Type: ICO
    header.writeUInt16LE(1, 4)       // Count: 1 entry

    // ICO directory entry (16 bytes)
    const entry = Buffer.alloc(16)
    entry.writeUInt8(width > 255 ? 0 : width, 0)   // Width (0 = 256)
    entry.writeUInt8(height > 255 ? 0 : height, 1)  // Height
    entry.writeUInt8(0, 2)           // Color palette
    entry.writeUInt8(0, 3)           // Reserved
    entry.writeUInt16LE(1, 4)        // Color planes
    entry.writeUInt16LE(32, 6)       // Bits per pixel
    entry.writeUInt32LE(pngData.length, 8)  // Size of image data
    entry.writeUInt32LE(22, 12)      // Offset to image data (6 + 16 = 22)

    return Buffer.concat([header, entry, pngData])
}

const png32 = fs.readFileSync(path.join(iconsDir, '32x32.png'))
const ico = createICO(png32, 32, 32)
fs.writeFileSync(path.join(iconsDir, 'icon.ico'), ico)
console.log('Created icon.ico')

// .icns: Create a copy of 128x128 PNG as placeholder
fs.copyFileSync(
    path.join(iconsDir, '128x128.png'),
    path.join(iconsDir, 'icon.icns')
)
console.log('Created icon.icns (placeholder)')

console.log('\nAll icons generated successfully!')
