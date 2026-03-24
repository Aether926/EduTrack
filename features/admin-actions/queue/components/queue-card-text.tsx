import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
} from "@/components/ui/item";
import { useState } from "react";

interface Props {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    pendingCount: number;
    reviewedCount: number;
    pending: React.ReactNode;
    reviewed: React.ReactNode;
}

export default function QueueCardTextTest({
    icon,
    title,
    subtitle,
    pendingCount,
    reviewedCount,
    pending,
    reviewed,
}: Props) {
    const [tab, setTab] = useState<"PENDING" | "REVIEWED">("PENDING");

    return (
        <Card className="min-w-0">
            <CardHeader className="space-y-2">
                <Item>
                    <ItemMedia variant="icon">{icon}</ItemMedia>
                    <ItemContent>
                        <ItemTitle>{title}</ItemTitle>
                        <ItemDescription>{subtitle}</ItemDescription>
                    </ItemContent>
                    <ItemActions>
                        <div className="flex flex-nowrap flex-col justify-end gap-2">
                            <Button
                                size="sm"
                                variant={
                                    tab === "PENDING" ? "default" : "outline"
                                }
                                onClick={() => setTab("PENDING")}
                            >
                                Pending
                                <Badge variant="secondary" className="ml-2">
                                    {pendingCount}
                                </Badge>
                            </Button>

                            <Button
                                size="sm"
                                variant={
                                    tab === "REVIEWED" ? "default" : "outline"
                                }
                                onClick={() => setTab("REVIEWED")}
                            >
                                Reviewed
                                <Badge variant="secondary" className="ml-2">
                                    {reviewedCount}
                                </Badge>
                            </Button>
                        </div>
                    </ItemActions>
                </Item>
                {/* <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="rounded-md border bg-muted/10 p-2"></div>
                            <CardTitle className="text-base truncate"></CardTitle>
                        </div>
                        {subtitle ? (
                            <CardDescription className="text-sm">
                                
                            </CardDescription>
                        ) : null}
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2">
                        
                    </div>
                </div> */}
            </CardHeader>

            <CardContent className="space-y-3">
                {tab === "PENDING" ? pending : reviewed}
            </CardContent>
        </Card>
    );
}
