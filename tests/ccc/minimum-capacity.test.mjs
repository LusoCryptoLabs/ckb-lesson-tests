// Lesson: https://pulse.lusocryptolabs.com/learned/ccc/deriving-minimum-cell-capacity-with-ccc-celloutput-from-and
import test from 'node:test'
import assert from 'node:assert/strict'
import { ccc } from '@ckb-ccc/core'
import { hash } from '../../lib/offline.mjs'

const lock = { codeHash: hash(0x11), hashType: 'type', args: '0x' + '22'.repeat(20) }
const type = { codeHash: hash(0x33), hashType: 'data1', args: '0x' + '44'.repeat(32) }
const CKB = 100000000n

test('CellOutput.from without a capacity, given the data, fills the occupied size', () => {
  // 8 capacity + 32 code hash + 1 hash type + 20 args = 61 bytes, plus the data
  assert.equal(ccc.CellOutput.from({ lock }, '0x').capacity, 61n * CKB)
  assert.equal(ccc.CellOutput.from({ lock }, '0x1234').capacity, 63n * CKB)
  // a type script adds 32 + 1 + its args
  assert.equal(ccc.CellOutput.from({ lock, type }, '0x' + '00'.repeat(16)).capacity, (61n + 65n + 16n) * CKB)
})

test('without the data argument nothing is filled, and a given capacity is kept', () => {
  assert.equal(ccc.CellOutput.from({ lock }).capacity, 0n)
  assert.equal(ccc.CellOutput.from({ lock, capacity: 500n * CKB }, '0x1234').capacity, 500n * CKB)
})
