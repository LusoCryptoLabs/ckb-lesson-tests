// Lesson: https://pulse.lusocryptolabs.com/learned/ccc/convert-fiber-rpc-snake-case-scripts-to-ccc-camelcase-script
import test from 'node:test'
import assert from 'node:assert/strict'
import { ccc } from '@ckb-ccc/core'
import { hash } from '../../lib/offline.mjs'

// the shape the Fiber RPC returns
const to = { code_hash: hash(0x11), hash_type: 'type', args: '0x' + '22'.repeat(20) }

test('a snake_case script is not a ScriptLike', () => {
  assert.throws(() => ccc.Script.from(to))
  assert.throws(() => ccc.Transaction.from({ outputs: [{ lock: to, capacity: 1n }], outputsData: ['0x'] }))
})

test('mapped field by field, it is', () => {
  const script = ccc.Script.from({ codeHash: to.code_hash, hashType: to.hash_type, args: to.args })
  assert.deepEqual([script.codeHash, script.hashType, script.args], [to.code_hash, 'type', to.args])
})
