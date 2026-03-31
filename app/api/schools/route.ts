import { NextRequest, NextResponse } from "next/server";

const TSV_URL =
    "https://raw.githubusercontent.com/OSMPH/deped_schools_db/master/data/2019/OSMaPaaralan_v2019-282-full.tsv";

const MAX_RESULTS = 20;

export type SchoolResult = {
    name: string;
    city: string;
    province: string;
    region: string;
};

// ── Module-level cache — survives across requests until server restart ─────────
let cache: SchoolResult[] | null = null;
let cacheLoading: Promise<SchoolResult[]> | null = null;

async function loadSchools(): Promise<SchoolResult[]> {
    if (cache) return cache;

    // Deduplicate concurrent requests — only one fetch in flight at a time
    if (cacheLoading) return cacheLoading;

    cacheLoading = (async () => {
        const res = await fetch(TSV_URL, {
            // Next.js fetch cache — revalidates once a day on the server
            next: { revalidate: 86400 },
        });

        if (!res.ok) throw new Error(`Failed to fetch schools TSV: ${res.status}`);

        const text = await res.text();
        const lines = text.split("\n");

        // Header: @id name short_name old_name date_started pop2012 pop2015
        //         isced:level addr:region addr:province addr:town addr:city ...
        // idx:    0    1      2          3         4             5      6
        //         7           8           9              10         11
        const IDX_NAME     = 1;
        const IDX_REGION   = 8;
        const IDX_PROVINCE = 9;
        const IDX_CITY     = 11;

        const schools: SchoolResult[] = [];

        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split("\t");
            if (cols.length < 12) continue;

            const name     = cols[IDX_NAME]?.trim();
            const region   = cols[IDX_REGION]?.trim();
            const province = cols[IDX_PROVINCE]?.trim();
            const city     = (cols[IDX_CITY] || cols[10])?.trim(); // fallback to town

            if (!name) continue;

            schools.push({ name, city: city ?? "", province: province ?? "", region: region ?? "" });
        }

        cache = schools;
        cacheLoading = null;
        return schools;
    })();

    return cacheLoading;
}

export async function GET(req: NextRequest) {
    const q = req.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";

    if (!q || q.length < 2) {
        return NextResponse.json({ results: [] });
    }

    try {
        const schools = await loadSchools();

        const results = schools
            .filter(
                (s) =>
                    s.name.toLowerCase().includes(q) ||
                    s.city.toLowerCase().includes(q) ||
                    s.province.toLowerCase().includes(q),
            )
            .slice(0, MAX_RESULTS);

        return NextResponse.json({ results });
    } catch (err) {
        console.error("[schools API]", err);
        return NextResponse.json(
            { results: [], error: "Failed to load schools data" },
            { status: 500 },
        );
    }
}