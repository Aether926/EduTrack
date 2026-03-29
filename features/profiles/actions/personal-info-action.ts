"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath, revalidateTag } from "next/cache";
import type { PersonalInfoPDSPayload } from "@/features/profiles/types/personal-info";

export async function fetchPersonalInfoPDS(profileId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("Profile")
        .select(
            `
      nameExtension, placeOfBirth, height, weight, bloodType,
      citizenship, dualCitizenshipType, dualCitizenshipCountry, telephoneNo,
      residentialHouseNo, residentialStreet, residentialSubdivision,
      residentialBarangay, residentialCity, residentialProvince, residentialZipCode,
      permanentHouseNo, permanentStreet, permanentSubdivision,
      permanentBarangay, permanentCity, permanentProvince, permanentZipCode,
      sameAsResidential
    `,
        )
        .eq("id", profileId)
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function savePersonalInfoPDS(
    profileId: string,
    payload: PersonalInfoPDSPayload,
) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("Profile")
        .update({
            nameExtension: payload.nameExtension || null,
            placeOfBirth: payload.placeOfBirth || null,
            height: payload.height,
            weight: payload.weight,
            bloodType: payload.bloodType || null,
            citizenship: payload.citizenship || "Filipino",
            dualCitizenshipType: payload.dualCitizenshipType || null,
            dualCitizenshipCountry: payload.dualCitizenshipCountry || null,
            telephoneNo: payload.telephoneNo || null,
            residentialHouseNo: payload.residentialHouseNo || null,
            residentialStreet: payload.residentialStreet || null,
            residentialSubdivision: payload.residentialSubdivision || null,
            residentialBarangay: payload.residentialBarangay || null,
            residentialCity: payload.residentialCity || null,
            residentialProvince: payload.residentialProvince || null,
            residentialZipCode: payload.residentialZipCode || null,
            permanentHouseNo: payload.permanentHouseNo || null,
            permanentStreet: payload.permanentStreet || null,
            permanentSubdivision: payload.permanentSubdivision || null,
            permanentBarangay: payload.permanentBarangay || null,
            permanentCity: payload.permanentCity || null,
            permanentProvince: payload.permanentProvince || null,
            permanentZipCode: payload.permanentZipCode || null,
            sameAsResidential: payload.sameAsResidential,
        })
        .eq("id", profileId);

    if (error) throw new Error(error.message);
    revalidateTag(`profile-${profileId}`, "default");
    revalidatePath("/profile");
}
