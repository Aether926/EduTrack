import { redirect } from "next/navigation";
import SearchBar from "@/components/searchbar";

export default function Home() {
    return (
        <div className="flex flex-col gap-5">
            <SearchBar />
            <h1>hello world</h1>
            <div className="flex flex-col">
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
                <div className="my-4">
                    <p>Item 1</p>
                    <p>Item 2</p>
                    <p>Item 3</p>
                </div>
                <div className="my-4">
                    <p>Item 1</p>
                    <p>Item 2</p>
                    <p>Item 3</p>
                </div>
                <div className="my-4">
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
        </div>
    );
}
