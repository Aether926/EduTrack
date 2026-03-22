import {
    CheckCircle2,
    XCircle,
    Trash2,
    RotateCcw,
    FileSearch,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type ActionButtonProps = {
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    size?: "sm" | "default";
};

/* ── Shared inner spinner ── */
function Spinner() {
    return <Loader2 className="h-3.5 w-3.5 animate-spin" />;
}

/* ── Approve ── */
export function ApproveButton({
    onClick,
    disabled,
    loading,
    size = "sm",
}: ActionButtonProps) {
    return (
        <Button
            size={size}
            onClick={onClick}
            disabled={disabled ?? loading}
            className="gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20 hover:border-emerald-500/40"
        >
            {loading ? <Spinner /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            Approve
        </Button>
    );
}

/* ── Approve Anyway ── */
export function ApproveAnywayButton({
    onClick,
    disabled,
    loading,
    size = "sm",
}: ActionButtonProps) {
    return (
        <Button
            size={size}
            onClick={onClick}
            disabled={disabled ?? loading}
            className="gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20 hover:border-emerald-500/40"
        >
            {loading ? <Spinner /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            Approve anyway
        </Button>
    );
}

/* ── Reject ── */
export function RejectButton({
    onClick,
    disabled,
    loading,
    size = "sm",
}: ActionButtonProps) {
    return (
        <Button
            size={size}
            onClick={onClick}
            disabled={disabled ?? loading}
            className="gap-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/25 hover:bg-rose-500/20 hover:border-rose-500/40"
        >
            {loading ? <Spinner /> : <XCircle className="h-3.5 w-3.5" />}
            Reject
        </Button>
    );
}

/* ── Delete ── */
export function DeleteButton({
    onClick,
    disabled,
    loading,
    size = "sm",
}: ActionButtonProps) {
    return (
        <Button
            size={size}
            onClick={onClick}
            disabled={disabled ?? loading}
            className="gap-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/25 hover:bg-rose-500/20 hover:border-rose-500/40 opacity-80"
        >
            {loading ? <Spinner /> : <Trash2 className="h-3.5 w-3.5" />}
            Delete
        </Button>
    );
}

/* ── Review ── */
export function ReviewButton({
    onClick,
    disabled,
    loading,
    size = "sm",
}: ActionButtonProps) {
    return (
        <Button
            size={size}
            onClick={onClick}
            disabled={disabled ?? loading}
            className="gap-1.5 bg-zinc-500/10 text-zinc-400 border border-zinc-500/25 hover:bg-zinc-500/20 hover:border-zinc-500/40"
        >
            {loading ? <Spinner /> : <FileSearch className="h-3.5 w-3.5" />}
            Review
        </Button>
    );
}

/* ── Request Resubmit ── */
export function RequestResubmitButton({
    onClick,
    disabled,
    loading,
    size = "sm",
}: ActionButtonProps) {
    return (
        <Button
            size={size}
            onClick={onClick}
            disabled={disabled ?? loading}
            className="gap-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/25 hover:bg-amber-500/20 hover:border-amber-500/40"
        >
            {loading ? <Spinner /> : <RotateCcw className="h-3.5 w-3.5" />}
            Request Resubmit
        </Button>
    );
}
