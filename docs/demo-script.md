# SubGuardian 3-Minute Demo Script

Target length: 2:30 to 2:55.

## 0:00-0:20 Problem

"AI agents can now spend through wallets, API keys, usage-based billing, and subscriptions. The missing layer is pre-authorization: before an autonomous agent pays, something should check budget, usage, policy, and risk."

"SubGuardian is an AI Agent spending firewall before autonomous payments."

## 0:20-0:40 Product

Open the dashboard.

Say:

"This dashboard simulates an agent, API gateway, or payment system asking SubGuardian before spending. The API returns one of four decisions: `allow`, `pause`, `reject`, or `ask_user`."

Show the request form:

- agentId
- userWallet
- serviceName
- amount
- reason

## 0:40-1:15 Spend Authorization Request

Submit the default spend authorization request.

Show the result fields:

- `decisionId`
- `decision`
- `riskScore`
- `requiresUserApproval`
- `analysisHash`
- `storageRootHash`
- `mode`
- `proofUrl`

Say:

"This is a pre-spend decision proof. If the agent is over budget, has low usage, hits a manual approval threshold, or targets a blocked service, SubGuardian can pause, reject, or ask the user before money moves."

## 1:15-1:40 Proof Page

Open `proofUrl`.

Show:

- Decision ID
- Analysis hash
- Storage root hash
- Mode: `mock` or `0g_live`
- Chain transaction hash field

Say:

"The API proof is generated before payment. In this submitted demo, API `chainTxHash` may be null because the chain write is completed through the dashboard wallet flow, not automatically by the backend."

## 1:40-2:10 0G Chain Evidence

Open the 0G ChainScan contract:

`https://chainscan.0g.ai/address/0xaC87E72e1aF91174EedaC91C08bF56768d6cE9fD`

Show the contract address:

`0xaC87E72e1aF91174EedaC91C08bF56768d6cE9fD`

Open at least one transaction:

- `https://chainscan.0g.ai/tx/0xdd0df16b1cc2261f0661930e604c26d6e21d8bb3fc7cbc4bf32bfb6b7f798dbc`
- `https://chainscan.0g.ai/tx/0x14e766169b6e63df9d2f3adb9ee252e3e7629f9485532a39e2101df2438a209e`

Say:

"0G Chain is live. The contract is deployed on 0G Mainnet and these transactions succeeded with event logs."

## 2:10-2:35 Storage and Compute Status

Say clearly:

"Storage and Compute are honest mock fallback in this submission. The code supports live 0G Storage SDK upload and live 0G Compute API calls with `verify_tee: true`, but the public demo keeps credentials out of the repository and labels mock mode explicitly."

Show `mode` and `storageRootHash` in the UI.

## 2:35-2:55 Close

"SubGuardian gives autonomous agents a spending firewall: ask before spending, return an auditable decision, preserve encrypted decision memory, and record user-authorized decisions on 0G Chain."

"Recommended track: Agentic Economy & Autonomous Applications."
