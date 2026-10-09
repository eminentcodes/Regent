import sharp from 'sharp'
import { readdir } from 'node:fs/promises'

const names = (await readdir('public/images')).filter((name) => name.endsWith('.jpg'))
const tiles = []
for (let index = 0; index < names.length; index++) {
  const input = 'public/images/' + names[index]
  const metadata = await sharp(input).metadata()
  console.log(names[index], metadata.width + 'x' + metadata.height)
  const tile = await sharp(input).resize(230, 170, { fit: 'cover' }).toBuffer()
  const label = Buffer.from(`<svg width="230" height="30"><rect width="230" height="30" fill="#f7f5fa"/><text x="10" y="20" font-size="14" fill="#24232a" font-family="Arial">${names[index]}</text></svg>`)
  tiles.push({ input: tile, top: Math.floor(index / 4) * 210, left: (index % 4) * 240 })
  tiles.push({ input: label, top: Math.floor(index / 4) * 210 + 170, left: (index % 4) * 240 })
}
await sharp({ create: { width: 960, height: Math.ceil(names.length / 4) * 210, channels: 3, background: '#eeebf2' } }).composite(tiles).jpeg({ quality: 90 }).toFile('artifacts/ui/asset-contact-sheet.jpg')
