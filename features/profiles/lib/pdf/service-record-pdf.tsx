
import {
  Document, Page, Text, View, StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 8,
    padding: "40pt 40pt 50pt 40pt",
    color: "#000",
  },

  // Header
  header: {
    textAlign: "center",
    marginBottom: 8,
  },
  headerRepublic: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  headerSub: {
    fontSize: 8,
  },
  headerDivision: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },
  headerCity: {
    fontSize: 8,
    marginBottom: 6,
  },
  docTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    textAlign: "center",
    letterSpacing: 3,
    marginTop: 6,
    marginBottom: 2,
  },
  docSubtitle: {
    fontSize: 8,
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 10,
  },

  // Name/Birth row
  nameRow: {
    flexDirection: "row",
    borderTop: "1pt solid #000",
    borderLeft: "1pt solid #000",
    borderRight: "1pt solid #000",
    marginBottom: 0,
  },
  nameCell: {
    flex: 1,
    padding: "4pt 6pt",
    borderRight: "1pt solid #000",
  },
  nameCellLast: {
    flex: 1,
    padding: "4pt 6pt",
  },
  nameValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    borderBottom: "0.5pt solid #000",
    marginBottom: 2,
    paddingBottom: 2,
  },
  nameLabel: {
    fontSize: 7,
    color: "#555",
    textAlign: "center",
  },

  // Certification text
  certText: {
    fontSize: 7.5,
    marginVertical: 8,
    lineHeight: 1.5,
    textAlign: "justify",
  },

  // Main table
  table: {
    borderTop: "1pt solid #000",
    borderLeft: "1pt solid #000",
    borderRight: "1pt solid #000",
  },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottom: "1pt solid #000",
    backgroundColor: "#f0f0f0",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "0.5pt solid #888",
    minHeight: 20,
  },
  tableRowAlt: {
    flexDirection: "row",
    borderBottom: "0.5pt solid #888",
    minHeight: 20,
    backgroundColor: "#fafafa",
  },

  // Table cells
  cellService: { width: "22%", borderRight: "0.5pt solid #888", padding: "3pt 4pt" },
  cellDesignation: { width: "16%", borderRight: "0.5pt solid #888", padding: "3pt 4pt" },
  cellStatus: { width: "13%", borderRight: "0.5pt solid #888", padding: "3pt 4pt" },
  cellType: { width: "14%", borderRight: "0.5pt solid #888", padding: "3pt 4pt" },
  cellOffice: { width: "25%", borderRight: "0.5pt solid #888", padding: "3pt 4pt" },
  cellMemo: { width: "10%", padding: "3pt 4pt" },

  cellHeader: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
  },
  cellText: {
    fontSize: 7.5,
    textAlign: "center",
  },
  cellTextLeft: {
    fontSize: 7.5,
  },

  // Sub header for "Service" column
  subHeaderRow: {
    flexDirection: "row",
    borderBottom: "0.5pt solid #888",
  },
  subCell: {
    flex: 1,
    borderRight: "0.5pt solid #888",
    padding: "2pt 4pt",
    textAlign: "center",
    fontSize: 7,
  },

  // Gov IDs section
  govSection: {
    marginTop: 8,
    border: "1pt solid #000",
    padding: "6pt 8pt",
  },
  govTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    marginBottom: 6,
    borderBottom: "0.5pt solid #ccc",
    paddingBottom: 3,
  },
  govRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  govLabel: {
    width: 100,
    fontSize: 7.5,
    color: "#555",
    fontFamily: "Helvetica-Bold",
  },
  govValue: {
    flex: 1,
    fontSize: 7.5,
    borderBottom: "0.5pt solid #ccc",
  },
  govSpacer: {
    width: 20,
  },

  // Trainings section
  trainSection: {
    marginTop: 8,
    border: "1pt solid #000",
  },
  trainTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    padding: "4pt 8pt",
    borderBottom: "0.5pt solid #000",
    backgroundColor: "#f0f0f0",
  },
  trainHeaderRow: {
    flexDirection: "row",
    borderBottom: "0.5pt solid #888",
    backgroundColor: "#f8f8f8",
    padding: "3pt 6pt",
  },
  trainRow: {
    flexDirection: "row",
    borderBottom: "0.5pt solid #eee",
    padding: "3pt 6pt",
  },
  trainRowAlt: {
    flexDirection: "row",
    borderBottom: "0.5pt solid #eee",
    padding: "3pt 6pt",
    backgroundColor: "#fafafa",
  },

  // Signature
  signatureArea: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBlock: {
    width: "45%",
  },
  signatureLine: {
    borderTop: "1pt solid #000",
    marginTop: 30,
    marginBottom: 3,
  },
  signatureName: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    textTransform: "uppercase",
  },
  signatureRole: {
    fontSize: 7.5,
    textAlign: "center",
    color: "#444",
  },
  signatureDate: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  signatureDateLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
  signatureDateLine: {
    flex: 1,
    borderBottom: "0.5pt solid #000",
    height: 10,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: "0.5pt solid #ccc",
    paddingTop: 4,
  },
  footerText: {
    fontSize: 6.5,
    color: "#888",
  },
});

function fmt(date: string | null | undefined) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-PH", {
    year: "numeric", month: "2-digit", day: "2-digit",
  });
}

function computeYearsOfService(originalDate: string | null | undefined): string {
  if (!originalDate) return "—";
  const start = new Date(originalDate.split("T")[0]);
  const now = new Date();
  const totalMonths =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());
  const y = Math.floor(totalMonths / 12);
  const m = totalMonths % 12;
  return `${y} yr${y !== 1 ? "s" : ""} ${m} mo${m !== 1 ? "s" : ""}`;
}

export type ServiceRecordData = {
  profile: {
    firstName: string | null;
    middleInitial: string | null;
    lastName: string | null;
    dateOfBirth: string | null;
    gender: string | null;
    civilStatus: string | null;
    nationality: string | null;
    address: string | null;
    email: string | null;
    contactNumber: string | null;
    pagibigNo: string | null;
    philHealthNo: string | null;
    gsisNo: string | null;
    tinNo: string | null;
    bachelorsDegree: string | null;
    postGraduate: string | null;
    subjectSpecialization: string | null;
  };
  hr: {
    employeeId: string | null;
    plantillaNo: string | null;
    position: string | null;
    dateOfOriginalAppointment: string | null;
    dateOfLatestAppointment: string | null;
  };
  appointments: {
    id: string;
    appointment_type: string;
    position: string;
    start_date: string | null;
    end_date: string | null;
    memo_no: string | null;
    remarks: string | null;
  }[];
  trainings: {
    title: string;
    type: string;
    startDate: string;
    endDate: string;
    totalHours: string;
    sponsor: string;
    status: string;
  }[];
  schoolName?: string;
  division?: string;
  region?: string;
  generatedAt: string;
};

export function ServiceRecordDocument({ data }: { data: ServiceRecordData }) {
  const { profile, hr, appointments, trainings } = data;

  const lastName = profile.lastName ?? "";
  const firstName = profile.firstName ?? "";
  const middleInitial = profile.middleInitial ?? "";
  const fullName = `${firstName} ${middleInitial ? middleInitial + " " : ""}${lastName}`.trim();

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerRepublic}>Republic of the Philippines</Text>
          <Text style={styles.headerSub}>Department of Education</Text>
          {data.region && <Text style={styles.headerSub}>{data.region}</Text>}
          {data.division && <Text style={styles.headerDivision}>{data.division}</Text>}
          {data.schoolName && <Text style={styles.headerCity}>{data.schoolName}</Text>}
        </View>

        <Text style={styles.docTitle}>Service Record</Text>
        <Text style={styles.docSubtitle}>(To be accomplished by Employee)</Text>

        {/* Name Row */}
        <View style={styles.nameRow}>
          <View style={styles.nameCell}>
            <Text style={styles.nameValue}>{lastName}</Text>
            <Text style={styles.nameLabel}>(Last Name)</Text>
          </View>
          <View style={styles.nameCell}>
            <Text style={styles.nameValue}>{firstName}</Text>
            <Text style={styles.nameLabel}>(Given Name)</Text>
          </View>
          <View style={styles.nameCell}>
            <Text style={styles.nameValue}>{middleInitial}</Text>
            <Text style={styles.nameLabel}>(Middle Name)</Text>
          </View>
          <View style={styles.nameCellLast}>
            <Text style={styles.nameValue}>{fmt(profile.dateOfBirth)}</Text>
            <Text style={styles.nameLabel}>(Date of Birth)</Text>
          </View>
        </View>

        {/* Address row */}
        <View style={[styles.nameRow, { borderTop: "0.5pt solid #000" }]}>
          <View style={[styles.nameCell, { flex: 2 }]}>
            <Text style={styles.nameValue}>{profile.address || "—"}</Text>
            <Text style={styles.nameLabel}>(Address)</Text>
          </View>
          <View style={styles.nameCell}>
            <Text style={styles.nameValue}>{profile.gender || "—"}</Text>
            <Text style={styles.nameLabel}>(Gender)</Text>
          </View>
          <View style={styles.nameCellLast}>
            <Text style={styles.nameValue}>{profile.civilStatus || "—"}</Text>
            <Text style={styles.nameLabel}>(Civil Status)</Text>
          </View>
        </View>

        {/* Certification text */}
        <Text style={styles.certText}>
          This is to certify that the employee named above has actually rendered services in this office as shown by the service record below,
          each line of which is supported by appointment and other papers actually issued and approved by the authorities concerned.
        </Text>

        {/* Main Appointment Table */}
        <View style={styles.table}>
          {/* Table header */}
          <View style={styles.tableHeaderRow}>
            <View style={[styles.cellService, { alignItems: "center" }]}>
              <Text style={styles.cellHeader}>Inclusive Dates of Service</Text>
            </View>
            <View style={[styles.cellDesignation, { alignItems: "center" }]}>
              <Text style={styles.cellHeader}>Designation / Position</Text>
            </View>
            <View style={[styles.cellStatus, { alignItems: "center" }]}>
              <Text style={styles.cellHeader}>Appointment Type</Text>
            </View>
            <View style={[styles.cellType, { alignItems: "center" }]}>
              <Text style={styles.cellHeader}>Employee ID / Plantilla</Text>
            </View>
            <View style={[styles.cellOffice, { alignItems: "center" }]}>
              <Text style={styles.cellHeader}>Office / Station Assignment</Text>
            </View>
            <View style={[styles.cellMemo, { alignItems: "center" }]}>
              <Text style={styles.cellHeader}>Memo No.</Text>
            </View>
          </View>

          {/* Sub header for dates */}
          <View style={[styles.tableHeaderRow, { backgroundColor: "#f8f8f8" }]}>
            <View style={[styles.cellService]}>
              <View style={{ flexDirection: "row" }}>
                <Text style={[styles.cellHeader, { flex: 1, textAlign: "center" }]}>From</Text>
                <Text style={[styles.cellHeader, { flex: 1, textAlign: "center" }]}>To</Text>
              </View>
            </View>
            <View style={styles.cellDesignation} />
            <View style={styles.cellStatus} />
            <View style={styles.cellType} />
            <View style={styles.cellOffice} />
            <View style={styles.cellMemo} />
          </View>

          {/* Appointment rows */}
          {appointments.length === 0 ? (
            <View style={styles.tableRow}>
              <View style={{ flex: 1, padding: "6pt", alignItems: "center" }}>
                <Text style={[styles.cellText, { color: "#888" }]}>No appointment records found.</Text>
              </View>
            </View>
          ) : (
            appointments.map((a, i) => (
              <View key={a.id} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <View style={styles.cellService}>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={[styles.cellText, { flex: 1 }]}>{fmt(a.start_date)}</Text>
                    <Text style={[styles.cellText, { flex: 1 }]}>{a.end_date ? fmt(a.end_date) : "Present"}</Text>
                  </View>
                </View>
                <View style={styles.cellDesignation}>
                  <Text style={styles.cellTextLeft}>{a.position}</Text>
                </View>
                <View style={styles.cellStatus}>
                  <Text style={styles.cellText}>{a.appointment_type}</Text>
                </View>
                <View style={styles.cellType}>
                  <Text style={styles.cellText}>{hr.employeeId || "—"}</Text>
                  {hr.plantillaNo && (
                    <Text style={[styles.cellText, { color: "#666", fontSize: 6.5 }]}>
                      {hr.plantillaNo}
                    </Text>
                  )}
                </View>
                <View style={styles.cellOffice}>
                  <Text style={styles.cellTextLeft}>{data.schoolName || "—"}</Text>
                </View>
                <View style={styles.cellMemo}>
                  <Text style={styles.cellText}>{a.memo_no || "—"}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Government IDs + Education side by side */}
        <View wrap={false} style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
          <View style={[styles.govSection, { flex: 1 }]}>
            <Text style={styles.govTitle}>Government IDs</Text>
            <View style={styles.govRow}>
              <Text style={styles.govLabel}>GSIS No.:</Text>
              <Text style={styles.govValue}>{profile.gsisNo || "—"}</Text>
              <View style={styles.govSpacer} />
              <Text style={styles.govLabel}>TIN No.:</Text>
              <Text style={styles.govValue}>{profile.tinNo || "—"}</Text>
            </View>
            <View style={styles.govRow}>
              <Text style={styles.govLabel}>PAG-IBIG No.:</Text>
              <Text style={styles.govValue}>{profile.pagibigNo || "—"}</Text>
              <View style={styles.govSpacer} />
              <Text style={styles.govLabel}>PhilHealth No.:</Text>
              <Text style={styles.govValue}>{profile.philHealthNo || "—"}</Text>
            </View>
            <View style={[styles.govRow, { marginTop: 4 }]}>
              <Text style={styles.govLabel}>Years of Service:</Text>
              <Text style={[styles.govValue, { fontFamily: "Helvetica-Bold" }]}>
                {computeYearsOfService(hr.dateOfOriginalAppointment)}
              </Text>
            </View>
          </View>

          <View style={[styles.govSection, { flex: 1 }]}>
            <Text style={styles.govTitle}>Educational Background</Text>
            <View style={styles.govRow}>
              <Text style={styles.govLabel}>Bachelors Degree:</Text>
              <Text style={styles.govValue}>{profile.bachelorsDegree || "—"}</Text>
            </View>
            <View style={styles.govRow}>
              <Text style={styles.govLabel}>Post Graduate:</Text>
              <Text style={styles.govValue}>{profile.postGraduate || "—"}</Text>
            </View>
            <View style={styles.govRow}>
              <Text style={styles.govLabel}>Specialization:</Text>
              <Text style={styles.govValue}>{profile.subjectSpecialization || "—"}</Text>
            </View>
          </View>
        </View>

        {/* Trainings */}
        <View wrap={false} style={styles.trainSection}>
          <Text style={styles.trainTitle}>
            Trainings & Seminars Attended ({trainings.length} record{trainings.length !== 1 ? "s" : ""})
          </Text>
          <View style={styles.trainHeaderRow}>
            <Text style={[styles.cellHeader, { flex: 3 }]}>Title</Text>
            <Text style={[styles.cellHeader, { flex: 1 }]}>Type</Text>
            <Text style={[styles.cellHeader, { flex: 1.5 }]}>Date</Text>
            <Text style={[styles.cellHeader, { flex: 0.7 }]}>Hours</Text>
            <Text style={[styles.cellHeader, { flex: 1.5 }]}>Sponsor</Text>
          </View>
          {trainings.length === 0 ? (
            <View style={[styles.trainRow, { justifyContent: "center" }]}>
              <Text style={[styles.cellText, { color: "#888" }]}>No training records found.</Text>
            </View>
          ) : (
            trainings.map((t, i) => (
              <View key={i} style={i % 2 === 0 ? styles.trainRow : styles.trainRowAlt}>
                <Text style={[styles.cellTextLeft, { flex: 3 }]}>{t.title}</Text>
                <Text style={[styles.cellText, { flex: 1 }]}>{t.type || "—"}</Text>
                <Text style={[styles.cellText, { flex: 1.5 }]}>
                  {t.startDate ? fmt(t.startDate) : "—"}
                  {t.endDate && t.endDate !== t.startDate ? ` - ${fmt(t.endDate)}` : ""}
                </Text>
                <Text style={[styles.cellText, { flex: 0.7 }]}>{t.totalHours || "—"}</Text>
                <Text style={[styles.cellTextLeft, { flex: 1.5 }]}>{t.sponsor || "—"}</Text>
              </View>
            ))
          )}
        </View>

        {/* Signature Block */}
        <View style={{ marginTop: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
            {/* Date left */}
            <View style={{ width: "20%" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold" }}>Date: </Text>
                <View style={{ flex: 1, borderBottom: "1pt solid #000", height: 10 }} />
                </View>
            </View>

            {/* Signature right */}
            <View wrap={false} style={{ marginTop: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
            <View style={{ width: "40%" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                
                <View style={{ flex: 1, borderBottom: "1pt solid #000", height: 10 }} />
                </View>
            </View>
            <View style={{ width: "45%", alignItems: "center" }}>
                <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", marginBottom: 24 }}>
                CERTIFIED CORRECT:
                </Text>
                <View style={{ borderTop: "1pt solid #000", width: "100%", marginBottom: 3 }} />
                <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", textAlign: "center" }}>
                ____________________
                </Text>
                <Text style={{ fontSize: 7.5, textAlign: "center", color: "#444" }}>
                Administrative Officer / School Head
                </Text>
            </View>
            </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Generated: {data.generatedAt}</Text>
          <Text style={styles.footerText}>EduTrack — Official Service Record</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}