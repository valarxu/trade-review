import express from 'express'
import cors from 'cors'
import multer from 'multer'
import * as fs from 'node:fs'
import { promises as fsp } from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const app = express()
const PORT = process.env.PORT || 3000
const rootDir = process.cwd()
const dataDir = path.join(rootDir, 'data')
const imagesDir = path.join(rootDir, 'images')
const tradesFile = path.join(dataDir, 'trades.json')

app.use(cors())
app.use(express.json({ limit: '2mb' }))
app.use('/images', express.static(imagesDir))

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const tradeId = req.params.id
    const dir = path.join(imagesDir, tradeId)
    await fsp.mkdir(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const type = req.params.type
    const ext = path.extname(file.originalname) || '.jpg'
    cb(null, `${type}${ext}`)
  }
})
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })

async function ensureInit() {
  await fsp.mkdir(dataDir, { recursive: true })
  await fsp.mkdir(imagesDir, { recursive: true })
  try {
    await fsp.access(tradesFile, fs.constants.F_OK)
  } catch {
    await fsp.writeFile(tradesFile, '[]', 'utf-8')
  }
}

async function readTrades() {
  const buf = await fsp.readFile(tradesFile, 'utf-8')
  const data = JSON.parse(buf || '[]')
  return Array.isArray(data) ? data : []
}

let writing = Promise.resolve()
function writeTrades(trades) {
  const task = async () => {
    const tmp = tradesFile + '.tmp'
    await fsp.writeFile(tmp, JSON.stringify(trades, null, 2), 'utf-8')
    await fsp.rename(tmp, tradesFile)
  }
  writing = writing.then(task, task)
  return writing
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

app.get('/api/trades', async (req, res) => {
  try {
    const trades = await readTrades()
    res.json(trades)
  } catch {
    res.status(500).json({ error: 'read_failed' })
  }
})

app.post('/api/trades', async (req, res) => {
  try {
    const trades = await readTrades()
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const record = { ...req.body, id, createdAt: now, updatedAt: now }
    trades.push(record)
    await writeTrades(trades)
    res.status(201).json(record)
  } catch {
    res.status(500).json({ error: 'write_failed' })
  }
})

app.put('/api/trades/:id', async (req, res) => {
  try {
    const trades = await readTrades()
    const idx = trades.findIndex(t => t.id === req.params.id)
    if (idx === -1) return res.status(404).json({ error: 'not_found' })
    const updated = { ...trades[idx], ...req.body, updatedAt: new Date().toISOString() }
    trades[idx] = updated
    await writeTrades(trades)
    res.json(updated)
  } catch {
    res.status(500).json({ error: 'write_failed' })
  }
})

app.delete('/api/trades/:id', async (req, res) => {
  try {
    const trades = await readTrades()
    const filtered = trades.filter(t => t.id !== req.params.id)
    await writeTrades(filtered)
    res.status(204).end()
  } catch {
    res.status(500).json({ error: 'write_failed' })
  }
})

app.post('/api/images/:id/:type', upload.single('file'), async (req, res) => {
  try {
    const tradeId = req.params.id
    const type = req.params.type
    const ext = path.extname(req.file.filename) || '.jpg'
    const rel = `/images/${tradeId}/${type}${ext}`
    if (req.file?.path) {
      try {
        await fsp.chmod(path.dirname(req.file.path), 0o755)
        await fsp.chmod(req.file.path, 0o644)
      } catch {}
    }
    const trades = await readTrades()
    const idx = trades.findIndex(t => t.id === tradeId)
    if (idx !== -1) {
      if (type === 'entry') trades[idx].entryImage = rel
      if (type === 'exit') trades[idx].exitImage = rel
      trades[idx].updatedAt = new Date().toISOString()
      await writeTrades(trades)
    }
    res.status(201).json({ path: rel })
  } catch {
    res.status(500).json({ error: 'upload_failed' })
  }
})

ensureInit().then(() => {
  app.listen(PORT, () => {})
})
