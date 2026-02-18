import { getPendingProofs } from "@/lib/database/proof-review";
import ProofReviewClient from "./proof-review-client";

export const dynamic = "force-dynamic"; // avoids stale cache

export default async function ProofReviewPage() {
  const rows = await getPendingProofs();

  return (
    <div className="p-6 space-y-4">
      <div>
        <div className="text-3xl font-bold">Proof Review</div>
        <div className="text-sm opacity-70">Submissions waiting for approval</div>
      </div>

      <ProofReviewClient rows={rows} />
    </div>
  );
}
