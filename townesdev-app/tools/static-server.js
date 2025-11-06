#!/usr/bin/env node
// Simple static file server with SPA fallback. No external deps.
const http = require('http')
const fs = require('fs')
const path = require('path')
const url = require('url')

function parseArgs() {
  const args = process.argv.slice(2)
  const out = { port: 3334, site: process.cwd() }
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if ((a === '-l' || a === '--port') && args[i + 1]) {
      out.port = parseInt(args[++i], 10)
    } else if ((a === '-s' || a === '--site') && args[i + 1]) {
      out.site = args[++i]
    }
  }
  return out
}

const { port, site } = parseArgs()
const root = path.resolve(site)

const mime = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=UTF-8',
  '.wasm': 'application/wasm',
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 500
      res.end('Internal Server Error')
      return
    }
    const ext = path.extname(filePath).toLowerCase()
    res.setHeader('Content-Type', mime[ext] || 'application/octet-stream')
    res.end(data)
  })
}

const server = http.createServer((req, res) => {
  try {
    const parsed = url.parse(req.url || '/')
    let pathname = decodeURIComponent(parsed.pathname || '/')
    if (pathname === '/') pathname = '/index.html'
    const filePath = path.join(root, pathname)

    // Security: ensure filePath is inside root
    if (!filePath.startsWith(root)) {
      res.statusCode = 403
      res.end('Forbidden')
      return
    }

    fs.stat(filePath, (err, stats) => {
      if (!err && stats.isFile()) {
        sendFile(res, filePath)
        return
      }

      // SPA fallback: serve index.html for unknown routes
      const indexPath = path.join(root, 'index.html')
      fs.stat(indexPath, (ie, istats) => {
        if (!ie && istats.isFile()) {
          res.setHeader('Content-Type', 'text/html; charset=UTF-8')
          fs.createReadStream(indexPath).pipe(res)
          return
        }
        res.statusCode = 404
        res.end('Not Found')
      })
    })
  } catch (ex) {
    res.statusCode = 500
    res.end('Server error')
  }
})

server.listen(port, () => {
  console.log(`Static server serving ${root} on port ${port}`)
})

// Graceful shutdown
process.on('SIGINT', () => process.exit(0))
process.on('SIGTERM', () => process.exit(0))
