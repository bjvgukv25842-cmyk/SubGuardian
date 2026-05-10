export function clsx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function formatAddress(address?: string) {
  if (!address) {
    return "";
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatMoney(value: number, currency = "USDT") {
  return `${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currency}`;
}

export function monthlyAmount(amount: number, billingCycle: string) {
  return billingCycle === "yearly" ? Number((amount / 12).toFixed(2)) : amount;
}

export function decisionToContractEnum(decision: string) {
  const map: Record<string, number> = {
    allow: 1,
    renew: 1,
    pause: 2,
    reject: 3,
    ask_user: 4
  };

  return map[decision] || 4;
}

export function decisionTone(decision?: string) {
  if (decision === "renew" || decision === "allow") return "success";
  if (decision === "pause" || decision === "ask_user") return "warning";
  if (decision === "reject") return "danger";
  return "neutral";
}

export function parseDateToUnix(date: string) {
  const timestamp = Date.parse(`${date}T00:00:00Z`);
  return Number.isFinite(timestamp) ? BigInt(Math.floor(timestamp / 1000)) : 0n;
}
