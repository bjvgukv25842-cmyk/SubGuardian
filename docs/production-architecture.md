# Production Architecture

## Components

- User Dashboard: Next.js app routes under `/dashboard/*`.
- Wallet connection and identity: wagmi connects the wallet; SIWE-style signing creates an HttpOnly session cookie.
- User policy management: `/api/user/policy` stores policy by session wallet.
- Wallet transaction/approval reading: `/api/user/wallet/scan` reads configured EVM RPC data and indexed approval inputs. Private keys are never requested or stored.
- Subscription recognition: wallet approvals and indexed activity are clustered into detected subscription records.
- Agent spend authorization API: `POST /api/v1/spend/authorize`.
- Merchant / agent integration API: merchant registration, API keys, request polling, usage events, and webhook fields.
- Proof / audit trail: `/proof/[id]`, stored decisions, audit logs, and chain records.
- 0G Chain records: wallet-signed tx hashes are saved separately from API proofs.
- 0G Storage: encrypted snapshots upload through the 0G adapter when live credentials exist; otherwise mock root hashes are labeled.
- 0G Compute: live risk analysis uses `verify_tee: true`; otherwise deterministic/mock policy evaluation is labeled.
- Database persistence: local JSON adapter mirrors production entities; production should use Prisma + Postgres/Supabase/Neon.
- Webhook / notification: schema and merchant webhook fields exist; delivery worker is next.
- Admin/monitoring: planned for tenant metrics, suspicious activity, API logs, and alert delivery.

## Request Flow

1. User connects wallet and signs login message.
2. Server creates session bound to wallet.
3. Dashboard APIs read wallet from session only.
4. User saves policy; server stores policy and audit log.
5. Merchant calls pre-spend API with API key, idempotency key, `merchantId`, `agentId`, `userWallet`, `amount`, `token`, `spender`, and `reason`.
6. Server loads the user's stored policy and wallet/usage records.
7. Policy engine returns `allow`, `pause`, `reject`, or `ask_user`.
8. `ask_user` creates a pending approval.
9. User approves or rejects in dashboard.
10. Merchant polls `GET /api/v1/spend/requests/[id]` or receives a future signed webhook.
11. Optional wallet-signed 0G Chain record links txHash to proof.

## Production Database Schema

- `users`: id, primary_wallet, created_at, updated_at.
- `wallets`: id, user_id, address, chain_id, verified_at.
- `sessions`: id, wallet, created_at, expires_at, user_agent.
- `policies`: id, wallet, policy_json, policy_hash, created_at, updated_at.
- `spend_requests`: id, merchant_id, agent_id, wallet, amount, token, spender, reason, idempotency_key, created_at.
- `decisions`: id, spend_request_id, decision, risk_score, analysis_hash, storage_root_hash, policy_hash, chain_tx_hash, final_user_decision.
- `subscriptions`: id, wallet, spender, token, amount, cadence, status, risk_level, source.
- `approvals`: id, wallet, token, spender, allowance, risk_level, last_activity_at, source.
- `merchants`: id, owner_wallet, name, agent_id, webhook_url, webhook_secret_hash, status.
- `api_keys`: id, merchant_id, key_hash, label, created_at, revoked_at, last_used_at.
- `webhooks`: id, merchant_id, url, secret_hash, enabled.
- `audit_logs`: id, wallet, merchant_id, action, target_type, target_id, metadata, created_at.
- `chain_records`: id, wallet, decision_id, policy_hash, decision_hash, storage_root_hash, tx_hash, signer_wallet, status.

## Control Boundary

For ordinary EOAs, SubGuardian cannot block transactions a user signs directly. It can enforce authorization for integrated agents and merchants, alert users, guide revokes, and support smart account/Safe/session-key/account-abstraction guards for on-chain enforcement.
