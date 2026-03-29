import { NextResponse } from "next/server";
import { rotateQRTokenForCurrentUser } from "@/lib/database/qr";

export async function POST() {
    try {
        const token = await rotateQRTokenForCurrentUser();

        const generatedAt = new Date();
        const expiresAt = new Date(
            generatedAt.getTime() + 30 * 24 * 60 * 60 * 1000,
        );

        return NextResponse.json({
            token,
            generatedAt: generatedAt.toISOString(),
            expiresAt: expiresAt.toISOString(),
        });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "failed";

        if (msg.startsWith("cooldown:")) {
            const secondsLeft = parseInt(msg.split(":")[1], 60);
            return NextResponse.json(
                { error: msg, secondsLeft },
                { status: 429 },
            );
        }
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
