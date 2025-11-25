import TeacherTable from "@/components/teacher-table";

export default function TeacherProfile() {
    return (
        <div className="px-4">
            <div className="flex justify-center text-3xl font-semibold mt-4">
                Teacher Profiles
            </div>
            <TeacherTable />
        </div>
    );
}
