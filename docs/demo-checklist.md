# Demo Recording Checklist

## Before Recording

- [ ] Run the app locally with `npm run dev`.
- [ ] Open `http://localhost:3000`.
- [ ] Confirm README Judge Notes have the contract and Explorer links.
- [ ] Confirm `.env.local` is not visible in the recording.
- [ ] Confirm no terminal output shows `PRIVATE_KEY`, API keys, or secrets.
- [ ] Confirm contract address is visible: `0xaC87E72e1aF91174EedaC91C08bF56768d6cE9fD`.
- [ ] Confirm Explorer base is `https://chainscan.0g.ai`.
- [ ] Open the contract Explorer link in a browser tab.
- [ ] Open at least one transaction Explorer link in a browser tab.

## App Flow

- [ ] Submit one spend authorization request.
- [ ] Show `allow`, `pause`, `reject`, or `ask_user`.
- [ ] Show `decisionId`.
- [ ] Show `analysisHash`.
- [ ] Show `storageRootHash`.
- [ ] Show `mode`.
- [ ] Open `proofUrl`.
- [ ] Explain that API `chainTxHash` may be null because the API creates a pre-spend proof; chain writes are done through the dashboard wallet flow.

## 0G Evidence

- [ ] Show 0G Chain is live.
- [ ] Show contract Explorer page.
- [ ] Show transaction `0xdd0df16b1cc2261f0661930e604c26d6e21d8bb3fc7cbc4bf32bfb6b7f798dbc`.
- [ ] Show transaction `0x14e766169b6e63df9d2f3adb9ee252e3e7629f9485532a39e2101df2438a209e`.
- [ ] Say Storage is mock/fallback unless live server signer is configured.
- [ ] Say Compute is mock/fallback unless live 0G Compute credentials are configured.
- [ ] Say live Compute adapter uses `verify_tee: true`.

## Timing

- [ ] Problem statement under 20 seconds.
- [ ] API request and result under 55 seconds.
- [ ] Proof page under 25 seconds.
- [ ] Chain evidence under 30 seconds.
- [ ] Storage/Compute status under 25 seconds.
- [ ] Total video under 3 minutes.
