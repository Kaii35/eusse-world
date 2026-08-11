/**
 * Verifica que no haya enlaces internos rotos en la documentación.
 *
 * Documentación desactualizada es peor que ninguna: hace perder tiempo y provoca
 * decisiones equivocadas con falsa confianza (skills/documentation.md).
 *
 * Puerta de CI. Uso: `pnpm check:docs`
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, normalize, relative, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const IGNORED_DIRS = new Set(['node_modules', '.git', '.next', '.turbo', 'dist', 'coverage'])

/** Enlaces markdown `[texto](destino)`, ignorando anclas y URLs absolutas. */
const LINK_PATTERN = /\[[^\]]*\]\(([^)\s]+?)(?:#[^)]*)?\)/g

type BrokenLink = { file: string; target: string; line: number }

function collectMarkdownFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (IGNORED_DIRS.has(entry)) continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) collectMarkdownFiles(full, acc)
    else if (entry.endsWith('.md')) acc.push(full)
  }
  return acc
}

function isExternal(target: string): boolean {
  return /^(https?:|mailto:|tel:)/.test(target)
}

function checkFile(file: string): { broken: BrokenLink[]; checked: number } {
  const broken: BrokenLink[] = []
  const lines = readFileSync(file, 'utf-8').split('\n')
  let checked = 0

  lines.forEach((line, index) => {
    for (const match of line.matchAll(LINK_PATTERN)) {
      const target = match[1]
      if (!target || isExternal(target)) continue

      checked += 1
      const cleaned = target.replace(/^`|`$/g, '')
      const resolved = normalize(join(dirname(file), cleaned))
      if (!existsSync(resolved)) {
        broken.push({ file: relative(ROOT, file), target, line: index + 1 })
      }
    }
  })

  return { broken, checked }
}

function main(): void {
  const files = collectMarkdownFiles(ROOT)
  const allBroken: BrokenLink[] = []
  let totalChecked = 0

  for (const file of files) {
    const { broken, checked } = checkFile(file)
    allBroken.push(...broken)
    totalChecked += checked
  }

  console.log(`Archivos Markdown analizados: ${files.length}`)
  console.log(`Enlaces internos verificados: ${totalChecked}`)

  if (allBroken.length === 0) {
    console.log('Enlaces rotos: 0')
    return
  }

  console.error(`\nEnlaces rotos: ${allBroken.length}\n`)
  for (const { file, target, line } of allBroken) {
    console.error(`  ${file}:${line}  ->  ${target}`)
  }
  process.exit(1)
}

main()
