// Lesson: https://pulse.lusocryptolabs.com/learned/ccc/parsing-snake-case-json-rpc-transactions-in-ccc
import test from 'node:test'
import assert from 'node:assert/strict'
import { ccc } from '@ckb-ccc/core'
import { JsonRpcTransformers } from '@ckb-ccc/core/advanced'
import { hash } from '../../lib/offline.mjs'

const lock = { code_hash: hash(0x11), hash_type: 'type', args: '0x' + '22'.repeat(20) }
// the shape a node and ckb-cli write
const rpc = {
  version: '0x0',
  cell_deps: [{ out_point: { tx_hash: hash(0xaa), index: '0x0' }, dep_type: 'dep_group' }],
  header_deps: [hash(0xcc)],
  inputs: [{ previous_output: { tx_hash: hash(0xbb), index: '0x1' }, since: '0x0' }],
  outputs: [{ capacity: '0x174876e800', lock, type: null }],
  outputs_data: ['0x1234'],
  witnesses: ['0x'],
}

test('transactionTo reads a snake_case transaction', () => {
  const tx = JsonRpcTransformers.transactionTo(rpc)
  assert.deepEqual([tx.cellDeps.length, tx.headerDeps.length, tx.inputs.length, tx.outputs.length, tx.outputsData[0]], [1, 1, 1, 1, '0x1234'])
  assert.equal(tx.cellDeps[0].depType, 'depGroup')
  assert.equal(tx.outputs[0].capacity, 100000000000n)
})

test('Transaction.from does not read the snake_case fields', () => {
  // with no output to trip on, the cell deps, header deps and data are dropped without an error
  const tx = ccc.Transaction.from({ ...rpc, inputs: [], outputs: [] })
  assert.deepEqual([tx.cellDeps.length, tx.headerDeps.length, tx.outputsData.length], [0, 0, 0])
  // with the whole transaction it throws on the first snake_case object it meets
  assert.throws(() => ccc.Transaction.from(rpc))
})
