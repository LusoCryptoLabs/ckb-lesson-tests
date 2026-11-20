// Lesson: https://pulse.lusocryptolabs.com/learned/ccc/reserve-co-signer-witness-space-before-completefeeby-in-mult
import test from 'node:test'
import assert from 'node:assert/strict'
import { ccc } from '@ckb-ccc/core'
import { OfflineClient, KEY, KEY2, cellOf, hash } from '../../lib/offline.mjs'

const RATE = 1000

test('without the co-signer witness reserved, completeFeeBy leaves a fee that is short once they sign', async () => {
  const payerLock = (await new ccc.SignerCkbPrivateKey(new OfflineClient(), KEY).getRecommendedAddressObj()).script
  const coLock = (await new ccc.SignerCkbPrivateKey(new OfflineClient(), KEY2).getRecommendedAddressObj()).script
  const cells = [cellOf(payerLock, 500, 1), cellOf(coLock, 400, 3)]
  const build = async (reserve) => {
    const client = new OfflineClient(cells)
    const payer = new ccc.SignerCkbPrivateKey(client, KEY), co = new ccc.SignerCkbPrivateKey(client, KEY2)
    const tx = ccc.Transaction.from({ inputs: [{ previousOutput: { txHash: hash(1), index: 0 } }, { previousOutput: { txHash: hash(3), index: 0 } }], outputs: [{ lock: coLock, capacity: ccc.fixedPointFrom(300) }], outputsData: ['0x'] })
    if (reserve) await tx.prepareSighashAllWitness(coLock, 65, client)
    await tx.completeFeeBy(payer, RATE)
    const paid = await tx.getFee(client)
    // signTransaction signs and returns; it does not send
    const signed = await co.signTransaction(await payer.signTransaction(tx))
    assert.equal(signed.witnesses.length, 2, 'both have signed')
    return { paid, needed: signed.estimateFee(RATE) }
  }

  const short = await build(false)
  assert.ok(short.paid < short.needed, `paid ${short.paid}, the signed transaction needs ${short.needed}`)

  const right = await build(true)
  assert.equal(right.paid, right.needed)
})
