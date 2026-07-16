import sharp from 'sharp'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')
const source = join(publicDir, 'icon-source.png')

async function run() {
  for (const size of [32, 180, 192, 512]) {
    const out = join(publicDir, size === 32 ? 'favicon.png' : `icon-${size}.png`)
    await sharp(source).resize(size, size).png().toFile(out)
    console.log(`Created ${size === 32 ? 'favicon.png' : `icon-${size}.png`}`)
  }
  console.log('Done!')
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
