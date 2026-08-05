import sharp from "sharp"

const src =
  "/Users/muhammadsultandogar/.cursor/projects/Users-muhammadsultandogar-Thebazmco/assets/image-74b5d940-2d7e-4dcd-a9c5-4cd53f17301e.png"
const out = "public/decor/gorilla-outdoor.png"

function dist(r, g, b, tr, tg, tb) {
  return Math.sqrt((r - tr) ** 2 + (g - tg) ** 2 + (b - tb) ** 2)
}

function lum(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b
}

function markBackground(data, w, h, ch, tolerance) {
  const bg = new Uint8Array(w * h)
  const seeds = []

  for (let x = 0; x < w; x += 2) {
    seeds.push([x, 0], [x, h - 1])
  }
  for (let y = 0; y < h; y += 2) {
    seeds.push([0, y], [w - 1, y])
  }

  for (const [sx, sy] of seeds) {
    const pi = sy * w + sx
    if (bg[pi]) continue
    const i = pi * ch
    const stack = [[sx, sy]]
    const tr = data[i]
    const tg = data[i + 1]
    const tb = data[i + 2]

    while (stack.length) {
      const [x, y] = stack.pop()
      const p = y * w + x
      if (bg[p]) continue
      const idx = p * ch
      const r = data[idx]
      const g = data[idx + 1]
      const b = data[idx + 2]
      const l = lum(r, g, b)

      if (l < 62) continue
      if (dist(r, g, b, tr, tg, tb) > tolerance) continue

      bg[p] = 1
      if (x > 0) stack.push([x - 1, y])
      if (x < w - 1) stack.push([x + 1, y])
      if (y > 0) stack.push([x, y - 1])
      if (y < h - 1) stack.push([x, y + 1])
    }
  }

  for (let pi = 0; pi < w * h; pi++) {
    if (bg[pi]) data[pi * ch + 3] = 0
  }
}

function fillInteriorHoles(data, w, h, ch, passes = 4) {
  for (let pass = 0; pass < passes; pass++) {
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const pi = y * w + x
        const i = pi * ch
        if (data[i + 3] > 0) continue
        let opaque = 0
        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          if (data[((y + dy) * w + (x + dx)) * ch + 3] > 0) opaque++
        }
        if (opaque >= 3) {
          const l = lum(data[i], data[i + 1], data[i + 2])
          if (l < 120) data[i + 3] = 255
        }
      }
    }
  }
}

function cleanFringe(data, ch) {
  for (let i = 0; i < data.length; i += ch) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    let a = data[i + 3]
    if (!a) continue
    const l = lum(r, g, b)
    if (g > r + 14 && g > b + 8 && g > 60) {
      data[i + 3] = 0
      continue
    }
    if (b > r + 8 && b > g && b > 45) {
      data[i + 3] = 0
      continue
    }
    if (r > 140 && g > 110 && b > 70 && r - g < 55) {
      data[i + 3] = 0
      continue
    }
    if (l > 198) {
      data[i + 3] = 0
      continue
    }
    if (l > 145) data[i + 3] = Math.round(a * Math.max(0, 1 - (l - 145) / 85))
  }
}

const meta = await sharp(src).metadata()
const { width: sw, height: sh } = meta

const { data, info } = await sharp(src)
  .extract({
    left: Math.floor(sw * 0.22),
    top: Math.floor(sh * 0.03),
    width: Math.floor(sw * 0.56),
    height: Math.floor(sh * 0.9),
  })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })

const { width: w, height: h, channels: ch } = info
const buf = Buffer.from(data)

markBackground(buf, w, h, ch, 48)
fillInteriorHoles(buf, w, h, ch)
cleanFringe(buf, ch)

const trimmed = await sharp(buf, { raw: { width: w, height: h, channels: ch } })
  .trim({ threshold: 12 })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })

// Soften alpha edges slightly
const alpha = Buffer.alloc(trimmed.info.width * trimmed.info.height)
for (let i = 0, j = 0; i < trimmed.data.length; i += ch, j++) {
  alpha[j] = trimmed.data[i + 3]
}

const softenedAlpha = await sharp(alpha, {
  raw: { width: trimmed.info.width, height: trimmed.info.height, channels: 1 },
})
  .blur(0.6)
  .raw()
  .toBuffer()

for (let i = 0, j = 0; i < trimmed.data.length; i += ch, j++) {
  trimmed.data[i + 3] = softenedAlpha[j]
}

await sharp(trimmed.data, {
  raw: {
    width: trimmed.info.width,
    height: trimmed.info.height,
    channels: ch,
  },
})
  .png({ compressionLevel: 9 })
  .toFile(out)

console.log("done", trimmed.info.width, trimmed.info.height)
