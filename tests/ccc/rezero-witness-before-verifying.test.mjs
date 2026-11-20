// Lesson: https://pulse.lusocryptolabs.com/learned/ccc/re-zero-the-witness-lock-before-recomputing-the-sign-message
import test from 'node:test'
import assert from 'node:assert/strict'
import { ccc } from '@ckb-ccc/core'
import { OfflineClient, KEY, cellOf, hash } from '../../lib/offline.mjs'

const LEN = 65

test('getSignHashInfo hashes the witness as it is: the signed message comes back only with the lock zeroed again', async () => {
  const lock = (await new ccc.SignerCkbPrivateKey(new OfflineClient(), KEY).getRecommendedAddressObj()).script
  const client = new OfflineClient([cellOf(lock, 500, 1)])
  const signer = new ccc.SignerCkbPrivateKey(client, KEY)
  const tx = ccc.Transaction.from({ inputs: [{ previousOutput: { txHash: hash(1), index: 0 } }], outputs: [{ lock, capacity: ccc.fixedPointFrom(499) }], outputsData: ['0x'] })
  await tx.prepareSighashAllWitness(lock, LEN, client)
  const { message } = await tx.getSignHashInfo(lock, client)

  const signed = await signer.signOnlyTransaction(tx.clone())
  const signature = ccc.WitnessArgs.fromBytes(signed.witnesses[0]).lock
  assert.equal(ccc.bytesFrom(signature).length, LEN)

  // on the signed transaction the message is another one
  const after = (await signed.getSignHashInfo(lock, client)).message
  assert.notEqual(after, message)
  assert.notEqual(ccc.recoverMessageSecp256k1(after, signature), signer.publicKey)

  // with the lock back to the placeholder of the same length, it is the signed message
  const verify = signed.clone()
  verify.setWitnessArgs(0, { lock: ccc.hexFrom(new Uint8Array(LEN)) })
  const again = (await verify.getSignHashInfo(lock, client)).message
  assert.equal(again, message)
  assert.equal(ccc.recoverMessageSecp256k1(again, signature), signer.publicKey)
})
