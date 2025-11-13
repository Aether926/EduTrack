"use server";

import { prisma } from "@/lib/prisma";

export async function postReligion() {
    const users = await prisma.religion.create({
        data: {
            name: "Christianity",
        },
    });
    return users;
}
