# API Integration Guide

## Authentication

Production integrations use:

```http
Authorization: Bearer <merchant_api_key>
```

A global `SUBGUARDIAN_API_KEY` is still supported for controlled server-to-server deployments.

## Create Merchant and API Key

1. Sign in with wallet.
2. Open `/developers/portal`.
3. Register merchant/agent.
4. Create API key.
5. Store the key securely. SubGuardian stores only a hash.

## Pre-Spend Authorization

`POST /api/v1/spend/authorize`

Required production fields:

```json
{
  "merchantId": "mch_...",
  "agentId": "research-agent",
  "userWallet": "0x1111111111111111111111111111111111111111",
  "amount": 18,
  "token": "0xTokenOrNative",
  "spender": "0xSpender",
  "serviceName": "OpenAI API",
  "currency": "USDT",
  "reason": "Run retrieval and summarization for customer research.",
  "idempotencyKey": "merchant-run-123"
}
```

Response:

```json
{
  "decisionId": "dec_...",
  "decision": "ask_user",
  "riskScore": 61,
  "requiresUserApproval": true,
  "analysisHash": "0x...",
  "storageRootHash": "0g-mock-...",
  "policyHash": "0x...",
  "chainTxHash": null,
  "proofUrl": "/proof/dec_...",
  "status": "pending_user_approval",
  "mode": "mock"
}
```

Decisions:

- `allow`: merchant may proceed under policy.
- `pause`: merchant should hold and retry after policy/usage changes.
- `reject`: merchant must not proceed unless the user changes policy.
- `ask_user`: merchant must wait for dashboard approval or rejection.

## Poll Decision Status

`GET /api/v1/spend/requests/[decisionId]`

Use the same merchant API key. Polling returns final user decision when available.

## Usage Events

`POST /api/v1/usage/events`

```json
{
  "agentId": "research-agent",
  "userWallet": "0x1111111111111111111111111111111111111111",
  "serviceName": "OpenAI API",
  "eventType": "api_call",
  "units": 12,
  "cost": 2.5,
  "timestamp": "2026-05-09T12:00:00.000Z"
}
```

Usage events improve future decisions.

## Idempotency

Set `idempotencyKey` for every authorization request. Retries return the original decision and do not create duplicate pending approvals.

## Webhooks

Webhook URL and secret are stored on merchant records. Production webhook delivery should sign callbacks with HMAC-SHA256 and include timestamp and event ID. Until delivery worker is enabled, poll `GET /api/v1/spend/requests/[id]`.

## 0G Modes

- `0G Chain`: live wallet-signed records are separate from API proof.
- `0G Storage`: encrypted upload when configured; mock roots are labeled `0g-mock-*`.
- `0G Compute`: live requests send `verify_tee: true`; mock fallback is labeled.

Do not treat `chainTxHash: null` as a chain write. It means API proof only.
