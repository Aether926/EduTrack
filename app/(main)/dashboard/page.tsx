import AppSidebar from "@/components/app-sidebar";
import { redirect } from "next/navigation";

export default function Home() {
    return (
        <div className="flex gap-5">
            <h1>hello world</h1>
            <div className="space-y-4">
                <p>Item 1</p>
                <p>Item 2</p>
                <p>Item 3</p>
            </div>

            <div className="my-4">
                <p>Item 1</p>
                <p>Item 2</p>
                <p>Item 3</p>
            </div>
        </div>
    );
}
