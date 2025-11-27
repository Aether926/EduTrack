import TeacherTable from "@/components/teacher-table";
import ProtectedPage from "@/components/protected-page";

export default function TeacherProfile() {
    return (
        <ProtectedPage>
        <div className="px-4">
            <div className="flex justify-center text-3xl font-semibold mt-4">
                Teacher Profiles
            </div>
            <TeacherTable />
        </div>
        </ProtectedPage>
    );
}
