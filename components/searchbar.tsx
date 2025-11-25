"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function SearchBar() {
    return (
        <header className="flex justify-center sticky top-0 z-30 w-full bg-background/80 backdrop-blur-sm border-b">
            <div className="py-2">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                        type="search"
                        placeholder="Search..."
                        className="w-80 h-8 pl-9 text-sm"
                    />
                </div>
            </div>
        </header>
    );
}
