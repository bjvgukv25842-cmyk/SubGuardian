# Security Model

## Core Boundaries

- SubGuardian does not save user private keys.
- SubGuardian does not custody assets.
- Users sign wallet login messages for identity and sign revoke/chain transactions in their own wallet.
- For EOAs, SubGuardian cannot automatically block every transaction the user signs directly.
- For integrated agents and merchants, SubGuardian can require pre-spend authorization before payment.
- For smart accounts, Safe modules, session keys, or account abstraction, a future guard can enforce SubGuardian policy before execution.

## Session Security

- Connect Wallet alone is not authentication.
- The server issues a nonce and message.
- User signs the message with their wallet.
- The server verifies the recovered signer with `ethers.verifyMessage`.
- A session is stored server-side and referenced by an HttpOnly, SameSite=Lax cookie.
- User APIs ignore front-end `userWallet` for ownership and use the session wallet.
- Nonces expire and are single-use to reduce replay risk.

## API Key Security

- Merchant/agent API calls use bearer API keys.
- API keys are hashed before storage.
- The global `SUBGUARDIAN_API_KEY` remains supported for server-to-server deployments.
- Merchant keys are scoped to merchant records.
- Rotation/revocation is modeled and should be exposed before public launch.

## Replay and Idempotency

- `idempotencyKey` is required for production merchant integrations.
- Repeated requests for the same wallet/key return the original decision instead of creating duplicate approvals.
- Login nonces are single-use.

## Rate Limiting

The production deployment should add rate limiting by wallet, IP, merchant ID, API key ID, and route class. Authorization and login routes should have stricter limits than read-only dashboard routes.

## Webhook Signature

Webhook delivery is reserved in the merchant schema. Production callbacks should sign payloads with HMAC-SHA256 using the merchant webhook secret and include timestamp, signature, event ID, and replay window headers.

## Sensitive Data Encryption

- 0G Storage payloads are encrypted with AES-256-GCM before upload.
- Default local encryption secret is for development only.
- Production must set `SUBGUARDIAN_ENCRYPTION_SECRET`.
- Do not upload sensitive plaintext policy, usage, or risk analysis data.

## Audit Logging

Audit logs record policy updates, wallet scans, spend authorization decisions, approval resolutions, and chain record links. Audit entries should be immutable in production.

## Production Secrets

Do not commit `.env.local`, private keys, API keys, or 0G credentials. Live 0G Storage requires a dedicated server signer; never use a user's wallet private key.

## Legal / Compliance Limits

SubGuardian is not a bank, broker, exchange, custodian, or investment adviser. It does not provide investment advice and does not guarantee that all chain transactions can be blocked. Users remain responsible for wallet signatures, approvals, and compliance with local law.
