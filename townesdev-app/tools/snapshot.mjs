// tools/snapshot.mjs
import fs from 'node:fs'
import path from 'node:path'

const OUT = []
const push = (title, body) => OUT.push(`\n## ${title}\n\`\`\`\n${body}\n\`\`\``)

const slurp = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '')

const list = (dir, depth = 2) => {
  const lines = []
  const walk = (d, lvl) => {
    if (lvl > depth || !fs.existsSync(d)) return
    for (const f of fs.readdirSync(d)) {
      if (['node_modules', '.git', '.next', '.vercel', '.vscode'].includes(f))
        continue
      const fp = path.join(d, f)
      const s = fs.statSync(fp)
      lines.push(`${'  '.repeat(lvl)}- ${f}${s.isDirectory() ? '/' : ''}`)
      if (s.isDirectory()) walk(fp, lvl + 1)
    }
  }
  walk(dir, 0)
  return lines.join('\n')
}

push('TREE (depth=2)', list(process.cwd(), 2))
push('package.json', slurp('package.json'))
push('next.config', slurp('next.config.js') || slurp('next.config.ts'))
push('tsconfig.json', slurp('tsconfig.json'))
push('middleware.ts', slurp('middleware.ts'))

const take = (p) => (fs.existsSync(p) ? `# ${p}\n${slurp(p)}` : '')
const pages = [
  'app/page.tsx',
  'app/layout.tsx',
  'app/(app)/app/page.tsx',
  'app/(app)/app/layout.tsx',
  'app/(admin)/admin/page.tsx',
]
push('Key pages/layouts', pages.map(take).filter(Boolean).join('\n\n'))

const envKeys = new Set()
for (const file of fs.readdirSync('.', { withFileTypes: true })) {
  if (
    file.isDirectory() &&
    ['node_modules', '.git', '.next'].includes(file.name)
  )
    continue
}
const scanEnv = (dir) => {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    if (
      ['node_modules', '.git', '.next', '.vercel', '.vscode'].includes(f.name)
    )
      continue
    const p = path.join(dir, f.name)
    if (f.isDirectory()) scanEnv(p)
    else if (/\.(t|j)sx?$/.test(f.name)) {
      const txt = slurp(p)
      for (const m of txt.matchAll(/process\.env\.([A-Z0-9_]+)/g))
        envKeys.add(m[1])
    }
  }
}
scanEnv('.')
push('ENV KEYS (detected)', Array.from(envKeys).sort().join('\n'))

const sanityDir = fs.existsSync('sanity')
  ? 'sanity'
  : fs.existsSync('studio')
    ? 'studio'
    : null
if (sanityDir) {
  const schemaFiles = []
  const walk = (d) => {
    for (const f of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, f.name)
      if (f.isDirectory()) walk(p)
      else if (/\.(t|j)s$/.test(f.name)) schemaFiles.push(p)
    }
  }
  walk(sanityDir)
  push('SANITY SCHEMA FILES', schemaFiles.join('\n'))
  // Include contents of likely schema index
  for (const f of [
    'schema.ts',
    'schemas.ts',
    'schemas/index.ts',
    'schemaTypes/index.ts',
  ]) {
    const p = path.join(sanityDir, f)
    if (fs.existsSync(p)) push(`Sanity/${f}`, slurp(p))
  }
}

fs.writeFileSync('townesdev-snapshot.txt', OUT.join('\n'))
console.log('Wrote townesdev-snapshot.txt')
