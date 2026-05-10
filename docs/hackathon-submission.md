# Hackathon Submission Summary

## Project Name

SubGuardian

## One-Liner

AI Agent spending firewall before autonomous payments

## Description

SubGuardian is a pre-spend authorization API for AI agents, API gateways, subscription systems, and payment systems. Before an autonomous agent renews a tool, calls a paid API, buys credits, or triggers a payment, SubGuardian checks user policy, budget, usage signals, trusted/blocked services, and manual approval thresholds. It returns `allow`, `pause`, `reject`, or `ask_user` with a proof URL, analysis hash, storage root hash, and clear 0G mode label.

## Recommended Track

Agentic Economy & Autonomous Applications

## Links

- GitHub URL: https://github.com/bjvgukv25842-cmyk/SubGuardian
- Demo video URL: `[DEMO_VIDEO_URL]`
- X post URL: `[X_POST_URL]`

## 0G Chain

- Status: live
- Contract address: `0xaC87E72e1aF91174EedaC91C08bF56768d6cE9fD`
- Explorer base: `https://chainscan.0g.ai`
- Contract link: [https://chainscan.0g.ai/address/0xaC87E72e1aF91174EedaC91C08bF56768d6cE9fD](https://chainscan.0g.ai/address/0xaC87E72e1aF91174EedaC91C08bF56768d6cE9fD)

## Explorer Transactions

- [0xdd0df16b1cc2261f0661930e604c26d6e21d8bb3fc7cbc4bf32bfb6b7f798dbc](https://chainscan.0g.ai/tx/0xdd0df16b1cc2261f0661930e604c26d6e21d8bb3fc7cbc4bf32bfb6b7f798dbc)
- [0x14e766169b6e63df9d2f3adb9ee252e3e7629f9485532a39e2101df2438a209e](https://chainscan.0g.ai/tx/0x14e766169b6e63df9d2f3adb9ee252e3e7629f9485532a39e2101df2438a209e)

## 0G Components Used

- 0G Chain: live deployed contract with successful transactions and event logs.
- 0G Storage: mock/fallback in public demo; live SDK upload support exists in `lib/zeroG/storage.ts`.
- 0G Compute: mock/fallback in public demo; live API support with `verify_tee: true` exists in `lib/zeroG/compute.ts`.

## Local Run

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Tests

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

## Known Limitations

- API `chainTxHash` can be `null` because the API creates a pre-spend decision proof. Live chain writes are completed by the dashboard wallet flow.
- Storage and Compute are mock/fallback unless live credentials are configured.
- Do not commit `.env.local`, private keys, or API keys.
