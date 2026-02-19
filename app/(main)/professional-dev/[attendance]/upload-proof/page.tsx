import UploadProofClient from "@/features/professional-dev/components/upload-proof-client";
import { getUploadProofContext } from "@/lib/database/attendance-details";
import { createClient } from "@/lib/supabase/server";

function fmtDate(d: string | null | undefined) {
    if (!d) return "—";
    try {
        return new Date(d).toISOString().slice(0, 10);
    } catch {
        return String(d);
    }
}

export default async function UploadProofPage({
    params,
}: {
    params: Promise<{ attendance: string }>;
}) {
    const { attendance } = await params;

    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return <div className="p-6">not authenticated</div>;

    const ctx = await getUploadProofContext(attendance);
    if (!ctx) return <div className="p-6">record not found</div>;

    return (
        <div className="p-6 space-y-4">
            <div className="rounded-lg border p-4">
                <div className="text-xl font-semibold">
                    {ctx.training.title}
                </div>

                <div className="text-sm opacity-70">
                    {ctx.training.type} • {ctx.training.level} •{" "}
                    {ctx.training.totalHours} hrs
                </div>

                <div className="text-sm opacity-70">
                    {fmtDate(ctx.training.startDate)} -{" "}
                    {fmtDate(ctx.training.endDate)}
                </div>

                <div className="text-sm mt-2">
                    Current status:{" "}
                    <span className="font-medium">{ctx.status}</span>
                </div>
            </div>

            <UploadProofClient attendanceId={attendance} />
        </div>
    );
}
