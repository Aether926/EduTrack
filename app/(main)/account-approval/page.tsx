import AccessRequest from "@/components/access-request";
import {
    getUsers,
    getUsersWithPending,
    getUsersWithRejected,
} from "@/lib/user";

export default async function AccessRequestPage() {
    const users = await getUsers();

    if (!users) {
        return <div>No users found</div>;
    }

    const pending = await getUsersWithPending(users);
    const rejected = await getUsersWithRejected(users);

    return (
        <div className="px-4">
            <AccessRequest pendingUsers={pending} rejectedUsers={rejected} />
        </div>
    );
}
