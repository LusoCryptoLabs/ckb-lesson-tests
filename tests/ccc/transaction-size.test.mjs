// Lesson: https://pulse.lusocryptolabs.com/learned/ccc/transaction-size-for-fee-rate-is-serialized-bytes-plus-4
// Covers the size rule as CCC applies it. The node's own count, and weight by cycles, are not reproduced here.
import test from 'node:test'
import assert from 'node:assert/strict'
import { ccc } from '@ckb-ccc/core'
import { hash } from '../../lib/offline.mjs'

const lock = { codeHash: hash(0x11), hashType: 'type', args: '0x' + '22'.repeat(20) }

test('CCC charges the fee on the serialised bytes plus 4', () => {
  const tx = ccc.Transaction.from({ inputs: [{ previousOutput: { txHash: hash(1), index: 0 } }], outputs: [{ lock, capacity: ccc.fixedPointFrom(100) }], outputsData: ['0x'], witnesses: ['0x' + '00'.repeat(85)] })
  const size = tx.toBytes().length + 4
  // at 1000 shannons per 1000 bytes the fee is the size
  assert.equal(tx.estimateFee(1000), BigInt(size))
  assert.equal(tx.estimateFee(3000), BigInt(size * 3))
  // the witnesses count
  const bare = tx.clone()
  bare.witnesses = []
  assert.ok(bare.toBytes().length < tx.toBytes().length)
})
