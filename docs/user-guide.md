# User Guide

## Login

1. Visit `/`.
2. Click Connect Wallet.
3. Sign the SubGuardian login message.
4. Open `/dashboard`.

The signature creates a session only. It does not approve spending or grant custody.

## Dashboard

The dashboard shows:

- Wallet overview.
- Active spending policies.
- Detected subscriptions and recurring approvals.
- Pending spend requests.
- Recent decisions.
- Risk alerts.
- Monthly spend summary.
- 0G proof and audit records.

## Policy Management

Open `/dashboard/policies` to configure:

- Monthly budget.
- Single spend maximum.
- Auto-allow whitelist.
- Block blacklist.
- Unknown service default action.
- Manual approval threshold.
- Daily, weekly, and monthly limits.
- Emergency pause all spending.

Agent-specific and merchant-specific rules are supported in the policy object and evaluated by the API. The first UI exposes global controls.

## Wallet Scanning

Open `/dashboard/wallet` and click Scan wallet.

SubGuardian reads real RPC data when available and clearly labels limited fallback data. It never asks for or stores private keys.

## Subscriptions

Open `/dashboard/subscriptions` to review detected recurring approvals. Mark each item:

- `trusted`
- `paused`
- `blocked`
- `needs_approval`

## Pending Approvals

When a merchant or agent request returns `ask_user`, it appears under `/dashboard/approvals`. Approve or reject it there. Integrated merchants should poll the decision status again before spending.

## Revokes

High-risk approvals include revoke guidance. Any revoke transaction must be signed by your wallet. SubGuardian cannot sign it for you.

## Proofs

Proof pages show:

- Decision hash / analysis hash.
- Storage root.
- Policy hash.
- Optional 0G Chain txHash.
- Explorer link when a txHash exists.
- Signer wallet.
- TEE verification / trace ID.
- Live/mock mode labels.

API proof is not the same as a wallet-signed chain transaction.
