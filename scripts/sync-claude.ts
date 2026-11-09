/**
 * Genera `.claude/agents` y `.claude/skills` a partir de las carpetas raíz `agents/` y
 * `skills/`, que son la fuente de verdad (scripts/README.md, «Sincronización con Claude Code»).
 *
 * - `agents/NN-<name>.md`  →  `.claude/agents/<name>.md`
 * - `skills/<name>.md`     →  `.claude/skills/<name>/SKILL.md`
 *
 * Los enlaces relativos se reescriben para que sigan apuntando a los mismos archivos desde la
 * nueva profundidad. Lo que ya no existe en origen se elimina: ejecutarlo dos veces no cambia
 * nada.
 *
 * Uso: `pnpm sync:claude` (escribe) · `pnpm sync:claude --check` (sólo compara; puerta de CI)
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  rmdirSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const CLAUDE_DIR = join(ROOT, '.claude')
const MANAGED_DIRS = ['agents', 'skills'] as const

const KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const FRONTMATTER = /^---\n([\s\S]*?)\n---\n/
/** Enlaces markdown `[texto](destino)`; el destino puede ir entre comillas invertidas. */
const LINK_PATTERN = /\]\((`?)([^)\s`]+)(`?)\)/g

const README_CONTENT: Record<(typeof MANAGED_DIRS)[number], string> = {
  agents: `# .claude/agents

**Generado automáticamente desde \`/agents\` con \`pnpm sync:claude\`.**

No editar a mano: se sobrescribe. La fuente de verdad es [\`agents/\`](../../agents/).
`,
  skills: `# .claude/skills

**Generado automáticamente desde \`/skills\` con \`pnpm sync:claude\`.**

No editar a mano: se sobrescribe. La fuente de verdad es [\`skills/\`](../../skills/).
`,
}

type Kind = (typeof MANAGED_DIRS)[number]
type Frontmatter = { name: string; description: string }
type Diff = { path: string; change: 'nuevo' | 'modificado' | 'sobrante' }

function toPosix(path: string): string {
  return path.split(sep).join('/')
}

function readNormalized(file: string): string {
  return readFileSync(file, 'utf-8').replace(/\r\n/g, '\n')
}

function parseFrontmatter(content: string): Partial<Frontmatter> | null {
  const match = FRONTMATTER.exec(content)
  if (!match?.[1]) return null

  const fields: Record<string, string> = {}
  for (const line of match[1].split('\n')) {
    const separator = line.indexOf(':')
    if (separator <= 0) continue
    const key = line.slice(0, separator).trim()
    const value = line
      .slice(separator + 1)
      .trim()
      .replace(/^(['"])(.*)\1$/, '$2')
    fields[key] = value
  }
  return { name: fields.name, description: fields.description }
}

/** Nombre que debe declarar el archivo: el de las skills es el archivo; el de los agentes, sin `NN-`. */
function expectedName(kind: Kind, fileName: string): string {
  const base = fileName.replace(/\.md$/, '')
  return kind === 'agents' ? base.replace(/^\d+-/, '') : base
}

function validate(kind: Kind, fileName: string, content: string): Frontmatter | string {
  const frontmatter = parseFrontmatter(content)
  if (!frontmatter) return 'sin frontmatter YAML (bloque `---` al inicio del archivo)'

  const { name, description } = frontmatter
  if (!name) return 'falta `name` o está vacío'
  if (!description) return 'falta `description` o está vacía'
  if (!KEBAB_CASE.test(name)) return `\`name: ${name}\` no está en kebab-case`

  const expected = expectedName(kind, fileName)
  if (name !== expected)
    return `\`name: ${name}\` no coincide con el archivo (se esperaba \`${expected}\`)`

  return { name, description }
}

function isRewritable(target: string): boolean {
  return !/^(?:[a-z][a-z0-9+.-]*:|#|\/)/i.test(target)
}

/** Reescribe los enlaces relativos para que resuelvan al mismo archivo desde `targetFile`. */
function rewriteLinks(content: string, sourceFile: string, targetFile: string): string {
  return content.replace(LINK_PATTERN, (whole, open: string, target: string, close: string) => {
    if (!isRewritable(target)) return whole

    const anchorAt = target.indexOf('#')
    const path = anchorAt === -1 ? target : target.slice(0, anchorAt)
    const anchor = anchorAt === -1 ? '' : target.slice(anchorAt)
    const absolute = resolve(dirname(sourceFile), path)
    const trailingSlash = path.endsWith('/') ? '/' : ''
    const rewritten = toPosix(relative(dirname(targetFile), absolute)) + trailingSlash

    return `](${open}${rewritten}${anchor}${close})`
  })
}

function generatedNotice(sourceFile: string): string {
  const source = toPosix(relative(ROOT, sourceFile))
  return `<!-- Generado desde ${source} con \`pnpm sync:claude\`. No editar a mano. -->\n\n`
}

function buildExpected(): {
  files: Map<string, string>
  errors: string[]
  counts: Record<Kind, number>
} {
  const files = new Map<string, string>()
  const errors: string[] = []
  const counts: Record<Kind, number> = { agents: 0, skills: 0 }

  for (const kind of MANAGED_DIRS) {
    const sourceDir = join(ROOT, kind)
    const seen = new Map<string, string>()
    files.set(`${kind}/README.md`, README_CONTENT[kind])

    for (const fileName of readdirSync(sourceDir).sort()) {
      if (!fileName.endsWith('.md') || fileName === 'README.md') continue

      const sourceFile = join(sourceDir, fileName)
      const sourceLabel = `${kind}/${fileName}`
      const content = readNormalized(sourceFile)
      const result = validate(kind, fileName, content)
      if (typeof result === 'string') {
        errors.push(`${sourceLabel}: ${result}`)
        continue
      }

      const duplicate = seen.get(result.name)
      if (duplicate) {
        errors.push(`${sourceLabel}: \`name: ${result.name}\` repetido (ya lo usa ${duplicate})`)
        continue
      }
      seen.set(result.name, sourceLabel)

      const target =
        kind === 'agents' ? `agents/${result.name}.md` : `skills/${result.name}/SKILL.md`
      const targetFile = join(CLAUDE_DIR, target)
      const [frontmatter = ''] = FRONTMATTER.exec(content) ?? []
      const body = content.slice(frontmatter.length).replace(/^\n+/, '')

      files.set(
        target,
        `${frontmatter}\n${generatedNotice(sourceFile)}${rewriteLinks(body, sourceFile, targetFile)}`,
      )
      counts[kind] += 1
    }
  }

  return { files, errors, counts }
}

function listExisting(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) listExisting(full, acc)
    else acc.push(toPosix(relative(CLAUDE_DIR, full)))
  }
  return acc
}

function computeDiffs(expected: Map<string, string>): Diff[] {
  const existing = MANAGED_DIRS.flatMap((kind) => listExisting(join(CLAUDE_DIR, kind)))
  const diffs: Diff[] = []

  for (const [path, content] of expected) {
    const full = join(CLAUDE_DIR, path)
    if (!existsSync(full)) diffs.push({ path, change: 'nuevo' })
    else if (readNormalized(full) !== content) diffs.push({ path, change: 'modificado' })
  }
  for (const path of existing) {
    if (!expected.has(path)) diffs.push({ path, change: 'sobrante' })
  }

  return diffs.sort((a, b) => a.path.localeCompare(b.path))
}

/** Borra los directorios que hayan quedado vacíos tras eliminar archivos sobrantes. */
function removeEmptyDirs(dir: string): void {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (!statSync(full).isDirectory()) continue
    removeEmptyDirs(full)
    if (readdirSync(full).length === 0) rmdirSync(full)
  }
}

function apply(expected: Map<string, string>, diffs: Diff[]): void {
  for (const { path, change } of diffs) {
    const full = join(CLAUDE_DIR, path)
    if (change === 'sobrante') {
      rmSync(full)
      continue
    }
    mkdirSync(dirname(full), { recursive: true })
    writeFileSync(full, expected.get(path) ?? '', 'utf-8')
  }
  for (const kind of MANAGED_DIRS) removeEmptyDirs(join(CLAUDE_DIR, kind))
}

function main(): void {
  const checkOnly = process.argv.includes('--check')
  const { files, errors, counts } = buildExpected()

  if (errors.length > 0) {
    console.error(`Frontmatter inválido en ${errors.length} archivo(s):\n`)
    for (const error of errors) console.error(`  ${error}`)
    console.error('\nCada archivo necesita `name` (kebab-case) y `description` no vacíos.')
    process.exit(1)
  }

  const diffs = computeDiffs(files)
  console.log(`Agentes: ${counts.agents} · Skills: ${counts.skills}`)

  if (diffs.length === 0) {
    console.log('.claude/agents y .claude/skills están sincronizados.')
    return
  }

  const listing = diffs.map(({ path, change }) => `  ${change.padEnd(10)}  .claude/${path}`)

  if (checkOnly) {
    console.error(`\n.claude/ no está sincronizado: ${diffs.length} diferencia(s)\n`)
    console.error(listing.join('\n'))
    console.error('\nEjecuta `pnpm sync:claude` y añade el resultado al commit.')
    process.exit(1)
  }

  apply(files, diffs)
  console.log(`\nCambios aplicados: ${diffs.length}\n`)
  console.log(listing.join('\n'))
}

main()
