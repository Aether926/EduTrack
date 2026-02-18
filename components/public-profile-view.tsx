"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabaseClient";

import ProfileHeader from "@/components/profile-header";
import { calculateAge } from "@/app/util/helper";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Phone, Mail, MapPin, Calendar } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyProfile = Record<string, any>;
type FromSource = "qr" | "teacher";

function toDate(v: unknown): Date | undefined {
  if (!v) return undefined;
  const d = v instanceof Date ? v : new Date(String(v));
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function calculateServiceYears(dateValue: Date | undefined) {
  if (!dateValue) return "—";

  const originalDate = new Date(dateValue);
  const today = new Date();
  if (originalDate > today) return "Invalid date";

  let years = today.getFullYear() - originalDate.getFullYear();
  let months = today.getMonth() - originalDate.getMonth();
  let days = today.getDate() - originalDate.getDate();

  if (days < 0) {
    months--;
    const lastDayOfPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    days += lastDayOfPrevMonth;
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  return `${years}y ${months}m ${days}d`;
}

function DisplayField({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
        {Icon ? <Icon size={14} className="text-blue-600" /> : null}
        {label}
      </label>
      <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
        {value || "—"}
      </div>
    </div>
  );
}

function DisplayDate({ label, value }: { label: string; value?: Date }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
        <Calendar size={14} className="text-blue-600" />
        {label}
      </label>
      <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
        {value ? value.toLocaleDateString() : "—"}
      </div>
    </div>
  );
}

export default function PublicProfileView({
  profile,
  from = "teacher",
}: {
  profile: AnyProfile;
  from?: FromSource;
}) {
  const { theme } = useTheme();
  const [hasSession, setHasSession] = useState<boolean>(false);

  useEffect(() => {
    const run = async () => {
      const { data } = await supabase.auth.getSession();
      setHasSession(Boolean(data.session));
    };
    void run();
  }, []);

  const view = useMemo(() => {
    const firstName = profile?.firstName ?? "";
    const middleInitial = profile?.middleInitial ?? "";
    const lastName = profile?.lastName ?? "";
    const username = profile?.username ?? "";
    const position = profile?.position ?? "Teacher";

    const email = profile?.email ?? "";
    const contactNumber = profile?.contactNumber ?? "";
    const address = profile?.address ?? "";

    const gender = profile?.gender ?? "";
    const civilStatus = profile?.civilStatus ?? "";
    const nationality = profile?.nationality ?? "";
    const religion = profile?.religion ?? "";

    const dob = toDate(profile?.dateOfBirth);
    const age = (profile?.age ?? "") || calculateAge(dob);

    const originalAppt = toDate(profile?.dateOfOriginalAppointment);
    const latestAppt = toDate(profile?.dateOfLatestAppointment);

    const profileImage = profile?.profileImage ?? null;

    return {
      header: { firstName, middleInitial, lastName, username, position, profileImage },
      personal: { firstName, middleInitial, lastName, age, gender, dob, civilStatus, nationality, religion },
      contact: { contactNumber, email, address },
      service: { originalAppt, latestAppt },
    };
  }, [profile]);

  const bgClass = theme === "light" ? "bg-gray-100" : "bg-gray-950";

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
              <Button variant="outline" asChild>
                <a href="/signin">Login</a>
              </Button>
              <Button asChild>
                <a href="/signUp">Sign up</a>
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* exact same header component */}
      <ProfileHeader
        preview={view.header.profileImage}
        isEditing={false}
        tempProfileData={{
          firstName: view.header.firstName,
          middleInitial: view.header.middleInitial,
          lastName: view.header.lastName,
          position: view.header.position,
          username: view.header.username,
        }}
        showActions={false}
        onImageChange={() => {}}
        onSave={() => {}}
        onCancel={() => {}}
        onEdit={() => {}}
      />

      <div className="flex flex-col md:flex-row justify-center gap-6 p-4">
        <Card className="border-0 shadow-lg w-full xl:max-w-[500px]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="text-blue-600" size={20} />
              <CardTitle>Personal Information</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 w-full">
            <div className="space-y-4">
              <DisplayField label="First Name" value={view.personal.firstName} icon={User} />

              <div className="grid grid-cols-3 gap-3">
                <DisplayField label="Middle Initial" value={view.personal.middleInitial} />
                <div className="col-span-2">
                  <DisplayField label="Last Name" value={view.personal.lastName} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <DisplayField label="Age" value={String(view.personal.age ?? "")} />
                <DisplayField label="Gender" value={view.personal.gender} />
              </div>

              <DisplayDate label="Date of Birth" value={view.personal.dob} />

              <DisplayField label="Civil Status" value={view.personal.civilStatus} />
              <DisplayField label="Nationality" value={view.personal.nationality} />
              <DisplayField label="Religion" value={view.personal.religion} />
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800" />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Phone className="text-blue-600" size={20} />
                <h3 className="font-semibold text-gray-900 dark:text-white">Contact Information</h3>
              </div>

              <DisplayField label="Contact Number" value={view.contact.contactNumber} icon={Phone} />
              <DisplayField label="Email Address" value={view.contact.email} icon={Mail} />
              <DisplayField label="Address" value={view.contact.address} icon={MapPin} />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 w-full xl:max-w-[700px]">
          <Card className="flex-col border-0 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
            <CardHeader>
              <CardTitle className="text-white">Service Record (Current School)</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col justify-between bg-white/10 backdrop-blur rounded-lg p-4">
                  <p className="text-sm text-blue-100 mb-2">Years at This School</p>
                  <div>
                    <p className="text-3xl font-bold">
                      {calculateServiceYears(view.service.originalAppt)}
                    </p>
                    <p className="text-xs text-blue-200 mt-2">Since joining this school</p>
                  </div>
                </div>

                <div className="flex flex-col justify-between bg-white/10 backdrop-blur rounded-lg p-4">
                  <p className="text-sm text-blue-100 mb-2">Years in Current Position</p>
                  <div>
                    <p className="text-3xl font-bold">
                      {calculateServiceYears(view.service.latestAppt)}
                    </p>
                    <p className="text-xs text-blue-200 mt-2">Since latest appointment</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur rounded-lg p-3 text-sm">
                <p className="text-blue-100">
                  <span className="font-semibold">Note:</span> Date of original appointment marks when the
                  teacher joined this school. Latest appointment updates when promoted within the school.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
