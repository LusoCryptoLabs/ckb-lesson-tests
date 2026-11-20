# ckb-lesson-tests

Tests that reproduce lessons from [CKB Pulse](https://pulse.lusocryptolabs.com/learned).

A lesson on Pulse comes from a fix in a CKB project and links to its commit. A test here goes one step further: it runs the behaviour the lesson describes against a pinned version of the library, with no node and no network. If it passes, anyone can see the lesson hold. If it stops passing on a new release, the lesson may be out of date.

## Run

```
npm ci
npm test
```

Node 22 or newer. The run takes about a second.

## What is covered

`lessons.json` lists each lesson and its test. `covers` says whether the test reproduces the whole lesson or a named part of it.

| Lesson | Test |
|---|---|
| [Deriving minimum cell capacity with CellOutput.from](https://pulse.lusocryptolabs.com/learned/ccc/deriving-minimum-cell-capacity-with-ccc-celloutput-from-and) | `tests/ccc/minimum-capacity.test.mjs` |
| [Hand-rolled Script hash: hash_type bytes and molecule offsets](https://pulse.lusocryptolabs.com/learned/ccc/hand-rolled-script-hash-hash-type-byte-mapping-and-molecule) | `tests/ccc/script-hash.test.mjs` |
| [Parsing snake_case JSON-RPC transactions](https://pulse.lusocryptolabs.com/learned/ccc/parsing-snake-case-json-rpc-transactions-in-ccc) | `tests/ccc/snake-case-transaction.test.mjs` |
| [Serialising a transaction for a native RPC](https://pulse.lusocryptolabs.com/learned/ccc/use-jsonrpctransformers-transactionfrom-to-serialize-ccc-tra) | `tests/ccc/serialize-for-rpc.test.mjs` |
| [Fiber snake_case scripts are not a ScriptLike](https://pulse.lusocryptolabs.com/learned/ccc/convert-fiber-rpc-snake-case-scripts-to-ccc-camelcase-script) | `tests/ccc/fiber-snake-case-script.test.mjs` |
| [Transaction size for the fee rate is the bytes plus 4](https://pulse.lusocryptolabs.com/learned/ccc/transaction-size-for-fee-rate-is-serialized-bytes-plus-4) (part) | `tests/ccc/transaction-size.test.mjs` |
| [Pass a config object, not a URL string, to the client](https://pulse.lusocryptolabs.com/learned/ccc/pass-a-config-object-not-a-url-string-to-ccc-clientpublictes) | `tests/ccc/client-config-object.test.mjs` |
| [completeFeeBy adds change instead of shrinking outputs](https://pulse.lusocryptolabs.com/learned/ccc/completefeeby-adds-change-instead-of-shrinking-outputs-break) (part) | `tests/ccc/complete-fee-by-adds-change.test.mjs` |
| [Zero the witness lock again before recomputing the sign message](https://pulse.lusocryptolabs.com/learned/ccc/re-zero-the-witness-lock-before-recomputing-the-sign-message) | `tests/ccc/rezero-witness-before-verifying.test.mjs` |
| [Locate the signing witness slot](https://pulse.lusocryptolabs.com/learned/ccc/locate-the-signing-witness-slot-instead-of-hardcoding-its-in) (part) | `tests/ccc/signing-witness-position.test.mjs` |
| [Reserve co-signer witness space before completeFeeBy](https://pulse.lusocryptolabs.com/learned/ccc/reserve-co-signer-witness-space-before-completefeeby-in-mult) | `tests/ccc/cosigner-witness-before-fee.test.mjs` |
| [Custom client scripts must include AnyoneCanPay](https://pulse.lusocryptolabs.com/learned/ccc/ccc-custom-client-scripts-must-include-anyonecanpay-for-sign) | `tests/ccc/custom-scripts-need-anyone-can-pay.test.mjs` |

## How a test is written

- It starts with the address of its lesson.
- It shows both sides: the mistake the lesson warns about, and the way that works.
- It uses `lib/offline.mjs`, a CCC client that serves the cells it is given and fails on any call that would reach a node.
- It is listed in `lessons.json`.

## Versions

The library version in `package.json` is exact. `ci` runs on every pull request with that version. `latest` runs every Monday with the newest release.

A red `latest` run is a signal to read, not a verdict: the lesson may be out of date, or the test may lean on something that moved. Measured on 2026-11-20 with the tests written for 1.23.1: 15 of 17 pass on 1.12.2, 10 of 17 on 1.5.0.

## Limits

- Only lessons about library behaviour are here. Lessons about on-chain scripts, the node and the indexer need other tools and are not covered yet.
- A passing test shows the behaviour at the pinned version. It does not show that the lesson is good advice for your case. Read the lesson and its source.

## Contributing

A test for a lesson that has none is welcome, and so is a correction. Open a pull request, or an issue if a test and its lesson disagree.

MIT.
