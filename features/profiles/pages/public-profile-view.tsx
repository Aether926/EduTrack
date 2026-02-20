"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabaseClient";

import ProfileHeader from "@/features/profiles/components/profile-header";

import PersonalInfoCard from "@/features/profiles/components/cards/personal-info-card";
import ContactInfoCard from "@/features/profiles/components/cards/contact-info-card";
import TrainingsCard from "@/features/profiles/components/cards/training-card";
import EmploymentInfoCard from "@/features/profiles/components/cards/employment-info-card";
import GovernmentIDsCard from "@/features/profiles/components/cards/government-ids-card";
import EducationCard from "@/features/profiles/components/cards/education-card";
import ServiceRecordCard from "@/features/profiles/components/cards/service-record-card";

import type { TrainingRow } from "@/features/profiles/types/trainings";
import type { ViewerRole } from "@/features/profiles/types/viewer-role";
import AppointmentHistoryCard from "../components/cards/appointment-history-card";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyProfile = Record<string, any>;
type FromSource = "qr" | "teacher";

function toDate(v: unknown): Date | undefined {
  if (!v) return undefined;
  const d = v instanceof Date ? v : new Date(String(v));
  return Number.isNaN(d.getTime()) ? undefined : d;
}

type ProfileCardData = {
  id?: string;
  firstName: string;
  middleInitial: string;
  lastName: string;
  username: string;

  age: string;
  gender: string;
  dateOfBirth: Date | undefined;
  civilStatus: string;
  nationality: string;
  religion: string;

  contactNumber: string;
  address: string;
  email: string;

  employeeId: string;
  position: string;
  plantillaNo: string;

  pagibigNo: string;
  philHealthNo: string;
  gsisNo: string;
  tinNo: string;

  dateOfOriginalAppointment: Date | undefined;
  dateOfLatestAppointment: Date | undefined;

  subjectSpecialization: string;
  bachelorsDegree: string;
  postGraduate: string;

  profileImage?: string | null;
};

const EMPTY: ProfileCardData = {
  id: undefined,
  firstName: "",
  middleInitial: "",
  lastName: "",
  username: "",

  age: "",
  gender: "",
  dateOfBirth: undefined,
  civilStatus: "",
  nationality: "",
  religion: "",

  contactNumber: "",
  address: "",
  email: "",

  employeeId: "",
  position: "",
  plantillaNo: "",

  pagibigNo: "",
  philHealthNo: "",
  gsisNo: "",
  tinNo: "",

  dateOfOriginalAppointment: undefined,
  dateOfLatestAppointment: undefined,

  subjectSpecialization: "",
  bachelorsDegree: "",
  postGraduate: "",

  profileImage: null,
};

export default function PublicProfileView(props: {
  profile: AnyProfile;
  from?: FromSource;
  trainings?: TrainingRow[];
  viewerRole: ViewerRole;
}) {
  const { profile, from = "teacher", trainings = [], viewerRole } = props;

  const { theme } = useTheme();
  const bgClass = theme === "light" ? "bg-gray-100" : "bg-gray-950";

  // only used for showing the QR banner (login/signup)
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const run = async () => {
      const { data } = await supabase.auth.getSession();
      setHasSession(Boolean(data.session));
    };
    void run();
  }, []);

  const data = useMemo<ProfileCardData>(() => {
    return {
      ...EMPTY,
      ...profile,

      // normalize dates
      dateOfBirth: toDate(profile?.dateOfBirth),
      dateOfOriginalAppointment: toDate(profile?.dateOfOriginalAppointment),
      dateOfLatestAppointment: toDate(profile?.dateOfLatestAppointment),

      // make sure these are strings (cards expect strings)
      age: String(profile?.age ?? ""),
      contactNumber: String(profile?.contactNumber ?? ""),
      email: String(profile?.email ?? ""),

      profileImage: profile?.profileImage ?? null,
    };
  }, [profile]);

  // only admins can see “everything like auth profile”
  const showSensitiveCards = viewerRole === "ADMIN";

  return (
    <div className={`min-h-screen ${bgClass} space-y-6`}>
      {/* show login/signup only if: came from QR + no session */}
      {from === "qr" && !hasSession ? (
        <div className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
            <div className="text-sm opacity-80">
              viewing a profile via QR. sign in to access more features.
            </div>
            <div className="flex gap-2">
              <a
                href="/signin"
                className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm"
              >
                Login
              </a>
              <a
                href="/signUp"
                className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
              >
                Sign up
              </a>
            </div>
          </div>
        </div>
      ) : null}

      <ProfileHeader
        preview={data.profileImage ?? null}
        isEditing={false}
        tempProfileData={{
          firstName: data.firstName,
          middleInitial: data.middleInitial,
          lastName: data.lastName,
          position: data.position,
          username: data.username,
        }}
        showActions={false}
        onImageChange={() => {}}
        onSave={() => {}}
        onCancel={() => {}}
        onEdit={() => {}}
      />

      <div className="flex flex-col md:flex-row justify-center gap-6 p-4">
        {/* LEFT */}
        <div className="flex flex-col gap-4 w-full xl:max-w-[500px]">
          <PersonalInfoCard
            data={data}
            isEditing={false}
            onInputChange={() => {}}
            onDateChange={() => {}}
          />

          <ContactInfoCard data={data} isEditing={false} onInputChange={() => {}} />

          <TrainingsCard trainings={trainings} loading={false} viewerRole={viewerRole} />
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-4 w-full xl:max-w-[700px]">
          {showSensitiveCards ? (
            <>
              <EmploymentInfoCard
                data={data}
                isEditing={false}
                onInputChange={() => {}}
                onDateChange={() => {}}
                viewerRole={viewerRole}
                from={from}
              />
              <AppointmentHistoryCard
                teacherId={data.id ?? ""}
                isOwnProfile={false}
                from={from}
              />

              <GovernmentIDsCard 
                data={data} 
                isEditing={false} 
                onInputChange={() => {}} 
              />

              <EducationCard 
                data={data} 
                isEditing={false} 
                onInputChange={() => {}} 
              />
              
            </>
          ) : null}

          <ServiceRecordCard data={data} />
        </div>
      </div>
    </div>
  );
}
