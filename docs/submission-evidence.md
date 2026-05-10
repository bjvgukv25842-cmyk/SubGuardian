# SubGuardian Submission Evidence

## Project

- Project name: **SubGuardian**
- One-liner: **AI Agent spending firewall before autonomous payments**
- Recommended track: **Agentic Economy & Autonomous Applications**
- Purpose: pre-spend authorization for AI agents, API gateways, subscription systems, and payment systems.

## 0G Integration Status

| 0G component | Status | Evidence |
| --- | --- | --- |
| 0G Chain | **live** | Contract is deployed on 0G Mainnet. Explorer transactions are successful and point to the live contract. |
| 0G Storage | **mock/fallback in submitted demo** | Code supports live SDK upload through `@0glabs/0g-ts-sdk`; demo mode returns clearly labeled `0g-mock-*` storage roots. |
| 0G Compute | **mock/fallback in submitted demo** | Code supports live API calls and sends `verify_tee: true`; demo mode returns `mode: "mock"` and does not claim TEE verification. |

SubGuardian does not present mock Storage/Compute as live. The current live component is 0G Chain.

## Live 0G Chain Contract

- Contract address: `0xaC87E72e1aF91174EedaC91C08bF56768d6cE9fD`
- Explorer base: `https://chainscan.0g.ai`
- Contract Explorer link: [https://chainscan.0g.ai/address/0xaC87E72e1aF91174EedaC91C08bF56768d6cE9fD](https://chainscan.0g.ai/address/0xaC87E72e1aF91174EedaC91C08bF56768d6cE9fD)

## Verified Transactions

The Explorer URL format is:

- Contract: `https://chainscan.0g.ai/address/<address>`
- Transaction: `https://chainscan.0g.ai/tx/<hash>`

The following transactions were checked against `https://evmrpc.0g.ai` with `eth_getTransactionByHash` and `eth_getTransactionReceipt`.

| Transaction | Explorer | Block | To | Status | Logs |
| --- | --- | ---: | --- | --- | ---: |
| `0xdd0df16b1cc2261f0661930e604c26d6e21d8bb3fc7cbc4bf32bfb6b7f798dbc` | [open](https://chainscan.0g.ai/tx/0xdd0df16b1cc2261f0661930e604c26d6e21d8bb3fc7cbc4bf32bfb6b7f798dbc) | 32657250 | `0xac87e72e1af91174eedac91c08bf56768d6ce9fd` | success | 1 |
| `0x14e766169b6e63df9d2f3adb9ee252e3e7629f9485532a39e2101df2438a209e` | [open](https://chainscan.0g.ai/tx/0x14e766169b6e63df9d2f3adb9ee252e3e7629f9485532a39e2101df2438a209e) | 32740660 | `0xac87e72e1af91174eedac91c08bf56768d6ce9fd` | success | 1 |

Both transaction receipts returned `status: 0x1`, the `to` address matches the deployed contract, and each receipt includes an event log.

## Relevant Code

- Contract ABI/config: `lib/zeroG/chain.ts`
- Contract source: `contracts/SubscriptionPolicyRegistry.sol`
- Dashboard wallet write flow: `components/ChainPanel.tsx`
- Pre-spend authorization API: `app/api/v1/spend/authorize/route.ts`
- Proof page: `app/proof/[id]/page.tsx`
- Storage adapter: `lib/zeroG/storage.ts`
- Compute adapter: `lib/zeroG/compute.ts`
- Decision persistence helper: `lib/zeroG/decisionLog.ts`

## Important Chain Behavior

The API route `/api/v1/spend/authorize` returns a pre-spend decision proof. Its `chainTxHash` can be `null` because the API does not automatically write to the chain from the backend.

Live 0G Chain writes are completed through the dashboard wallet flow:

1. Connect wallet.
2. Upload encrypted profile or create a mock storage root.
3. Run analysis.
4. Use ChainPanel to call `addSubscription`, `recordAnalysis`, and `recordDecision`.
5. Open the returned 0G Explorer transaction link.

This separation is intentional: backend API proofs can be generated before payment, while chain writes require a user-authorized wallet transaction in the dashboard demo.

## Local Verification Commands

```bash
npm test
npm run build
```

PATH fallback:

```bash
node node_modules/hardhat/internal/cli/cli.js test
node test-policy-engine.cjs
node node_modules/next/dist/bin/next build
```

## Verification Results

Run on 2026-05-10 local workspace.

| Check | Command used | Result |
| --- | --- | --- |
| Hardhat contract tests | `node node_modules/hardhat/internal/cli/cli.js test` | Passed: 3 tests passing in `SubscriptionPolicyRegistry`. |
| Policy engine tests | `node test-policy-engine.cjs` | Passed: 5 checks covering idempotency, blocked service rejection, over-budget handling, low-usage high spend, and usage-ledger improvement. |
| Next.js production build | `node node_modules/next/dist/bin/next build` | Passed: compiled successfully, type check completed, 8 static pages generated. |

Note: the desktop shell tool returned `PermissionDenied` in this workspace, so tests were executed through the local Node runtime with explicit `node node_modules/...` entrypoints.

## Hackathon Submission Checklist

- [x] Project name and one-liner documented
- [x] Recommended track documented
- [x] Live 0G Chain contract address documented
- [x] 0G Explorer contract link documented
- [x] 0G Explorer transaction links documented
- [x] Live/mock boundaries documented
- [x] API proof fields documented
- [x] Demo script prepared
- [x] Social post prepared
- [ ] Demo video URL added after recording
- [ ] GitHub URL added after repository publication
- [ ] X post URL added after publishing
