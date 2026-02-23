import { getPendingProofs } from "@/features/proof-review/lib/queries";
import ProofReviewTable from "@/features/proof-review/components/proof-review-table";

export const dynamic = "force-dynamic";

export default async function ProofReviewPage() {
  const rows = await getPendingProofs();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Proof Review</h1>
        <p className="text-sm text-muted-foreground">
          Submissions waiting for approval.
        </p>
      </div>

      <ProofReviewTable rows={rows} />
    </div>
  );
}