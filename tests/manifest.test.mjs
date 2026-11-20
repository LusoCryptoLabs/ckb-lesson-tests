// The list in lessons.json is what CKB Pulse reads: every test is listed once, and every listed test exists and names its lesson.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

const root = new URL('../', import.meta.url)
const { lessons } = JSON.parse(fs.readFileSync(new URL('lessons.json', root), 'utf8'))
const pkg = JSON.parse(fs.readFileSync(new URL('package.json', root), 'utf8'))

test('every listed test exists and links its lesson', () => {
  for (const l of lessons) {
    const text = fs.readFileSync(new URL(l.test, root), 'utf8')
    assert.ok(text.startsWith(`// Lesson: https://pulse.lusocryptolabs.com/learned/${l.lesson}\n`), l.test)
    assert.ok(pkg.dependencies[l.library], `${l.library} is pinned in package.json`)
    assert.ok(l.covers === 'all' || l.covers.startsWith('part: '), l.lesson)
  }
  assert.equal(new Set(lessons.map((l) => l.lesson)).size, lessons.length)
})

test('every test file is listed', () => {
  const listed = new Set(lessons.map((l) => l.test))
  for (const dir of fs.readdirSync(new URL('tests/', root), { withFileTypes: true }).filter((d) => d.isDirectory())) {
    for (const f of fs.readdirSync(new URL(`tests/${dir.name}/`, root))) assert.ok(listed.has(`tests/${dir.name}/${f}`), f)
  }
})

test('library versions are exact', () => {
  for (const [name, v] of Object.entries(pkg.dependencies)) assert.match(v, /^[0-9]+[.][0-9]+[.][0-9]+$/, name)
})
