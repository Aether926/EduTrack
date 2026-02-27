import Link from "next/link";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { ApprovalCategoryConfig } from "./category-type";

interface CategoryCardProps {
    config: ApprovalCategoryConfig;
    mode: "pending" | "recent";
    /** Base href for the index page, e.g. "/principal-actions/pending-approval" */
    baseHref: string;
}

export function CategoryCard({ config, mode, baseHref }: CategoryCardProps) {
    const href = `${baseHref}/${config.slug}`;

    return (
        <Link
            href={href}
            className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow block"
        >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
                {/* Icon */}
                <div className={`p-2 sm:p-3 rounded-lg ${config.iconBg}`}>
                    {config.icon}
                </div>

                {/* Badge(s) */}
                {mode === "pending" && (
                    <>
                        {config.pendingCount > 0 ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400">
                                <Clock className="h-3 w-3" />
                                {config.pendingCount} pending
                            </span>
                        ) : (
                            <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-border">
                                All clear
                            </span>
                        )}
                    </>
                )}

                {mode === "recent" && (
                    <div className="flex items-center gap-1.5">
                        {config.approvedCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400">
                                <CheckCircle2 className="h-3 w-3" />
                                {config.approvedCount}
                            </span>
                        )}
                        {config.rejectedCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
                                <XCircle className="h-3 w-3" />
                                {config.rejectedCount}
                            </span>
                        )}
                        {config.approvedCount === 0 &&
                            config.rejectedCount === 0 && (
                                <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-border">
                                    No history
                                </span>
                            )}
                    </div>
                )}
            </div>

            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">
                {config.label}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
                {config.description}
            </p>
        </Link>
    );
}
