"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { Combobox } from "@/components/combobox";
import { AddAppointmentModal } from "@/features/admin-actions/appointment-history/components/add-appointment-modal";
import type { AppointmentHistoryRow } from "@/features/admin-actions/appointment-history/types/appointment-history";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

const TYPE_STYLE: Record<string, string> = {
  Original: "bg-blue-100 text-blue-800",
  Promotion: "bg-purple-100 text-purple-800",
  Reappointment: "bg-teal-100 text-teal-800",
  Transfer: "bg-orange-100 text-orange-800",
  Reinstatement: "bg-pink-100 text-pink-800",
};

const columns: ColumnDef<AppointmentHistoryRow>[] = [
  {
    accessorKey: "teacherName",
    header: "Teacher",
    cell: ({ row }) => {
      const t = row.original.teacher;
      return t ? (
        <div>
          <div className="font-medium text-sm">{`${t.firstName} ${t.lastName}`}</div>
          <div className="text-xs text-muted-foreground">{t.email}</div>
        </div>
      ) : (
        <span className="text-muted-foreground text-sm">Unknown</span>
      );
    },
  },
  {
    accessorKey: "appointment_type",
    header: "Type",
    cell: ({ row }) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${TYPE_STYLE[row.original.appointment_type] ?? "bg-gray-100 text-gray-800"}`}>
        {row.original.appointment_type}
      </span>
    ),
  },
  {
    accessorKey: "position",
    header: "Position",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.position}</span>
    ),
  },
  {
    accessorKey: "start_date",
    header: "Start Date",
    cell: ({ row }) =>
      row.original.start_date
        ? new Date(row.original.start_date).toLocaleDateString()
        : "—",
  },
  {
    accessorKey: "end_date",
    header: "End Date",
    cell: ({ row }) =>
      row.original.end_date
        ? new Date(row.original.end_date).toLocaleDateString()
        : "—",
  },
  {
    accessorKey: "memo_no",
    header: "Memo No.",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.memo_no ?? "—"}</span>
    ),
  },
  {
    accessorKey: "remarks",
    header: "Remarks",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground line-clamp-1">{row.original.remarks ?? "—"}</span>
    ),
  },
];

export function AppointmentHistoryClient(props: {
  rows: AppointmentHistoryRow[];
  teachers: { id: string; fullName: string }[];
}) {
  const { rows, teachers } = props;
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const teacherOptions = teachers.map((t) => ({ value: t.id, label: t.fullName }));
  const typeOptions = [
    { value: "Original", label: "Original" },
    { value: "Promotion", label: "Promotion" },
    { value: "Reappointment", label: "Reappointment" },
    { value: "Transfer", label: "Transfer" },
    { value: "Reinstatement", label: "Reinstatement" },
  ];

  // add computed teacherName for DataTable filtering
  const tableData = rows
    .filter((r) => {
      const matchTeacher = selectedTeacher ? r.teacher_id === selectedTeacher : true;
      const matchType = selectedType ? r.appointment_type === selectedType : true;
      return matchTeacher && matchType;
    })
    .map((r) => ({
      ...r,
      teacherName: r.teacher ? `${r.teacher.firstName} ${r.teacher.lastName}` : "Unknown",
    }));

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
              Appointment History
            </h1>
            <p className="text-sm text-muted-foreground">
              Official appointment timeline records for all teachers.
            </p>
          </div>
          <Button className="flex items-center gap-2" onClick={() => setModalOpen(true)}>
            <Plus size={16} />
            Add Entry
          </Button>
        </header>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <Combobox
            label="Filter by teacher"
            options={teacherOptions}
            onChangeValue={setSelectedTeacher}
          />
          <Combobox
            label="Filter by type"
            options={typeOptions}
            onChangeValue={setSelectedType}
          />
          {(selectedTeacher || selectedType) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedTeacher("");
                setSelectedType("");
              }}
            >
              Clear filters
            </Button>
          )}
          <span className="text-xs text-muted-foreground ml-auto">
            {tableData.length} of {rows.length} records
          </span>
        </div>

        {/* Table */}
        <DataTable
          data={tableData}
          columns={columns}
          filterColumn="teacherName"
          filterPlaceholder="Search by teacher name..."
          showDeleteButton={false}
        />
      </div>

      <AddAppointmentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        teachers={teachers}
        onSuccess={() => router.refresh()}
      />
    </main>
  );
}