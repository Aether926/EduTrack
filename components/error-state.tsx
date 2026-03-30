import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function ErrorState({
    title = "Error",
    message = "Something went wrong",
    backHref = "/",
}: {
    title?: string;
    message?: string;
    backHref?: string;
}) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="max-w-md w-full space-y-4 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <h2 className="text-2xl font-bold">{title}</h2>
                <p className="text-muted-foreground">{message}</p>
                <Button asChild>
                    <Link href={backHref}>Go Back</Link>
                </Button>
            </div>
        </div>
    );
}
