// Lesson: https://pulse.lusocryptolabs.com/learned/ccc/pass-a-config-object-not-a-url-string-to-ccc-clientpublictes
import test from 'node:test'
import assert from 'node:assert/strict'
import { ccc } from '@ckb-ccc/core'

const URL = 'http://my-node.invalid:8114'

test('a bare string is ignored: the client keeps the public endpoint', () => {
  const client = new ccc.ClientPublicTestnet(URL)
  assert.notEqual(client.url, URL)
  assert.equal(client.url, new ccc.ClientPublicTestnet().url)
})

test('the object form sets the endpoint', () => {
  assert.equal(new ccc.ClientPublicTestnet({ url: URL }).url, URL)
  assert.equal(new ccc.ClientPublicMainnet({ url: URL }).url, URL)
})
