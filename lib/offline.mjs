// A CCC client that never touches the network. It knows the testnet scripts (they are built in) and serves the
// live cells it is given, so the library's own transaction code runs as it would against a node.
import { ccc } from '@ckb-ccc/core'

export class OfflineClient extends ccc.ClientPublicTestnet {
  /** `scripts` replaces the built-in map of known scripts, as on a devnet. */
  constructor(cells = [], scripts) {
    super({ url: 'http://offline.invalid', ...(scripts ? { scripts } : {}) })
    this.live = cells.map((c) => ccc.Cell.from(c))
    // CCC sets its RPC methods on the instance, so they are replaced here and not on the class.
    // Any call left over fails loudly instead of reaching a node.
    this.requestor.request = async (method) => {
      throw new Error(`offline: ${method} would reach a node`)
    }
    this.findCellsPagedNoCache = async (key) => {
      const k = ccc.ClientIndexerSearchKey.from(key)
      const cells = this.live.filter((c) => (k.scriptType === 'lock' ? c.cellOutput.lock : c.cellOutput.type)?.eq(k.script))
      return { cells, lastCursor: '0x' }
    }
    this.getFeeRateStatistics = async () => ({ mean: 1000n, median: 1000n })
  }
  async getCell(outPoint) {
    const o = ccc.OutPoint.from(outPoint)
    return this.live.find((c) => c.outPoint.eq(o))
  }
  async getCellLive(outPoint) {
    return this.getCell(outPoint)
  }
}

export const KEY = '0x' + '11'.repeat(32)
export const KEY2 = '0x' + '22'.repeat(32)
export const hash = (n) => '0x' + n.toString(16).padStart(2, '0').repeat(32)

/** A live cell of `ckb` CKB under `lock`. */
export const cellOf = (lock, ckb, n, data = '0x') => ({ outPoint: { txHash: hash(n), index: 0 }, cellOutput: { capacity: ccc.fixedPointFrom(ckb), lock }, outputData: data })
