# SubGuardian Product Roadmap

SubGuardian is moving from a hackathon AI Agent spending firewall demo into a Web3 wallet autopay and authorization management SaaS.

## P0 Product Foundation

- User Dashboard: wallet overview, active policies, detected subscriptions, pending spend requests, recent decisions, risk alerts, monthly spend summary, and 0G proof/audit records.
- Wallet identity: Connect Wallet plus Sign-In with Ethereum style message signing creates a server session. User APIs derive wallet identity from the session, not from front-end `userWallet` fields.
- Policy management: monthly budget, max single spend, whitelist, blacklist, unknown service default, manual approval threshold, daily/weekly/monthly limits, agent-specific rules, merchant-specific rules, and emergency pause.
- Developer demo: the previous simulator remains available at `/developers` and is labeled as simulated demo data.

## P1 Real Web3 Wallet Management

- Wallet scan reads native balance through the configured 0G/EVM RPC and supports indexed approval inputs through `SUBGUARDIAN_KNOWN_APPROVALS`.
- Approval parser normalizes owner, token, spender, allowance, risk level, and revoke availability.
- Recurring detection clusters approvals into subscription candidates: monthly, weekly, usage-based, or unknown recurring.
- Users can mark detected subscriptions as `trusted`, `paused`, `blocked`, or `needs_approval`.
- Merchant/agent pre-spend authorization API requires API key auth and returns `allow`, `pause`, `reject`, or `ask_user`.
- `ask_user` creates a pending approval in the dashboard. User approval/rejection updates the stored decision for merchant polling.

## P2 0G Deep Integration

- 0G Chain: policy update hashes and final decision hashes can be associated with wallet-signed chain records. API proof is separate from a chain transaction.
- 0G Storage: decision and policy snapshots are encrypted before upload. Missing live credentials use mock roots labeled `0g-mock-*`.
- 0G Compute: live requests use server-side credentials and `verify_tee: true`; fallback mode is labeled `mock`.

## P3 SaaS Backend

- Current local adapter mirrors production tables but still uses JSON fallback for local development.
- Production target: Prisma + Postgres, Supabase, or Neon.
- Required entities: users, wallets, sessions, policies, spend_requests, decisions, subscriptions, approvals, merchants, api_keys, webhooks, audit_logs, and chain_records.
- Merchant portal supports registration and API key creation. Rotation/revocation and request log analytics are next.
- Notifications should cover pending approvals, risk alerts, policy limit reached, suspicious approvals, webhook callbacks, and later email/Telegram/Discord.

## P4 Frontend Experience

Implemented base routes:

- `/`
- `/dashboard`
- `/dashboard/policies`
- `/dashboard/subscriptions`
- `/dashboard/approvals`
- `/dashboard/wallet`
- `/dashboard/audit`
- `/developers`
- `/developers/portal`
- `/proof/[id]`
- `/settings`

## P5 Tests

Coverage now includes policy evaluation, emergency pause, session wallet ownership through store isolation, API key hashing, idempotency, pending approvals, decision proof creation, chain tx null vs recorded states, mock/live mode labeling, and wallet approval parsing.
