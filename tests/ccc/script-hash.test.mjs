// Lesson: https://pulse.lusocryptolabs.com/learned/ccc/hand-rolled-script-hash-hash-type-byte-mapping-and-molecule
import test from 'node:test'
import assert from 'node:assert/strict'
import { ccc } from '@ckb-ccc/core'
import { hash } from '../../lib/offline.mjs'

/** A Script serialised by hand: a 16 byte header (total size, then the offsets 16, 48 and 49), then the fields. */
function scriptBytes(script, byteOf) {
  const args = ccc.bytesFrom(script.args)
  const out = new Uint8Array(16 + 32 + 1 + 4 + args.length)
  const view = new DataView(out.buffer)
  view.setUint32(0, out.length, true)
  view.setUint32(4, 16, true)
  view.setUint32(8, 48, true)
  view.setUint32(12, 49, true)
  out.set(ccc.bytesFrom(script.codeHash), 16)
  out[48] = byteOf[script.hashType]
  view.setUint32(49, args.length, true)
  out.set(args, 53)
  return out
}

const RIGHT = { data: 0, type: 1, data1: 2, data2: 4 }
const scripts = Object.keys(RIGHT).map((hashType) => ({ codeHash: hash(0x5a), hashType, args: '0x' + 'ab'.repeat(20) }))

test('the hand-rolled bytes and hash match CCC for all four hash types', () => {
  for (const s of scripts) {
    assert.equal(ccc.hexFrom(scriptBytes(s, RIGHT)), ccc.hexFrom(ccc.Script.from(s).toBytes()), s.hashType)
    assert.equal(ccc.hashCkb(scriptBytes(s, RIGHT)), ccc.Script.from(s).hash(), s.hashType)
  }
})

test('data2 mapped to 3 gives another hash', () => {
  const s = scripts.find((x) => x.hashType === 'data2')
  assert.notEqual(ccc.hashCkb(scriptBytes(s, { ...RIGHT, data2: 3 })), ccc.Script.from(s).hash())
})
