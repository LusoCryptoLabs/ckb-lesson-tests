// Lesson: https://pulse.lusocryptolabs.com/learned/ccc/completefeeby-adds-change-instead-of-shrinking-outputs-break
import test from 'node:test'
import assert from 'node:assert/strict'
import { ccc } from '@ckb-ccc/core'
import { OfflineClient, KEY, cellOf, hash } from '../../lib/offline.mjs'

const bound = { codeHash: hash(0x77), hashType: 'type', args: '0x' }

test('completeFeeBy pays the fee from more inputs and a change output: output 0 keeps its capacity', async () => {
  const lock = (await new ccc.SignerCkbPrivateKey(new OfflineClient(), KEY).getRecommendedAddressObj()).script
  const client = new OfflineClient([cellOf(lock, 500, 1), cellOf(lock, 300, 2)])
  const signer = new ccc.SignerCkbPrivateKey(client, KEY)
  // one input of 500 CKB, one output of the same 500 CKB: nothing is left for the fee
  const tx = ccc.Transaction.from({ inputs: [{ previousOutput: { txHash: hash(1), index: 0 } }], outputs: [{ lock: bound, capacity: ccc.fixedPointFrom(500) }], outputsData: ['0x'] })
  await tx.completeFeeBy(signer, 1000)

  assert.equal(tx.outputs[0].capacity, ccc.fixedPointFrom(500), 'output 0 is not shrunk')
  assert.equal(tx.inputs.length, 2, 'a second cell of the signer was pulled in')
  assert.equal(tx.outputs.length, 2, 'a change output was added')
  assert.ok(tx.outputs[1].lock.eq(lock), 'the change goes back to the signer')
  const fee = await tx.getFee(client)
  assert.equal(fee, tx.estimateFee(1000))
  // so the fee did not come out of output 0: a proof that assumed input minus fee no longer matches
  assert.notEqual(tx.outputs[0].capacity, ccc.fixedPointFrom(500) - fee)
})
