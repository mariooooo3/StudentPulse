import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const REPLACEMENTS = [
  ['î', 'î'], ['Î', 'Î'], ['ă', 'ă'], ['Ă', 'Ă'], ['ș', 'ș'], ['Ș', 'Ș'],
  ['ț', 'ț'], ['Ț', 'Ț'], ['â', 'â'], ['Â', 'Â'], ['–', '–'], ['—', '—'],
  ['·', '·'], ['„', '„'], ['”', '”'], ['“', '“'], ['“', '“'],
]

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) {
      if (entry === 'node_modules' || entry === 'dist' || entry.startsWith('.')) continue
      walk(full, out)
    } else if (/\.(js|jsx|mjs|ts|tsx|json|md)$/.test(entry)) {
      out.push(full)
    }
  }
  return out
}

const FILES = [...walk('src'), ...walk('server'), ...walk('scripts')]

for (const file of FILES) {
  let text = readFileSync(file, 'utf8')
  let changed = false
  for (const [bad, good] of REPLACEMENTS) {
    if (text.includes(bad)) {
      text = text.split(bad).join(good)
      changed = true
    }
  }
  if (changed) writeFileSync(file, text, 'utf8')
}

console.log(`Encoding normalization scanned ${FILES.length} files.`)
