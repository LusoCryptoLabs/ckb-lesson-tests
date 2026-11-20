// Lesson: https://pulse.lusocryptolabs.com/learned/ccc/use-jsonrpctransformers-transactionfrom-to-serialize-ccc-tra
import test from 'node:test'
import assert from 'node:assert/strict'
import { ccc } from '@ckb-ccc/core'
import { JsonRpcTransformers } from '@ckb-ccc/core/advanced'
import { OfflineClient, cellOf, hash } from '../../lib/offline.mjs'

const lock = { codeHash: hash(0x11), hashType: 'type', args: '0x' + '22'.repeat(20) }

test('ccc.stringify keeps the cached input fields, transactionFrom does not', async () => {
  const client = new OfflineClient([cellOf(lock, 500, 1)])
  const tx = ccc.Transaction.from({ inputs: [{ previousOutput: { txHash: hash(1), index: 0 } }], outputs: [{ lock, capacity: ccc.fixedPointFrom(499) }], outputsData: ['0x'], witnesses: ['0xbeef'] })
  await tx.inputs[0].completeExtraInfos(client)

  const plain = JSON.parse(ccc.stringify(tx))
  assert.deepEqual(Object.keys(plain.inputs[0]).sort(), ['cellOutput', 'outputData', 'previousOutput', 'since'])

  const rpc = JsonRpcTransformers.transactionFrom(tx)
  assert.deepEqual(Object.keys(rpc.inputs[0]).sort(), ['previous_output', 'since'])
  assert.deepEqual(Object.keys(rpc).sort(), ['cell_deps', 'header_deps', 'inputs', 'outputs', 'outputs_data', 'version', 'witnesses'])
  assert.equal(rpc.outputs[0].lock.code_hash, lock.codeHash)
  assert.deepEqual(rpc.witnesses, ['0xbeef'])
  // the same transaction comes back
  assert.equal(JsonRpcTransformers.transactionTo(rpc).hash(), tx.hash())
})
