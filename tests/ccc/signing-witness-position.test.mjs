// Lesson: https://pulse.lusocryptolabs.com/learned/ccc/locate-the-signing-witness-slot-instead-of-hardcoding-its-in
// Covers where CCC puts a lock group's witness. The advice for wallets and mocks with no lock at hand is not reproduced here.
import test from 'node:test'
import assert from 'node:assert/strict'
import { ccc } from '@ckb-ccc/core'
import { OfflineClient, KEY, KEY2, cellOf, hash } from '../../lib/offline.mjs'

const lockOf = async (key) => (await new ccc.SignerCkbPrivateKey(new OfflineClient(), key).getRecommendedAddressObj()).script
const input = (n) => ({ previousOutput: { txHash: hash(n), index: 0 } })

test('the signing witness of a lock sits at its first input, so it moves with the shape of the transaction', async () => {
  const mine = await lockOf(KEY), other = await lockOf(KEY2)
  const client = new OfflineClient([cellOf(mine, 500, 1), cellOf(mine, 300, 2), cellOf(other, 400, 3)])
  const position = async (inputs) => {
    const tx = ccc.Transaction.from({ inputs, outputs: [], outputsData: [] })
    await tx.prepareSighashAllWitness(mine, 65, client)
    const at = (await tx.getSignHashInfo(mine, client)).position
    // the placeholder was written in that slot and nowhere else
    assert.deepEqual(tx.witnesses.map((w, i) => (w !== '0x' ? i : -1)).filter((i) => i >= 0), [at])
    return at
  }
  assert.equal(await position([input(1), input(3)]), 0)
  assert.equal(await position([input(3), input(1)]), 1)
  assert.equal(await position([input(3), input(2), input(1)]), 1)
})
