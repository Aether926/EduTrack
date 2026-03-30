export const APPOINTMENT_TYPES = [
    "Original",
    "Promotion",
    "Reappointment",
    "Transfer",
    "Reinstatement",
];

export const APPOINTMENT_REMARKS = [
    "Promotion / Salary grade upgrade",
    "Transfer from another school",
    "Renewal of appointment",
    "Initial entry into service",
    "Correction of records",
    "End of temporary appointment",
    "Other (specify below)",
];

export const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export const NAME_EXTENSIONS = ["Jr.", "Sr.", "II", "III", "IV", "V"];

export const NATIONALITIES = [
    { value: "american", label: "American" },
    { value: "australian", label: "Australian" },
    { value: "british", label: "British" },
    { value: "canadian", label: "Canadian" },
    { value: "chinese", label: "Chinese" },
    { value: "emirati", label: "Emirati" },
    { value: "filipino", label: "Filipino" },
    { value: "french", label: "French" },
    { value: "german", label: "German" },
    { value: "indian", label: "Indian" },
    { value: "indonesian", label: "Indonesian" },
    { value: "italian", label: "Italian" },
    { value: "japanese", label: "Japanese" },
    { value: "korean", label: "Korean" },
    { value: "kuwaiti", label: "Kuwaiti" },
    { value: "malaysian", label: "Malaysian" },
    { value: "qatari", label: "Qatari" },
    { value: "saudi", label: "Saudi" },
    { value: "singaporean", label: "Singaporean" },
    { value: "spanish", label: "Spanish" },
    { value: "taiwanese", label: "Taiwanese" },
    { value: "thai", label: "Thai" },
    { value: "vietnamese", label: "Vietnamese" },
];

export const RELIGIONS = [
    { value: "roman catholic", label: "Roman Catholic" },
    { value: "islam", label: "Islam" },
    { value: "evangelical", label: "Evangelical" },
    { value: "protestant", label: "Protestant" },
    { value: "iglesia ni Cristo", label: "Iglesia ni Cristo" },
    { value: "seventh-day Adventist", label: "Seventh-day Adventist" },
];

export const CIVIL_STATUSES = [
    { value: "Single", label: "Single" },
    { value: "Married", label: "Married" },
    { value: "Widowed", label: "Widowed" },
    { value: "Separated", label: "Separated" },
    { value: "Divorced", label: "Divorced" },
];

export const HR_CHANGE_REASONS = [
    "Correction of records",
    "Promotion / Salary grade upgrade",
    "Transfer from another school",
    "Renewal of appointment",
    "Initial entry into service",
];

export const APPOINTMENT_REASONS = [
    "Promotion / Salary grade upgrade",
    "Transfer from another school",
    "Renewal of appointment",
    "Initial entry into service",
    "Correction of records",
    "End of temporary appointment",
];

export const REQUIRED_DOCUMENT_TYPES: { id: string; name: string }[] = [
    { id: "c4459e5a-0e49-4ad4-9cf7-a5c366ed64de", name: "Birth Certificate" },
    { id: "9fdc038d-9851-428a-904a-f882a6f7ee6b", name: "CSC Eligibility" },
    { id: "e7c4ea4e-0084-4765-9cd3-a2b698a98e1e", name: "Diploma" },
    { id: "acb0f575-09b6-4f1f-b154-69860df3355f", name: "IPCRF" },
    {
        id: "d2f954b7-eecd-44b3-b329-8abecc627796",
        name: "Marriage Certificate",
    },
    { id: "54b25d9b-8dbd-4182-b0d5-cb38ef9e19ba", name: "Medical Certificate" },
    {
        id: "c3b6fada-f0ed-48a9-bcdb-946fe651205f",
        name: "Medical Certificate - Blood Test",
    },
    {
        id: "123f79b2-b11f-40fd-8bda-cf6ae322bc68",
        name: "Medical Certificate - Chest X-Ray",
    },
    {
        id: "b97e89d5-0789-4d7b-8a92-1c1ab6355741",
        name: "Medical Certificate - Drug Test",
    },
    {
        id: "bcd6c0a0-1646-45dd-8afd-dbe1209b0814",
        name: "Medical Certificate - Physical Exam",
    },
    {
        id: "8db9dfd3-f5cb-476c-8bb9-ef367f1ea859",
        name: "Medical Certificate - Urinalysis",
    },
    { id: "60ca9097-5fd8-454a-8605-28f03ceef61d", name: "PRC ID" },
    { id: "815b8305-c6c0-4b76-b53b-3539f8931ab7", name: "SALN" },
    { id: "34d9dee9-9690-4325-bb6f-991fea48223c", name: "Service Record" },
    {
        id: "292d7259-644f-4e9c-81d6-4a7ccf33297a",
        name: "Transcript of Records",
    },
];
