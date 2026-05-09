# SubGuardian 3-Minute Demo Script

## 0:00-0:20 Problem

AI and Web3 users now pay for many recurring tools: LLM apps, coding copilots, image tools, RPC, indexers, APIs and cloud services. The problem is not only remembering renewals. The real problem is deciding whether a renewal should be allowed before the money is spent.

SubGuardian is a privacy-preserving AI subscription renewal firewall built on 0G.

## 0:20-0:45 Product Dashboard

Open the SubGuardian dashboard. Show the connected wallet area, 0G Compute mode, 0G Storage mode, monthly total, budget limit, potential savings and risk level.

Point out that this is not a bank connector and not a payment app. It uses user-entered or imported subscription data, then creates a verifiable decision record.

## 0:45-1:20 Add Subscription and Set Policy

Show the mock subscription queue:

- ChatGPT Plus
- Midjourney
- Cursor
- Notion AI
- Random AI API

Add one manual subscription or edit the policy fields:

- Monthly budget: 100 USDT
- Price increase limit: 15%
- Manual approval above: 30 USDT
- Default action: ask_user
- Allow auto-renew for high-usage services

Explain that the policy is the user-controlled firewall rule set.

## 1:20-1:50 0G Compute Analysis

Click **Analyze with 0G Compute**.

Show the JSON-based AI result in the dashboard:

- Overall risk
- Budget status
- Per-service decisions: renew, pause, reject, ask_user
- TEE verification state
- Trace ID

Explain that in live mode, the adapter calls 0G Compute Router or Private Computer with `verify_tee: true`. In local demo mode, the app uses deterministic mock analysis so judges can reproduce the flow without private API keys.

## 1:50-2:20 0G Storage Upload

Click **Upload Encrypted Profile**.

Show:

- AES-GCM encrypted payload
- Storage root hash
- Mock mode or Live 0G mode badge

Explain that the subscription list, policy and AI analysis are encrypted before upload. The app stores subscription memory on 0G Storage rather than a centralized database.

## 2:20-2:45 0G Chain Decision Record

Click:

1. **Add Subscription**
2. **Record Analysis**
3. **Record Decision**

Show:

- Contract address
- On-chain subscription ID
- Analysis hash
- Latest transaction hash
- 0G Explorer link

Open the Explorer link and show the transaction/events.

## 2:45-3:00 Summary

SubGuardian turns recurring subscriptions into a user-controlled, verifiable renewal decision layer. It combines encrypted memory on 0G Storage, private AI recommendation through 0G Compute, and user-authorized decision logs on 0G Chain.

The long-term vision is a budget firewall for AI agents before they subscribe, renew or spend.
