import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')
const svg = readFileSync(join(publicDir, 'icon.svg'))

async function run() {
  for (const size of [180, 192, 512]) {
    const png = await sharp(svg)
      .resize(size, size)
      .png()
      .toBuffer()
    writeFileSync(join(publicDir, `icon-${size}.png`), png)
    console.log(`Created icon-${size}.png`)
  }
  console.log('Done!')
}

run().catch(e => { console.error(e); process.exit(1) })
