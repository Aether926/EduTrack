"use client";

import { Button } from "@/components/ui/button";
import { postReligion } from "../actions/religion";

export default function Home() {
    async function fetchData() {
        const religion = await postReligion();

    }

    return (
        <div>
            <Button onClick={() => fetchData()}>Test</Button>
        </div>
    );
}
