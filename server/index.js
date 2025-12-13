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
const plansFile = path.join(dataDir, 'plans.json')

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
  try { await fsp.chmod(dataDir, 0o755) } catch {}
  try { await fsp.chmod(imagesDir, 0o755) } catch {}
  try {
    await fsp.access(tradesFile, fs.constants.F_OK)
  } catch {
    await fsp.writeFile(tradesFile, '[]', 'utf-8')
    try { await fsp.chmod(tradesFile, 0o664) } catch {}
  }
  try {
    await fsp.access(plansFile, fs.constants.F_OK)
  } catch {
    await fsp.writeFile(plansFile, '[]', 'utf-8')
    try { await fsp.chmod(plansFile, 0o664) } catch {}
  }
}

async function readTrades() {
  let buf = '[]'
  try {
    buf = await fsp.readFile(tradesFile, 'utf-8')
  } catch {}
  try {
    const data = JSON.parse(buf || '[]')
    return Array.isArray(data) ? data : []
  } catch (e) {
    const backup = tradesFile + '.corrupt.' + Date.now() + '.bak'
    try { await fsp.rename(tradesFile, backup) } catch {}
    try { await fsp.writeFile(tradesFile, '[]', 'utf-8') } catch {}
    try { await fsp.chmod(tradesFile, 0o664) } catch {}
    return []
  }
}

let writing = Promise.resolve()
function writeTrades(trades) {
  const task = async () => {
    const tmp = tradesFile + '.tmp'
    await fsp.writeFile(tmp, JSON.stringify(trades, null, 2), 'utf-8')
    await fsp.rename(tmp, tradesFile)
    try { await fsp.chmod(tradesFile, 0o664) } catch {}
  }
  writing = writing.then(task, task)
  return writing
}

async function readPlans() {
  let buf = '[]'
  try {
    buf = await fsp.readFile(plansFile, 'utf-8')
  } catch {}
  try {
    const data = JSON.parse(buf || '[]')
    return Array.isArray(data) ? data : []
  } catch (e) {
    const backup = plansFile + '.corrupt.' + Date.now() + '.bak'
    try { await fsp.rename(plansFile, backup) } catch {}
    try { await fsp.writeFile(plansFile, '[]', 'utf-8') } catch {}
    try { await fsp.chmod(plansFile, 0o664) } catch {}
    return []
  }
}

let writingPlans = Promise.resolve()
function writePlans(plans) {
  const task = async () => {
    const tmp = plansFile + '.tmp'
    await fsp.writeFile(tmp, JSON.stringify(plans, null, 2), 'utf-8')
    await fsp.rename(tmp, plansFile)
    try { await fsp.chmod(plansFile, 0o664) } catch {}
  }
  writingPlans = writingPlans.then(task, task)
  return writingPlans
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
    const prev = trades[idx]
    const updated = { ...prev, ...req.body, updatedAt: new Date().toISOString() }
    if (req.body.status === 'closed' && prev.status !== 'closed' && !req.body.exitTime) {
      updated.exitTime = new Date().toISOString()
    }
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

app.get('/api/plans', async (req, res) => {
  try {
    const plans = await readPlans()
    res.json(plans)
  } catch {
    res.status(500).json({ error: 'read_failed' })
  }
})

app.post('/api/plans', async (req, res) => {
  try {
    const plans = await readPlans()
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const record = { ...req.body, id, createdAt: now, updatedAt: now }
    plans.push(record)
    await writePlans(plans)
    res.status(201).json(record)
  } catch {
    res.status(500).json({ error: 'write_failed' })
  }
})

app.put('/api/plans/:id', async (req, res) => {
  try {
    const plans = await readPlans()
    const idx = plans.findIndex(p => p.id === req.params.id)
    if (idx === -1) return res.status(404).json({ error: 'not_found' })
    const prev = plans[idx]
    const updated = { ...prev, ...req.body, updatedAt: new Date().toISOString() }
    plans[idx] = updated
    await writePlans(plans)
    res.json(updated)
  } catch {
    res.status(500).json({ error: 'write_failed' })
  }
})

app.delete('/api/plans/:id', async (req, res) => {
  try {
    const plans = await readPlans()
    const filtered = plans.filter(p => p.id !== req.params.id)
    await writePlans(filtered)
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
    const tIdx = trades.findIndex(t => t.id === tradeId)
    if (tIdx !== -1) {
      if (type === 'entry') trades[tIdx].entryImage = rel
      if (type === 'exit') trades[tIdx].exitImage = rel
      trades[tIdx].updatedAt = new Date().toISOString()
      await writeTrades(trades)
    }
    const plans = await readPlans()
    const pIdx = plans.findIndex(p => p.id === tradeId)
    if (pIdx !== -1) {
      if (type === 'plan') plans[pIdx].planImage = rel
      if (type === 'summary') plans[pIdx].summaryImage = rel
      plans[pIdx].updatedAt = new Date().toISOString()
      await writePlans(plans)
    }
    res.status(201).json({ path: rel })
  } catch {
    res.status(500).json({ error: 'upload_failed' })
  }
})

ensureInit().then(() => {
  app.listen(PORT, () => {})
})
