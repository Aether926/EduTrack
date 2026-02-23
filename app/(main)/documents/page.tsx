import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getMyDocumentChecklist } from "@/features/documents/actions/document-actions";
import { DocumentsChecklistCard } from "@/features/documents/components/document-checklist-card";
import { FileText } from "lucide-react";

export default async function DocumentsPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const items = await getMyDocumentChecklist();

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="flex items-center gap-3">
          <FileText className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My 201 File</h1>
            <p className="text-sm text-muted-foreground">
              Upload and track your required documents.
            </p>
          </div>
        </header>

        <DocumentsChecklistCard items={items} />
      </div>
    </main>
  );
}