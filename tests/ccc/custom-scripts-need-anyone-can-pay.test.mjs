// Lesson: https://pulse.lusocryptolabs.com/learned/ccc/ccc-custom-client-scripts-must-include-anyonecanpay-for-sign
import test from 'node:test'
import assert from 'node:assert/strict'
import { ccc } from '@ckb-ccc/core'
import { OfflineClient, KEY } from '../../lib/offline.mjs'

test('a client whose scripts map has only Secp256k1Blake160 cannot serve SignerCkbPrivateKey', async () => {
  const known = new OfflineClient()
  const secp = await known.getKnownScript(ccc.KnownScript.Secp256k1Blake160)
  const acp = await known.getKnownScript(ccc.KnownScript.AnyoneCanPay)

  const only = new OfflineClient([], { [ccc.KnownScript.Secp256k1Blake160]: secp })
  await assert.rejects(new ccc.SignerCkbPrivateKey(only, KEY).getAddressObjs(), /AnyoneCanPay/)

  // with the AnyoneCanPay entry added it works, though no such cell is used
  const both = new OfflineClient([], { [ccc.KnownScript.Secp256k1Blake160]: secp, [ccc.KnownScript.AnyoneCanPay]: acp })
  const addresses = await new ccc.SignerCkbPrivateKey(both, KEY).getAddressObjs()
  assert.ok(addresses.length >= 1)
  assert.equal(addresses[0].script.codeHash, secp.codeHash)
})
