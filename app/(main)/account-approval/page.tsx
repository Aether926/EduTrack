import RequestTable from "@/components/access-request";

export default function AccountApproval() {
    return (
        <div className="px-4">
            <div className="flex justify-center text-3xl font-semibold mt-4">
                User Access Requests
            </div>
            <RequestTable />
        </div>
    );
}
