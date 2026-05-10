import { ProofCredential } from "@/components/ProofCredential";
import { getDecision } from "@/lib/serverStore";
import { getSessionFromCookies } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ProofPage({ params }: { params: { id: string } }) {
  const decision = await getDecision(decodeURIComponent(params.id));
  const session = await getSessionFromCookies();

  if (!decision || !session || (decision.userWallet || decision.walletAddress || "").toLowerCase() !== session.wallet.toLowerCase()) {
    return <ProofCredential decision={null} />;
  }

  return <ProofCredential decision={decision} />;
}
